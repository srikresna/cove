import { describe, expect, it } from "vitest";
import { NotFoundError } from "../domain/errors";
import { InMemoryNoteRepository } from "../test/fakes/InMemoryNoteRepository";
import { NoteService } from "./NoteService";

describe("NoteService", () => {
  it("listMetadataByWorkspace calls getNotesMetadataByWorkspace", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo);

    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: "Test Note",
      content: "Secret content",
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
    const service = new NoteService(fakeRepo);

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

  it("duplicateNote copies content and title with (Copy)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo);

    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: "Original",
      content: "Hello World",
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
    const service = new NoteService(fakeRepo);

    await expect(service.duplicateNote("non-existent")).rejects.toThrow(NotFoundError);
  });

  it("togglePin and toggleFavorite toggle flags", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo);

    fakeRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: "Test",
      content: "",
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

  it("re-throws repository errors (fail fast)", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    fakeRepo.shouldFail = true;
    const service = new NoteService(fakeRepo);

    await expect(service.listMetadataByWorkspace("ws-1")).rejects.toThrow();
  });

  it("searchAcrossWorkspaces matches title and body, returning snippet DTOs", async () => {
    const fakeRepo = new InMemoryNoteRepository();
    const service = new NoteService(fakeRepo);

    fakeRepo.notes.push({
      id: "n-search",
      workspaceId: "ws-1",
      title: "Roadmap",
      content:
        '[{"type":"paragraph","content":[{"type":"text","text":"Launch the encrypted vault feature soon"}]}]',
      icon: "🚀",
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 3000,
    });

    const byTitle = await service.searchAcrossWorkspaces("roadmap");
    expect(byTitle).toHaveLength(1);
    expect(byTitle[0]?.id).toBe("n-search");
    expect(byTitle[0]?.snippet).toBe(""); // title-only match -> empty snippet

    const byBody = await service.searchAcrossWorkspaces("vault");
    expect(byBody).toHaveLength(1);
    expect(byBody[0]?.snippet.toLowerCase()).toContain("vault");

    const none = await service.searchAcrossWorkspaces("nonexistent-term-xyz");
    expect(none).toHaveLength(0);
  });
});
