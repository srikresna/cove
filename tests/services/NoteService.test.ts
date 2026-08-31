import { describe, expect, it } from "vitest";
import * as Y from "yjs";
import { NotFoundError } from "@/domain/errors";
import { EMPTY_NOTE_CONTENT } from "@/domain/note/notePolicy";
import { VaultLockedError } from "@/errors/AppError";
import { packBlockSuiteContent } from "@/services/editor/contentFormat";
import { encodeDocSnapshot } from "@/services/editor/yjsCodec";
import { NoteService } from "@/services/NoteService";
import { titleAad } from "@/services/vault/aad";
import type { EncryptedPayload, IEncryptionService } from "@/services/vault/IEncryptionService";
import { InMemoryNoteLinkRepository } from "../fakes/InMemoryNoteLinkRepository";
import { InMemoryNoteRepository } from "../fakes/InMemoryNoteRepository";

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

function blockSuiteWithBlobs(...blobIds: string[]): string {
  const doc = new Y.Doc();
  const blocks = doc.getMap("blocks");
  const page = new Y.Map();
  blocks.set("page", page);
  page.set("sys:id", "page");
  page.set("sys:flavour", "affine:page");
  page.set("sys:children", Y.Array.from(blobIds.map((_, i) => `img-${i}`)));
  blobIds.forEach((id, i) => {
    const img = new Y.Map();
    blocks.set(`img-${i}`, img);
    img.set("sys:id", `img-${i}`);
    img.set("sys:flavour", "affine:image");
    img.set("sys:children", Y.Array.from([]));
    img.set("prop:source", id);
  });
  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

const unlockedCrypto: IEncryptionService = {
  isUnlocked: () => true,
  setSessionKeys: async () => {},
  clearSessionKeys: () => {},
  getIvCounter: () => 0,
  advanceCounterTo: () => {},
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
  advanceCounterTo: () => {},
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

  it("concurrent creates mint DISTINCT tail keys (double-click race)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    // Two overlapping creates — the exact interleaving a fast double-click
    // produces: both mints run before either INSERT lands, so a DB-only
    // max would return the same value twice and mint duplicate keys.
    const [a, b] = await Promise.all([
      service.createNote("ws-race", "First"),
      service.createNote("ws-race", "Second"),
    ]);

    expect(a?.orderIndex).toBeDefined();
    expect(b?.orderIndex).toBeDefined();
    expect(a?.orderIndex).not.toBe(b?.orderIndex);
    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-race")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("concurrent reorder and create stay key-unique", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const a = await service.createNote("ws-race", "A");
    const b = await service.createNote("ws-race", "B");

    await Promise.all([
      service.reorderNote(a.id, b.id, "after"),
      service.createNote("ws-race", "C"),
    ]);

    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-race")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("trashing then creating never re-mints the trashed note's key", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const x = await service.createNote("ws-1", "X");

    await service.trashNote(x.id);
    await service.createNote("ws-1", "Y");
    await service.restoreNote(x.id);

    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-1")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("moving a note to another workspace re-keys it at the destination tail", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const src = await service.createNote("ws-1", "M");
    const dst = await service.createNote("ws-2", "D");

    const moved = await service.updateMetadata(src.id, { workspaceId: "ws-2" });

    expect(moved.orderIndex).toBeDefined();
    expect(moved.orderIndex).not.toBe(dst.orderIndex);
    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-2")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("a drag into a gap whose midpoint key belongs to a trashed note never re-mints it", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    // Consecutive tail mints produce keys one midpoint apart, so the trashed
    // note's key is exactly generateKeyBetween(its neighbors).
    const a = await service.createNote("ws-1", "A");
    const t = await service.createNote("ws-1", "T");
    const c = await service.createNote("ws-1", "C");
    const b = await service.createNote("ws-1", "B");

    await service.trashNote(t.id);
    await service.reorderNote(b.id, c.id, "before");
    await service.restoreNote(t.id);

    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-1")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
    expect(b.orderIndex).toBeDefined();
    expect(a.orderIndex).toBeDefined();
  });

  it("a drag never mints the key of a hidden (undecryptable) live note", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());
    const a = await service.createNote("ws-1", "A");
    const c = await service.createNote("ws-1", "C");
    const d = await service.createNote("ws-1", "D");
    expect(a.orderIndex).toBe("a0");
    expect(c.orderIndex).toBe("a1");
    // A corrupt-title note hidden from every list, sitting exactly at the
    // a0..a1 midpoint.
    fakeRepo.notes.push({
      id: "hidden",
      workspaceId: "ws-1",
      title: enc("corrupt"),
      titleKmsVersion: 1,
      content: enc(""),
      isPinned: false,
      isFavorite: false,
      createdAt: 1,
      updatedAt: 1,
      orderIndex: "a0V",
    });

    await service.reorderNote(d.id, c.id, "before");

    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-1")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("restoring onto a legacy duplicate key re-keys the restored note at the tail", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const x = await service.createNote("ws-1", "X");
    await service.trashNote(x.id);
    // Pre-existing damage: another live row already holds X's key.
    fakeRepo.notes.push({
      id: "squat",
      workspaceId: "ws-1",
      title: enc("Squat"),
      titleKmsVersion: 0,
      content: enc(""),
      isPinned: false,
      isFavorite: false,
      createdAt: 1,
      updatedAt: 1,
      orderIndex: x.orderIndex,
    });

    await service.restoreNote(x.id);

    const keys = fakeRepo.notes
      .filter((n) => n.workspaceId === "ws-1")
      .map((n) => n.orderIndex ?? "");
    expect(new Set(keys).size).toBe(keys.length);
  });

  it("a failed link write after a successful insert removes the note row (no half-created note)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const links = new InMemoryNoteLinkRepository();
    links.shouldFail = true;
    const service = new NoteService(fakeRepo, unlockedCrypto, links);

    await expect(service.createNote("ws-1", "Title", "body")).rejects.toThrow();
    expect(fakeRepo.notes).toHaveLength(0);
  });

  it("a corrupt title degrades per note instead of failing the whole list", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());
    fakeRepo.notes.push(
      {
        id: "good",
        workspaceId: "ws-1",
        title: `enc[${titleAad("good")}]:Good` as EncryptedPayload,
        titleKmsVersion: 1,
        content: enc(""),
        isPinned: false,
        isFavorite: false,
        createdAt: 1000,
        updatedAt: 2000,
      },
      {
        id: "bad",
        workspaceId: "ws-1",
        title: enc("ciphertext-that-fails-its-aad-check"),
        titleKmsVersion: 1,
        content: enc(""),
        isPinned: false,
        isFavorite: false,
        createdAt: 1000,
        updatedAt: 2000,
        deletedAt: 3000,
      },
    );

    const notes = await service.listMetadataByWorkspace("ws-1");
    expect(notes.map((n) => n.id)).toEqual(["good"]);

    const trash = await service.listTrash();
    expect(trash.map((n) => n.id)).toEqual([]);
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

  it("encrypts titles under the title AAD with titleKmsVersion 1 at rest", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());

    const created = await service.createNote("ws-1", "Title", "body");
    expect(fakeRepo.notes[0]?.title).toBe(`enc[${titleAad(created.id)}]:Title`);
    expect(fakeRepo.notes[0]?.titleKmsVersion).toBe(1);

    const updated = await service.updateMetadata(created.id, { title: "T" });
    expect(updated.title).toBe("T");
    expect(fakeRepo.notes[0]?.title).toBe(`enc[${titleAad(created.id)}]:T`);
    expect(fakeRepo.notes[0]?.titleKmsVersion).toBe(1);

    const fetched = await service.getNote(created.id);
    expect(fetched?.title).toBe("T");
  });

  it("createNoteWithId stores encrypted title/content at rest but returns plaintext", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, envelopeCrypto, new InMemoryNoteLinkRepository());

    const note = await service.createNoteWithId("ws-1", "fixed-id-7", "My Fixed Title");
    expect(note.id).toBe("fixed-id-7");
    expect(note.title).toBe("My Fixed Title");
    expect(note.content).toBe(EMPTY_NOTE_CONTENT);

    const row = fakeRepo.notes[0];
    if (!row) throw new Error("note row missing");
    expect(row.title).toBe(`enc[${titleAad("fixed-id-7")}]:My Fixed Title`);
    expect(row.titleKmsVersion).toBe(1);
    expect(row.content).toBe(`enc[fixed-id-7]:${EMPTY_NOTE_CONTENT}`);

    const fetched = await service.getNote("fixed-id-7");
    expect(fetched?.title).toBe("My Fixed Title");
    expect(fetched?.content).toBe(EMPTY_NOTE_CONTENT);
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

  it("searches beyond the first thousand notes via keyset pagination", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo, unlockedCrypto, new InMemoryNoteLinkRepository());

    for (let i = 0; i < 1200; i++) {
      fakeRepo.notes.push({
        id: `note-${String(i).padStart(4, "0")}`,
        workspaceId: "ws-1",
        title: `Filler ${i}` as EncryptedPayload,
        titleKmsVersion: 0,
        content: "filler body" as EncryptedPayload,
        isPinned: false,
        isFavorite: false,
        createdAt: 1000 + i,
        updatedAt: 5000 - i,
      });
    }
    fakeRepo.notes.push({
      id: "note-deep-target",
      workspaceId: "ws-1",
      title: "Deep needle title" as EncryptedPayload,
      titleKmsVersion: 0,
      content: "no body match here" as EncryptedPayload,
      isPinned: false,
      isFavorite: false,
      createdAt: 1,
      updatedAt: 1,
    });

    const hits = await service.searchAcrossWorkspaces("deep needle");

    expect(hits).toHaveLength(1);
    expect(hits[0]?.id).toBe("note-deep-target");
  });

  it("workspace blob GC deletes only blobs no longer referenced by any note", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const deleted: string[] = [];
    const blobSource = {
      list: async () => ["blob-shared", "blob-only-ws1"],
      delete: async (key: string) => {
        deleted.push(key);
      },
    };
    const service = new NoteService(
      fakeRepo,
      unlockedCrypto,
      new InMemoryNoteLinkRepository(),
      blobSource,
    );

    const n1 = await service.createNote("ws-1", "Has images");
    await service.updateContent(n1.id, blockSuiteWithBlobs("blob-shared", "blob-only-ws1"));
    const n2 = await service.createNote("ws-2", "Keeps shared");
    await service.updateContent(n2.id, blockSuiteWithBlobs("blob-shared"));

    const candidates = await service.collectWorkspaceBlobCandidates("ws-1");
    expect(candidates).toEqual(expect.arrayContaining(["blob-shared", "blob-only-ws1"]));

    await fakeRepo.deleteNotesByWorkspace("ws-1");
    await service.gcOrphanBlobs(candidates);

    expect(deleted).toEqual(["blob-only-ws1"]);
  });
});
