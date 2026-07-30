import { NoteService } from "@/services/NoteService";
import { packBlockSuiteContent } from "@/services/editor/contentFormat";
import { encodeDocSnapshot } from "@/services/editor/yjsCodec";
import type { EncryptedPayload, IEncryptionService } from "@/services/vault/IEncryptionService";
import { extractNoteLinkIds } from "@/utils/noteLinks";
import { describe, expect, it } from "vitest";
import * as Y from "yjs";
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

function makeText(blocks: Y.Map<unknown>, id: string, text: string, linkId?: string) {
  const block = new Y.Map();
  blocks.set(id, block);
  block.set("sys:id", id);
  block.set("sys:flavour", "affine:paragraph");
  block.set("sys:children", Y.Array.from([]));
  const t = new Y.Text();
  block.set("prop:text", t);
  t.insert(0, text);
  if (linkId) {
    t.insert(t.length, "linked", { reference: { type: "LinkedPage", pageId: linkId } });
  }
}

/** Build a BlockSuite envelope whose body references `targetId`. */
function blockSuiteWithLink(targetId: string): string {
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
  makeText(blocks, "p", "see ", targetId);
  return packBlockSuiteContent(encodeDocSnapshot(doc));
}

describe("extractNoteLinkIds", () => {
  it("finds linked-doc references in a BlockSuite doc", () => {
    expect(extractNoteLinkIds(blockSuiteWithLink("target-1"))).toEqual(["target-1"]);
  });

  it("returns empty for plain text, invalid JSON, and empty content", () => {
    expect(extractNoteLinkIds("")).toEqual([]);
    expect(extractNoteLinkIds("not json")).toEqual([]);
  });
});

describe("NoteService link index", () => {
  it("indexes links on create and rewrites them on content update", async () => {
    const repo = new InMemoryNoteRepository();
    const links = new InMemoryNoteLinkRepository();
    const service = new NoteService(repo, unlockedCrypto, links);

    const target = await service.createNote("ws-1", "Target");
    const source = await service.createNote("ws-1", "Source", blockSuiteWithLink(target.id));
    expect(await service.backlinksOf(target.id)).toEqual([
      { id: source.id, workspaceId: "ws-1", title: "Source", icon: source.icon },
    ]);

    const other = await service.createNote("ws-1", "Other");
    await service.updateContent(source.id, blockSuiteWithLink(other.id));
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
