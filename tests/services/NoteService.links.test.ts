import { NoteService } from "@/services/NoteService";
import type { EncryptedPayload, IEncryptionService } from "@/services/vault/IEncryptionService";
import { extractNoteLinkIds } from "@/utils/noteLinks";
import { describe, expect, it } from "vitest";
import { InMemoryNoteLinkRepository } from "../fakes/InMemoryNoteLinkRepository";
import { InMemoryNoteRepository } from "../fakes/InMemoryNoteRepository";

const unlockedCrypto: IEncryptionService = {
  isUnlocked: () => true,
  setSessionKeys: async () => {},
  clearSessionKeys: () => {},
  getIvCounter: () => 0,
  encryptPayload: async (p: string) => p as EncryptedPayload,
  decryptPayload: async (c: string) => c,
};

const linkTo = (noteId: string, text = "linked") =>
  JSON.stringify([
    {
      type: "paragraph",
      content: [
        { type: "text", text: "see " },
        { type: "noteLink", props: { noteId, title: text } },
      ],
      children: [],
    },
  ]);

describe("extractNoteLinkIds", () => {
  it("finds link ids in top-level and nested blocks, deduplicated", () => {
    const content = JSON.stringify([
      {
        type: "paragraph",
        content: [{ type: "noteLink", props: { noteId: "a" } }],
        children: [
          {
            type: "bulletListItem",
            content: [
              { type: "noteLink", props: { noteId: "b" } },
              { type: "noteLink", props: { noteId: "a" } },
            ],
          },
        ],
      },
    ]);
    expect(extractNoteLinkIds(content).sort()).toEqual(["a", "b"]);
  });

  it("returns empty for plain text, invalid JSON, and empty content", () => {
    expect(extractNoteLinkIds("")).toEqual([]);
    expect(extractNoteLinkIds("not json")).toEqual([]);
    expect(
      extractNoteLinkIds('[{"type":"paragraph","content":[{"type":"text","text":"x"}]}]'),
    ).toEqual([]);
  });
});

describe("NoteService link index", () => {
  it("indexes links on create and rewrites them on content update", async () => {
    const repo = new InMemoryNoteRepository();
    const links = new InMemoryNoteLinkRepository();
    const service = new NoteService(repo, unlockedCrypto, links);

    const target = await service.createNote("ws-1", "Target");
    const source = await service.createNote("ws-1", "Source", linkTo(target.id));
    expect(await service.backlinksOf(target.id)).toEqual([
      { id: source.id, workspaceId: "ws-1", title: "Source", icon: source.icon },
    ]);

    const other = await service.createNote("ws-1", "Other");
    await service.updateContent(source.id, linkTo(other.id));
    expect(await service.backlinksOf(target.id)).toEqual([]);
    expect((await service.backlinksOf(other.id)).map((m) => m.id)).toEqual([source.id]);
  });

  it("getLinkTargets returns metadata without content", async () => {
    const repo = new InMemoryNoteRepository();
    const service = new NoteService(repo, unlockedCrypto, new InMemoryNoteLinkRepository());
    const a = await service.createNote("ws-1", "A");
    const metas = await service.getLinkTargets([a.id, "missing"]);
    expect(metas).toEqual([{ id: a.id, workspaceId: "ws-1", title: "A", icon: a.icon }]);
  });
});
