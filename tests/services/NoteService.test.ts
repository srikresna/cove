import { NotFoundError } from "@/domain/errors";
import { VaultLockedError } from "@/errors/AppError";
import { NoteService } from "@/services/NoteService";
import { packBlockSuiteContent } from "@/services/editor/contentFormat";
import { encodeDocSnapshot } from "@/services/editor/yjsCodec";
import type { EncryptedPayload, IEncryptionService } from "@/services/vault/IEncryptionService";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { InMemoryNoteLinkRepository } from "../fakes/InMemoryNoteLinkRepository";
import { InMemoryNoteRepository } from "../fakes/InMemoryNoteRepository";

/** Build a BlockSuite envelope with a single paragraph of body text. */
function blockSuiteWithText(text: string): string {
  const doc = new Y.Doc();
  const blocks = doc.getMap("blocks");
  const page = new Y.Map();
  blocks.set("page", page);
  page.set("sys:id", "page");
  page.set("sys:flavour", "affine:page");
  page.set("sys:children", Y.Array.from(["note"]));
  const note = new Y.Map();
  blocks.set("note", note);
  note.set("sys:id", "note");
  note.set("sys:flavour", "affine:note");
  note.set("sys:children", Y.Array.from(["p"]));
  const p = new Y.Map();
  blocks.set("p", p);
  p.set("sys:id", "p");
  p.set("sys:flavour", "affine:paragraph");
  p.set("sys:children", Y.Array.from([]));
  const t = new Y.Text();
  p.set("prop:text", t);
  t.insert(0, text);
  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

const unlockedCrypto: IEncryptionService = {
  isUnlocked: () => true,
  setSessionKeys: async () => {},
  clearSessionKeys: () => {},
  getIvCounter: () => 0,
  encryptBlob: async () => "" as EncryptedPayload,
  decryptBlob: async () => new Uint8Array(0),
  encryptPayload: async (p: string) => p as EncryptedPayload,
  decryptPayload: async (c: string) => c,
};

const envelopeCrypto: IEncryptionService = {
  isUnlocked: () => true,
  setSessionKeys: async () => {},
  clearSessionKeys: () => {},
  getIvCounter: () => 0,
  encryptBlob: async () => "" as EncryptedPayload,
  decryptBlob: async () => new Uint8Array(0),
  encryptPayload: async (p: string, aad: string) => `enc[${aad}]:${p}` as EncryptedPayload,
  decryptPayload: async (c: string, aad: string) => {
    if (!c) return "";
    const prefix = `enc[${aad}]:`;
    if (!c.startsWith(prefix)) throw new Error("payload was not encrypted for this note");
    return c.slice(prefix.length);
  },
};

const lockedCrypto: IEncryptionService = {
  ...unlockedCrypto,
  isUnlocked: () => false,
};

const enc = (s: string): EncryptedPayload => s as EncryptedPayload;

describe("NoteService", () => {
  it("listMetadataByWorkspace calls getNotesMetadataByWorkspace", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: enc("Test Note"),
      titleKmsVersion: 0,
      content: enc("Secret content"),
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 2000,
    });

    const result = await service.listMetadataByWorkspace("ws-1");
    expect(result).toHaveLength(1);
    const first = result[0];
    expect(first).toBeDefined();
    if (first) {
      expect(first.content).toBe("");
    }
    expect(fakeRepo.callLog).toContain("getNotesMetadataByWorkspace");
  });

  it("getNote, createNote, updateMetadata, updateContent, and deleteNote work as expected", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    const created = await service.createNote("ws-1", "New Title", "New Content");
    expect(created.title).toBe("New Title");

    const fetched = await service.getNote(created.id);
    expect(fetched?.id).toBe(created.id);

    const updatedMeta = await service.updateMetadata(created.id, { title: "Updated Title" });
    expect(updatedMeta.title).toBe("Updated Title");

    const updatedContent = await service.updateContent(created.id, "Updated Content");
    expect(updatedContent.content).toBe("Updated Content");

    await service.deleteNote(created.id);
    const postDelete = await service.getNote(created.id);
    expect(postDelete).toBeNull();
  });

  it("encrypts content before it reaches the repository and decrypts on read", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());

    const created = await service.createNote("ws-1", "Title", "top secret body");
    expect(created.content).toBe("top secret body");
    expect(fakeRepo.notes[0]?.content).toBe(`enc[${created.id}]:top secret body`);

    const fetched = await service.getNote(created.id);
    expect(fetched?.content).toBe("top secret body");

    const updated = await service.updateContent(created.id, "new body");
    expect(updated.content).toBe("new body");
    expect(fakeRepo.notes[0]?.content).toBe(`enc[${created.id}]:new body`);

    const copy = await service.duplicateNote(created.id);
    expect(copy.content).toBe("new body");
    expect(fakeRepo.notes[0]?.content).toBe(`enc[${copy.id}]:new body`);
  });

  it("creates notes without a default icon or cover", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    const created = await service.createNote("ws-1");
    expect(created.icon).toBeUndefined();
    expect(created.coverColor).toBeUndefined();
  });

  it("encrypts cover images under the cover AAD and round-trips them", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());

    const created = await service.createNote("ws-1", "Title", "body");
    expect(await service.getCoverImage(created.id)).toBeNull();

    await service.setCoverImage(created.id, "data:image/webp;base64,abc");
    expect(fakeRepo.covers.get(created.id)).toBe(
      `enc[cover:${created.id}]:data:image/webp;base64,abc`,
    );
    expect(await service.getCoverImage(created.id)).toBe("data:image/webp;base64,abc");

    await service.removeCoverImage(created.id);
    expect(await service.getCoverImage(created.id)).toBeNull();
  });

  it("duplicateNote copies the cover color and re-encrypts the cover image for the copy", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());

    const src = await service.createNote("ws-1", "Original", "body");
    await service.updateMetadata(src.id, { coverColor: "#70d6ff" });
    await service.setCoverImage(src.id, "data:image/webp;base64,xyz");

    const copy = await service.duplicateNote(src.id);
    expect(copy.coverColor).toBe("#70d6ff");
    expect(fakeRepo.covers.get(copy.id)).toBe(`enc[cover:${copy.id}]:data:image/webp;base64,xyz`);
    expect(await service.getCoverImage(copy.id)).toBe("data:image/webp;base64,xyz");
  });

  it("every operation throws VaultLockedError when the vault is locked (H2 gate)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: enc("Test"),
      titleKmsVersion: 0,
      content: enc(""),
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 2000,
    });
    const service = new NoteService(fakeRepo, lockedCrypto, new InMemoryNoteLinkRepository());

    await expect(service.listMetadataByWorkspace("ws-1")).rejects.toThrow(VaultLockedError);
    await expect(service.getNote("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.searchAcrossWorkspaces("q")).rejects.toThrow(VaultLockedError);
    await expect(service.createNote("ws-1")).rejects.toThrow(VaultLockedError);
    await expect(service.updateMetadata("note-1", { title: "x" })).rejects.toThrow(
      VaultLockedError,
    );
    await expect(service.updateContent("note-1", "x")).rejects.toThrow(VaultLockedError);
    await expect(service.getCoverImage("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.setCoverImage("note-1", "data:x")).rejects.toThrow(VaultLockedError);
    await expect(service.removeCoverImage("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.deleteNote("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.trashNote("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.restoreNote("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.listTrash()).rejects.toThrow(VaultLockedError);
    await expect(service.purgeExpiredTrash()).rejects.toThrow(VaultLockedError);
    await expect(service.duplicateNote("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.togglePin("note-1")).rejects.toThrow(VaultLockedError);
    await expect(service.toggleFavorite("note-1")).rejects.toThrow(VaultLockedError);
    expect(fakeRepo.callLog).toHaveLength(0);
  });

  it("duplicateNote copies content and title with (Copy)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: enc("Original"),
      titleKmsVersion: 0,
      content: enc("Hello World"),
      icon: "🎨",
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 2000,
    });

    const duplicated = await service.duplicateNote("note-1");
    expect(duplicated.title).toBe("Original (Copy)");
    expect(duplicated.content).toBe("Hello World");
    expect(duplicated.icon).toBe("🎨");
    expect(fakeRepo.notes).toHaveLength(2);
  });

  it("duplicateNote throws NotFoundError for missing id", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    await expect(service.duplicateNote("non-existent")).rejects.toThrow(NotFoundError);
  });

  it("togglePin and toggleFavorite toggle flags", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: enc("Test"),
      titleKmsVersion: 0,
      content: enc(""),
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 2000,
    });

    const pinned = await service.togglePin("note-1");
    expect(pinned.isPinned).toBe(true);

    const fav = await service.toggleFavorite("note-1");
    expect(fav.isFavorite).toBe(true);

    await expect(service.togglePin("missing")).rejects.toThrow(NotFoundError);
    await expect(service.toggleFavorite("missing")).rejects.toThrow(NotFoundError);
  });

  it("trash hides a note from lists and search until restored", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const note = await service.createNote("ws-1", "Trashable", "body text here");

    await service.trashNote(note.id);
    expect(await service.listMetadataByWorkspace("ws-1")).toHaveLength(0);
    expect(await service.searchAcrossWorkspaces("trashable")).toHaveLength(0);

    const trash = await service.listTrash();
    expect(trash).toHaveLength(1);
    expect(trash[0]?.id).toBe(note.id);
    expect(trash[0]?.deletedAt).toBeGreaterThan(0);

    await service.restoreNote(note.id);
    expect(await service.listMetadataByWorkspace("ws-1")).toHaveLength(1);
    expect(await service.listTrash()).toHaveLength(0);
  });

  it("purgeExpiredTrash hard-deletes only notes past the retention window", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const expired = await service.createNote("ws-1", "Old");
    const fresh = await service.createNote("ws-1", "New");

    await service.trashNote(expired.id);
    await service.trashNote(fresh.id);
    fakeRepo.notes = fakeRepo.notes.map((n) =>
      n.id === expired.id ? { ...n, deletedAt: Date.now() - 31 * 24 * 60 * 60 * 1000 } : n,
    );

    const purged = await service.purgeExpiredTrash();
    expect(purged).toBe(1);
    expect(fakeRepo.notes.map((n) => n.id)).toEqual([fresh.id]);
    expect((await service.listTrash())[0]?.id).toBe(fresh.id);
  });

  it("re-throws repository errors (fail fast)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    fakeRepo.shouldFail = true;
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    await expect(service.listMetadataByWorkspace("ws-1")).rejects.toThrow();
  });

  it("searchAcrossWorkspaces matches title and body, returning snippet DTOs", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    fakeRepo.notes.push({
      id: "n-search",
      workspaceId: "ws-1",
      title: enc("Roadmap"),
      titleKmsVersion: 0,
      content: enc(blockSuiteWithText("Launch the encrypted vault feature soon")),
      icon: "🚀",
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 3000,
    });

    const byTitle = await service.searchAcrossWorkspaces("roadmap");
    expect(byTitle).toHaveLength(1);
    expect(byTitle[0]?.id).toBe("n-search");
    expect(byTitle[0]?.snippet).toBe("");

    const byBody = await service.searchAcrossWorkspaces("vault");
    expect(byBody).toHaveLength(1);
    expect(byBody[0]?.snippet.toLowerCase()).toContain("vault");

    const none = await service.searchAcrossWorkspaces("nonexistent-term-xyz");
    expect(none).toHaveLength(0);
  });
});
