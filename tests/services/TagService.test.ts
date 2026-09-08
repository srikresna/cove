import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/domain/errors";
import type { Note } from "@/domain/note/Note";
import { TAG_COLORS, type Tag } from "@/domain/tag/Tag";
import { ValidationError } from "@/errors/AppError";
import type { INoteService } from "@/services/INoteService";
import { TagService } from "@/services/TagService";
import { InMemoryTagRepository } from "../fakes/InMemoryTagRepository";

function makeNoteLookup(workspacesByNote: Record<string, string>): INoteService {
  const notes = new Map<string, Note>(
    Object.entries(workspacesByNote).map(([id, workspaceId]) => [
      id,
      {
        id,
        workspaceId,
        title: "",
        content: "",
        isPinned: false,
        isFavorite: false,
        createdAt: 0,
        updatedAt: 0,
      } as Note,
    ]),
  );
  return {
    backlinksOf: () => Promise.resolve([]),
    outgoingLinksOf: () => Promise.resolve([]),
    getLinkTargets: () => Promise.resolve([]),
    listMetadataByWorkspace: () => Promise.resolve([]),
    getNote: async (id: string) => notes.get(id) ?? null,
    searchAcrossWorkspaces: () => Promise.resolve([]),
    createNote: () => {
      throw new Error("not implemented in fake");
    },
    createNoteWithId: () => {
      throw new Error("not implemented in fake");
    },
    updateMetadata: () => Promise.reject(new Error("not implemented in fake")),
    updateContent: () => Promise.reject(new Error("not implemented in fake")),
    getCoverImage: () => Promise.resolve(null),
    setCoverImage: () => Promise.resolve(),
    removeCoverImage: () => Promise.resolve(),
    deleteNote: () => Promise.resolve(),
    collectWorkspaceBlobCandidates: () => Promise.resolve([]),
    gcOrphanBlobs: () => Promise.resolve(),
    trashNote: () => Promise.resolve(),
    restoreNote: () => Promise.resolve(),
    listTrash: () => Promise.resolve([]),
    purgeExpiredTrash: () => Promise.resolve(0),
    duplicateNote: () => Promise.reject(new Error("not implemented in fake")),
    togglePin: () => Promise.reject(new Error("not implemented in fake")),
    toggleFavorite: () => Promise.reject(new Error("not implemented in fake")),
  } as unknown as INoteService;
}

const WS_A = "ws-a";
const WS_B = "ws-b";

function makeService(noteWorkspaces: Record<string, string> = { n1: WS_A, n2: WS_A, n3: WS_A }) {
  const repo = new InMemoryTagRepository();
  const service = new TagService(repo, makeNoteLookup(noteWorkspaces));
  return { repo, service };
}

describe("TagService", () => {
  it("creates a tag with the next palette color and attaches it to the note", async () => {
    const { service } = makeService();

    const first = await service.addTag("n1", "ideas");
    const second = await service.addTag("n1", "work");

    expect(first.color).toBe(TAG_COLORS[0]);
    expect(second.color).toBe(TAG_COLORS[1]);
    expect((await service.tagsForNote("n1")).map((t) => t.name)).toEqual(["ideas", "work"]);
  });

  it("reuses an existing tag by name within the same workspace only", async () => {
    const { repo, service } = makeService({ n1: WS_A, n2: WS_A, n3: WS_B });

    const created = await service.addTag("n1", "Ideas");
    const reused = await service.addTag("n2", "  ideas ");
    expect(reused.id).toBe(created.id);

    const other = await service.addTag("n3", "ideas");
    expect(other.id).not.toBe(created.id);
    expect(await repo.countInWorkspace(WS_A)).toBe(1);
    expect(await repo.countInWorkspace(WS_B)).toBe(1);
  });

  it("lists note ids for a tag", async () => {
    const { service } = makeService();

    const tag = await service.addTag("n1", "shared");
    await service.addTag("n2", "shared");
    await service.addTag("n3", "other");

    expect((await service.notesForTag(tag.id)).sort()).toEqual(["n1", "n2"]);
  });

  it("rejects empty names and removes tags from a note", async () => {
    const { repo, service } = makeService();

    await expect(service.addTag("n1", "   ")).rejects.toThrow(ValidationError);
    await expect(service.addTag("missing", "x")).rejects.toThrow(NotFoundError);

    const tag = await service.addTag("n1", "temp");
    await service.removeTag("n1", tag.id);
    expect(await service.tagsForNote("n1")).toEqual([]);
    expect(await repo.countInWorkspace(WS_A)).toBe(1);
  });

  it("cycles the palette after nine tags in a workspace", async () => {
    const { service } = makeService();
    for (let i = 0; i < TAG_COLORS.length; i++) {
      await service.addTag("n1", `tag-${i}`);
    }
    const wrapped = await service.addTag("n1", "tag-wrap");
    expect(wrapped.color).toBe(TAG_COLORS[0]);
  });

  it("renames, recolors, and deletes tags with workspace-scoped dedupe", async () => {
    const { service } = makeService({ n1: WS_A, n2: WS_A, n3: WS_B });
    const a = await service.addTag("n1", "Work");
    await service.addTag("n2", "Focus");
    const b = await service.addTag("n3", "Focus");

    await service.renameTag(a.id, "Deep Work");
    expect((await service.listTags(WS_A)).map((t: Tag) => t.name)).toEqual(["Deep Work", "Focus"]);

    await expect(service.renameTag(a.id, "focus")).rejects.toThrow(ValidationError);
    await expect(service.renameTag(b.id, "Deep Work")).resolves.toBeUndefined();

    await service.setTagColor(a.id, TAG_COLORS[4] as string);
    await expect(service.setTagColor(a.id, "#notacolor")).rejects.toThrow(ValidationError);
    expect((await service.listTags(WS_A))[0]?.color).toBe(TAG_COLORS[4]);

    await service.deleteTag(a.id);
    expect((await service.listTags(WS_A)).map((t: Tag) => t.name)).toEqual(["Focus"]);
    expect(await service.tagsForNote("n1")).toEqual([]);
    await expect(service.deleteTag(a.id)).rejects.toThrow(NotFoundError);
  });

  it("counts notes per tag within a workspace", async () => {
    const { service } = makeService({ n1: WS_A, n2: WS_A, n3: WS_B });
    const shared = await service.addTag("n1", "shared");
    await service.addTag("n2", "shared");
    await service.addTag("n3", "shared");

    const counts = await service.tagCounts(WS_A);
    expect(counts.find((c) => c.tagId === shared.id)?.noteCount).toBe(2);
  });
});
