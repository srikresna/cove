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
import { cmpOrderIndex } from "../domain/note/ordering";
import { VaultLockedError } from "../errors/AppError";
import type { INoteLinkRepository } from "../repositories/INoteLinkRepository";
import type { INoteRepository, NoteRecord } from "../repositories/INoteRepository";
import { unpackBlockSuiteContent } from "./editor/contentFormat";
import { extractNoteLinkIds } from "./editor/noteLinks";
import { buildSnippet, extractPlainText } from "./editor/plainText";
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
    const title = await this.crypto.decryptPayload(rec.title, titleAad(rec.id));
    if (!title) return title;
    let inner: string;
    try {
      inner = await this.crypto.decryptPayload(title, titleAad(rec.id));
    } catch {
      return title;
    }
    try {
      await this.notes.updateTitleIfUnchanged(
        rec.id,
        rec.title,
        await this.crypto.encryptPayload(inner, titleAad(rec.id)),
      );
    } catch {}
    return inner;
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

  private async degradeAll<T>(promises: Array<Promise<T>>): Promise<T[]> {
    const settled = await Promise.allSettled(promises);
    return settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
  }

  async listMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    this.assertUnlocked();
    const records = await this.notes.getNotesMetadataByWorkspace(workspaceId);
    return this.degradeAll(records.map((rec) => this.toNote(rec)));
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

  private orderWrites = new Map<string, Promise<unknown>>();

  private enqueueOrderWrite<T>(workspaceId: string, op: () => Promise<T>): Promise<T> {
    const inFlight = this.orderWrites.get(workspaceId) ?? Promise.resolve();
    const result = inFlight.then(op);
    this.orderWrites.set(
      workspaceId,
      result.catch(() => {}),
    );
    return result;
  }

  async createNote(
    workspaceId: string,
    title = DEFAULT_NOTE_TITLE,
    content = EMPTY_NOTE_CONTENT,
    icon?: string,
    opts?: { createdAt?: number },
  ): Promise<Note> {
    this.assertUnlocked();
    const id = makeNoteId();
    const encTitle = await this.crypto.encryptPayload(title, titleAad(id));
    const encContent = await this.crypto.encryptPayload(content, id);
    const rec = await this.enqueueOrderWrite(workspaceId, async () =>
      this.notes.createNote(
        {
          id,
          workspaceId,
          title: encTitle,
          titleKmsVersion: 1,
          content: encContent,
          icon,
          coverColor: undefined,
          isPinned: false,
          isFavorite: false,
          orderIndex: generateKeyBetween(await this.notes.getMaxOrderIndex(workspaceId), null),
        },
        opts,
      ),
    );
    await this.persistLinksGuarded(id, extractNoteLinkIds(content));
    return { ...rec, content, title };
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
    try {
      await this.links.replaceForSource(id, extractNoteLinkIds(content));
    } catch {}
    return { ...rec, content, title };
  }

  private async persistLinksGuarded(id: string, linkIds: string[]): Promise<void> {
    try {
      await this.links.replaceForSource(id, linkIds);
    } catch (err) {
      await this.notes.deleteNote(id).catch(() => {});
      throw err;
    }
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
    const { title, workspaceId: moveTo, ...rest } = updates;
    const recUpdates: Partial<NoteRecord> = { ...rest };
    if (title !== undefined) {
      recUpdates.title = await this.crypto.encryptPayload(title, titleAad(id));
      recUpdates.titleKmsVersion = 1;
    }
    if (moveTo !== undefined) (recUpdates as { workspaceId?: string }).workspaceId = moveTo;
    const updated = await this.updateNoteOrdered(id, recUpdates, moveTo);
    try {
      return await this.toNote(updated);
    } catch {
      const title = updates.title ?? (await this.decryptTitle(updated).catch(() => ""));
      const content = await this.crypto.decryptPayload(updated.content, updated.id).catch(() => "");
      return { ...updated, title, content };
    }
  }

  private async updateNoteOrdered(
    id: string,
    recUpdates: Partial<NoteRecord>,
    moveTo: string | undefined,
  ): Promise<NoteRecord> {
    if (moveTo === undefined && recUpdates.orderIndex === undefined) {
      return this.notes.updateNote(id, recUpdates);
    }
    const before = await this.notes.getNoteById(id);
    if (!before) throw new NotFoundError("Note", id);
    if (moveTo !== undefined && before.workspaceId !== moveTo) {
      return this.enqueueOrderWrite(moveTo, async () =>
        this.notes.updateNote(id, {
          ...recUpdates,
          orderIndex: generateKeyBetween(await this.notes.getMaxOrderIndex(moveTo), null),
        }),
      );
    }
    return this.enqueueOrderWrite(before.workspaceId, () => this.notes.updateNote(id, recUpdates));
  }

  async reorderNote(id: string, targetId: string, position: "before" | "after"): Promise<void> {
    this.assertUnlocked();
    if (id === targetId) return;
    const target = await this.getNote(targetId);
    if (!target) throw new NotFoundError("Note", targetId);

    await this.enqueueOrderWrite(target.workspaceId, async () => {
      const siblings = (await this.listMetadataByWorkspace(target.workspaceId)).sort((a, b) =>
        cmpOrderIndex(a.orderIndex, b.orderIndex),
      );
      const draggedKey = siblings.find((n) => n.id === id)?.orderIndex;
      const others = siblings.filter((n) => n.id !== id);
      const targetIndex = others.findIndex((n) => n.id === targetId);
      if (targetIndex === -1) throw new NotFoundError("Note", targetId);

      const insertAt = position === "before" ? targetIndex : targetIndex + 1;
      const realKeys = others.map((n) => n.orderIndex).filter((k): k is string => Boolean(k));
      const prev = others[insertAt - 1];
      const before =
        prev === undefined
          ? null
          : prev.orderIndex || (realKeys.length > 0 ? realKeys[realKeys.length - 1] : null);
      const after = others[insertAt]?.orderIndex ?? null;

      const taken = new Set(
        (await this.notes.getOrderIndexesByWorkspace(target.workspaceId)).map((r) => r.orderIndex),
      );
      if (draggedKey) taken.delete(draggedKey);
      let key: string;
      try {
        key = generateKeyBetween(before, after);
        while (taken.has(key)) key = generateKeyBetween(key, after);
      } catch {
        key = generateKeyBetween(before, null);
        while (taken.has(key)) key = generateKeyBetween(key, null);
      }
      await this.notes.updateNote(id, { orderIndex: key });
    });
  }

  async updateContent(id: string, content: string): Promise<Note> {
    this.assertUnlocked();
    const rec = await this.notes.updateNote(id, {
      content: await this.crypto.encryptPayload(content, id),
    });
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    try {
      return { ...rec, title: await this.decryptTitle(rec), content };
    } catch {
      return { ...rec, title: "", content };
    }
  }

  async backlinksOf(id: string): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const sources = await this.links.backlinksOf(id);
    const records = await this.notes.getMetaByIds(sources);
    return this.degradeAll(records.map((rec) => this.toMeta(rec)));
  }

  async outgoingLinksOf(id: string): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const targets = await this.links.outgoingLinksOf(id);
    const records = await this.notes.getMetaByIds(targets);
    return this.degradeAll(records.map((rec) => this.toMeta(rec)));
  }

  async getLinkTargets(ids: string[]): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const records = await this.notes.getMetaByIds(ids);
    return this.degradeAll(records.map((rec) => this.toMeta(rec)));
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
    await this.setDeletedOrdered(id, Date.now());
  }

  async restoreNote(id: string): Promise<void> {
    this.assertUnlocked();
    await this.setDeletedOrdered(id, null);
  }

  private async setDeletedOrdered(id: string, deletedAt: number | null): Promise<void> {
    const rec = await this.notes.getNoteById(id);
    if (!rec) {
      await this.notes.setDeleted(id, deletedAt);
      return;
    }
    await this.enqueueOrderWrite(rec.workspaceId, async () => {
      await this.notes.setDeleted(id, deletedAt);
      if (deletedAt !== null || !rec.orderIndex) return;
      const held = (await this.notes.getOrderIndexesByWorkspace(rec.workspaceId)).filter(
        (r) => r.id !== id && r.orderIndex === rec.orderIndex,
      );
      if (held.length > 0) {
        const max = await this.notes.getMaxOrderIndex(rec.workspaceId);
        await this.notes.updateNote(id, { orderIndex: generateKeyBetween(max, null) });
      }
    });
  }

  async listTrash(): Promise<Note[]> {
    this.assertUnlocked();
    const records = await this.notes.listTrashed();
    return this.degradeAll(
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
