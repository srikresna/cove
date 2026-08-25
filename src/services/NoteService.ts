import { generateKeyBetween } from "fractional-indexing";
import * as Y from "yjs";
import { NotFoundError } from "../domain/errors";
import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import {
  DEFAULT_NOTE_TITLE,
  duplicateNoteProps,
  EMPTY_NOTE_CONTENT,
  makeNoteId,
  trashPurgeCutoff,
} from "../domain/note/notePolicy";
import { VaultLockedError } from "../errors/AppError";
import type { INoteLinkRepository } from "../repositories/INoteLinkRepository";
import type { INoteRepository, NoteRecord } from "../repositories/INoteRepository";
import { extractNoteLinkIds } from "../utils/noteLinks";
import { buildSnippet, extractPlainText } from "../utils/plainText";
import { unpackBlockSuiteContent } from "./editor/contentFormat";
import { tryDocFromSnapshot } from "./editor/yjsCodec";
import type { INoteService, NoteMeta } from "./INoteService";
import { coverAad, titleAad } from "./vault/aad";
import type { IEncryptionService } from "./vault/IEncryptionService";

const SEARCH_PAGE_SIZE = 500;
const SEARCH_MAX_HITS = 50;
const SEARCH_MAX_SCAN = 50_000;

export class NoteService implements INoteService {
  constructor(
    private readonly notes: INoteRepository,
    private readonly crypto: IEncryptionService,
    private readonly links: INoteLinkRepository,
    private readonly blobSource?: {
      list(): Promise<string[]>;
      delete(key: string): Promise<void>;
    },
  ) {}

  private assertUnlocked(): void {
    if (!this.crypto.isUnlocked()) {
      throw new VaultLockedError();
    }
  }

  private async decryptTitle(rec: NoteRecord): Promise<string> {
    if (rec.titleKmsVersion < 1) return String(rec.title);
    return this.crypto.decryptPayload(rec.title, titleAad(rec.id));
  }

  private async toNote(rec: NoteRecord): Promise<Note> {
    return {
      ...rec,
      title: await this.decryptTitle(rec),
      content: await this.crypto.decryptPayload(rec.content, rec.id),
    };
  }

  private async toMeta(rec: NoteRecord): Promise<NoteMeta> {
    return {
      id: rec.id,
      workspaceId: rec.workspaceId,
      title: await this.decryptTitle(rec),
      icon: rec.icon,
    };
  }

  async listMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    this.assertUnlocked();
    const records = await this.notes.getNotesMetadataByWorkspace(workspaceId);
    return Promise.all(records.map((rec) => this.toNote(rec)));
  }

  async getNote(id: string): Promise<Note | null> {
    this.assertUnlocked();
    const rec = await this.notes.getNoteById(id);
    return rec ? this.toNote(rec) : null;
  }

  async searchAcrossWorkspaces(query: string): Promise<NoteSearchHit[]> {
    this.assertUnlocked();
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const hits: NoteSearchHit[] = [];
    let scanned = 0;
    let cursor: { updatedAt: number; id: string } | undefined;
    for (;;) {
      if (hits.length >= SEARCH_MAX_HITS || scanned >= SEARCH_MAX_SCAN) break;
      const page = await this.notes.findNotesForKeyset(SEARCH_PAGE_SIZE, cursor);
      if (page.length === 0) break;
      scanned += page.length;

      for (const rec of page) {
        if (hits.length >= SEARCH_MAX_HITS) break;
        try {
          const title = await this.decryptTitle(rec);
          if (title.toLowerCase().includes(q)) {
            hits.push({
              id: rec.id,
              workspaceId: rec.workspaceId,
              title,
              icon: rec.icon,
              snippet: "",
            });
            continue;
          }
          const plain = extractPlainText(await this.crypto.decryptPayload(rec.content, rec.id));
          if (plain.toLowerCase().includes(q)) {
            hits.push({
              id: rec.id,
              workspaceId: rec.workspaceId,
              title,
              icon: rec.icon,
              snippet: buildSnippet(plain, q),
            });
          }
        } catch {}
      }

      if (page.length < SEARCH_PAGE_SIZE) break;
      const last = page[page.length - 1];
      if (!last) break;
      cursor = { updatedAt: last.updatedAt, id: last.id };
    }
    return hits;
  }

  // Per-workspace in-flight tail-key minting: concurrent createNote calls
  // (double-click) must not both read the same DB max and mint the SAME
  // tail key — orderIndex has no UNIQUE constraint and duplicate keys
  // permanently break drag gap math. The promise chain serializes mints.
  private tailKeyMinting = new Map<string, Promise<string>>();

  async createNote(
    workspaceId: string,
    title = DEFAULT_NOTE_TITLE,
    content = EMPTY_NOTE_CONTENT,
    icon?: string,
    opts?: { createdAt?: number },
  ): Promise<Note> {
    this.assertUnlocked();
    const id = makeNoteId();
    // New notes get a TAIL fractional key immediately — empty keys would
    // sink them at the sort's end anyway, and empty anchors break drag
    // gap math (reorderNote). The mint promise is captured so the cache
    // can be invalidated once THIS insert lands — the cached key must
    // only serve genuinely concurrent mints, never a later create (a
    // reorderNote tail drop can advance the max off-chain in between).
    const mintPromise = this.nextTailKey(workspaceId);
    const orderIndex = await mintPromise;
    const rec = await this.notes.createNote(
      {
        id,
        workspaceId,
        title: await this.crypto.encryptPayload(title, titleAad(id)),
        titleKmsVersion: 1,
        content: await this.crypto.encryptPayload(content, id),
        icon,
        coverColor: undefined,
        isPinned: false,
        isFavorite: false,
        orderIndex,
      },
      opts,
    );
    this.forgetTailMint(workspaceId, mintPromise);
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    return { ...rec, content, title };
  }

  /**
   * A fractional key strictly after every existing note key (custom sort
   * tail). Serialized per workspace: the mint reads the workspace's
   * metadata (orderIndex is plaintext, but listMetadataByWorkspace also
   * decrypts titles — the only list surface available) and CHAINS onto any
   * in-flight mint, so overlapping creates derive from each other's keys
   * instead of racing on the same DB snapshot.
   */
  private nextTailKey(workspaceId: string): Promise<string> {
    const inFlight =
      this.tailKeyMinting.get(workspaceId) ?? Promise.resolve(null as unknown as string);
    const minted = inFlight.then(async (previous: string | null) => {
      // A chained mint derives from the previous mint's key directly — the
      // DB list can't have grown since (the previous INSERT follows its own
      // mint), and skipping the decrypting scan keeps double-click creates
      // O(1) instead of O(N) each.
      if (previous != null) return generateKeyBetween(previous, null);
      const siblings = await this.listMetadataByWorkspace(workspaceId);
      let maxKey: string | null = null;
      for (const note of siblings) {
        const key = note.orderIndex;
        if (!key) continue;
        if (maxKey === null || key > maxKey) maxKey = key;
      }
      return generateKeyBetween(maxKey, null);
    });
    this.tailKeyMinting.set(workspaceId, minted);
    minted.catch(() => {
      // A failed mint must not poison the chain for later creates.
      this.forgetTailMint(workspaceId, minted);
    });
    return minted;
  }

  /** Drop a settled mint from the cache — the entry only exists to bridge
   *  CONCURRENT creates; a cached key surviving past its insert goes stale
   *  the moment reorderNote advances the tail off-chain. */
  private forgetTailMint(workspaceId: string, mint: Promise<string>): void {
    if (this.tailKeyMinting.get(workspaceId) === mint) {
      this.tailKeyMinting.delete(workspaceId);
    }
  }

  async createNoteWithId(
    workspaceId: string,
    id: string,
    title = DEFAULT_NOTE_TITLE,
  ): Promise<Note> {
    this.assertUnlocked();
    const content = EMPTY_NOTE_CONTENT;
    const rec = await this.notes.createNote({
      id,
      workspaceId,
      title: await this.crypto.encryptPayload(title, titleAad(id)),
      titleKmsVersion: 1,
      content: await this.crypto.encryptPayload(content, id),
      icon: undefined,
      coverColor: undefined,
      isPinned: false,
      isFavorite: false,
    });
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    return { ...rec, content, title };
  }

  async updateMetadata(
    id: string,
    updates: Partial<
      Pick<
        Note,
        | "title"
        | "icon"
        | "coverColor"
        | "docMode"
        | "edgelessTheme"
        | "pageWidth"
        | "isTemplate"
        | "isPinned"
        | "isFavorite"
        | "workspaceId"
        | "orderIndex"
      >
    >,
  ): Promise<Note> {
    this.assertUnlocked();
    const { title, ...rest } = updates;
    const recUpdates: Partial<NoteRecord> = { ...rest };
    if (title !== undefined) {
      recUpdates.title = await this.crypto.encryptPayload(title, titleAad(id));
      recUpdates.titleKmsVersion = 1;
    }
    const updated = await this.notes.updateNote(id, recUpdates);
    if (recUpdates.orderIndex !== undefined) {
      // An external orderIndex write invalidates any cached tail mint.
      this.tailKeyMinting.delete(updated.workspaceId);
    }
    return this.toNote(updated);
  }

  /**
   * Manual reorder for the Library's custom sort: computes the fractional
   * key between the drop target's neighbors (with the dragged note removed
   * from the sequence first, so it can never become its own neighbor and
   * collapse the gap onto a duplicate key).
   */
  async reorderNote(id: string, targetId: string, position: "before" | "after"): Promise<void> {
    this.assertUnlocked();
    if (id === targetId) return;
    const target = await this.getNote(targetId);
    if (!target) throw new NotFoundError("Note", targetId);

    // Fractional keys sort by char code, NOT locale collation (ICU sorts
    // case-insensitively and scrambles a0..a9,aA..aZ from the 37th key).
    const siblings = (await this.listMetadataByWorkspace(target.workspaceId)).sort((a, b) => {
      const ak = a.orderIndex ?? "";
      const bk = b.orderIndex ?? "";
      return (ak === "" ? 1 : 0) - (bk === "" ? 1 : 0) || (ak < bk ? -1 : ak > bk ? 1 : 0);
    });
    const others = siblings.filter((n) => n.id !== id);
    const targetIndex = others.findIndex((n) => n.id === targetId);
    if (targetIndex === -1) throw new NotFoundError("Note", targetId);

    const insertAt = position === "before" ? targetIndex : targetIndex + 1;
    // Anchor math distinguishes THREE lower-neighbor states:
    //  - no neighbor (insertAt === 0, a true head drop) → null anchor, so
    //    generateKeyBetween(null, firstKey) mints a correct head key;
    //  - neighbor with an EMPTY key (legacy stray; empty means "after every
    //    real key") → substitute the largest real key, or the null-anchor
    //    collapse would mint the SMALLEST key ("a0") and teleport the note
    //    to the top, duplicating the oldest seed;
    //  - neighbor with a real key → use it.
    const realKeys = others.map((n) => n.orderIndex).filter((k): k is string => Boolean(k));
    const prev = others[insertAt - 1];
    const before =
      prev === undefined
        ? null
        : prev.orderIndex || (realKeys.length > 0 ? realKeys[realKeys.length - 1] : null);
    const after = others[insertAt]?.orderIndex ?? null;
    await this.notes.updateNote(id, { orderIndex: generateKeyBetween(before, after) });
    // This write advances the key space OFF the mint chain — drop any
    // cached tail key so the next create rescans the true max.
    this.tailKeyMinting.delete(target.workspaceId);
  }

  async updateContent(id: string, content: string): Promise<Note> {
    this.assertUnlocked();
    const rec = await this.notes.updateNote(id, {
      content: await this.crypto.encryptPayload(content, id),
    });
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    return { ...rec, content };
  }

  async backlinksOf(id: string): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const sources = await this.links.backlinksOf(id);
    const records = await this.notes.getMetaByIds(sources);
    return Promise.all(records.map((rec) => this.toMeta(rec)));
  }

  async outgoingLinksOf(id: string): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const targets = await this.links.outgoingLinksOf(id);
    const records = await this.notes.getMetaByIds(targets);
    return Promise.all(records.map((rec) => this.toMeta(rec)));
  }

  async getLinkTargets(ids: string[]): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const records = await this.notes.getMetaByIds(ids);
    return Promise.all(records.map((rec) => this.toMeta(rec)));
  }

  async deleteNote(id: string): Promise<void> {
    this.assertUnlocked();
    const blobCandidates = await this.collectNoteBlobCandidates(id);
    await this.notes.deleteNote(id);
    if (blobCandidates.length > 0) {
      void this.deleteBlobsNoLongerReferenced(blobCandidates).catch(() => {});
    }
  }

  async collectWorkspaceBlobCandidates(workspaceId: string): Promise<string[]> {
    this.assertUnlocked();
    const metas = await this.notes.getNotesMetadataByWorkspace(workspaceId);
    const candidates: string[] = [];
    for (const rec of metas) {
      candidates.push(...(await this.collectNoteBlobCandidates(rec.id)));
    }
    return candidates;
  }

  async gcOrphanBlobs(candidates: string[]): Promise<void> {
    await this.deleteBlobsNoLongerReferenced(candidates);
  }

  async trashNote(id: string): Promise<void> {
    this.assertUnlocked();
    await this.notes.setDeleted(id, Date.now());
  }

  async restoreNote(id: string): Promise<void> {
    this.assertUnlocked();
    await this.notes.setDeleted(id, null);
  }

  async listTrash(): Promise<Note[]> {
    this.assertUnlocked();
    const records = await this.notes.listTrashed();
    return Promise.all(
      records.map(async (rec) => ({
        ...rec,
        title: await this.decryptTitle(rec),
        content: "",
      })),
    );
  }

  async purgeExpiredTrash(now = Date.now()): Promise<number> {
    this.assertUnlocked();
    const expired = await this.notes.findExpiredTrash(trashPurgeCutoff(now));
    const blobCandidates: string[] = [];
    for (const id of expired) {
      blobCandidates.push(...(await this.collectNoteBlobCandidates(id)));
      await this.notes.deleteNote(id);
    }
    if (blobCandidates.length > 0) {
      void this.deleteBlobsNoLongerReferenced(blobCandidates).catch(() => {});
    }
    return expired.length;
  }

  private async collectNoteBlobCandidates(id: string): Promise<string[]> {
    try {
      const rec = await this.notes.getNoteById(id);
      if (!rec) return [];
      const content = await this.crypto.decryptPayload(rec.content, id);
      return this.candidateBlobIdsIn(content);
    } catch {
      return [];
    }
  }

  private candidateBlobIdsIn(content: string): string[] {
    try {
      const snapshot = unpackBlockSuiteContent(content);
      if (!snapshot) return [];
      const doc = tryDocFromSnapshot(snapshot);
      if (!doc) return [];
      const ids: string[] = [];
      const visit = (node: unknown): void => {
        if (typeof node === "string") {
          ids.push(node);
        } else if (node instanceof Y.Map) {
          for (const value of node.values()) visit(value);
        } else if (node instanceof Y.Array) {
          for (const value of node.toArray()) visit(value);
        }
      };
      visit(doc.getMap("blocks"));
      return ids;
    } catch {
      return [];
    }
  }

  private async deleteBlobsNoLongerReferenced(candidates: string[]): Promise<void> {
    if (!this.blobSource || !this.notes.getAllContents || candidates.length === 0) return;
    const existing = new Set(await this.blobSource.list());
    const orphans = new Set(candidates.filter((id) => existing.has(id)));
    if (orphans.size === 0) return;
    const rows = await this.notes.getAllContents();
    for (const row of rows) {
      if (orphans.size === 0) break;
      let content: string;
      try {
        content = await this.crypto.decryptPayload(row.content, row.id);
      } catch {
        continue;
      }
      for (const id of this.candidateBlobIdsIn(content)) {
        orphans.delete(id);
      }
    }
    for (const id of orphans) {
      try {
        await this.blobSource.delete(id);
      } catch {}
    }
  }

  async duplicateNote(id: string): Promise<Note> {
    this.assertUnlocked();
    const src = await this.getNote(id);
    if (!src) throw new NotFoundError("Note", id);
    const { title, content, icon } = duplicateNoteProps(src);
    let copy = await this.createNote(src.workspaceId, title, content, icon);
    if (src.coverColor) {
      copy = await this.updateMetadata(copy.id, { coverColor: src.coverColor });
    }
    const cover = await this.getCoverImage(id);
    if (cover) {
      await this.setCoverImage(copy.id, cover);
    }
    return { ...copy, content };
  }

  async getCoverImage(id: string): Promise<string | null> {
    this.assertUnlocked();
    const payload = await this.notes.getCover(id);
    return payload ? this.crypto.decryptPayload(payload, coverAad(id)) : null;
  }

  async setCoverImage(id: string, dataUrl: string): Promise<void> {
    this.assertUnlocked();
    await this.notes.upsertCover(id, await this.crypto.encryptPayload(dataUrl, coverAad(id)));
  }

  async removeCoverImage(id: string): Promise<void> {
    this.assertUnlocked();
    await this.notes.deleteCover(id);
  }

  async togglePin(id: string): Promise<Note> {
    this.assertUnlocked();
    const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id);
    return this.toNote(await this.notes.updateNote(id, { isPinned: !n.isPinned }));
  }

  async toggleFavorite(id: string): Promise<Note> {
    this.assertUnlocked();
    const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id);
    return this.toNote(await this.notes.updateNote(id, { isFavorite: !n.isFavorite }));
  }
}
