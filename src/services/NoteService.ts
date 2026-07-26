import { NotFoundError } from "../domain/errors";
import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import {
  DEFAULT_NOTE_TITLE,
  EMPTY_NOTE_CONTENT,
  coverAad,
  duplicateNoteProps,
  makeNoteId,
  trashPurgeCutoff,
} from "../domain/note/notePolicy";
import { VaultLockedError } from "../errors/AppError";
import type { INoteLinkRepository } from "../repositories/INoteLinkRepository";
import type { INoteRepository, NoteRecord } from "../repositories/INoteRepository";
import { extractNoteLinkIds } from "../utils/noteLinks";
import { buildSnippet, extractPlainText } from "../utils/plainText";
import type { INoteService, NoteMeta } from "./INoteService";
import type { IEncryptionService } from "./vault/IEncryptionService";

function toMeta(rec: NoteRecord): NoteMeta {
  return { id: rec.id, workspaceId: rec.workspaceId, title: rec.title, icon: rec.icon };
}

export class NoteService implements INoteService {
  constructor(
    private readonly notes: INoteRepository,
    private readonly crypto: IEncryptionService,
    private readonly links: INoteLinkRepository,
  ) {}

  private assertUnlocked(): void {
    if (!this.crypto.isUnlocked()) {
      throw new VaultLockedError();
    }
  }

  private async toNote(rec: NoteRecord): Promise<Note> {
    return { ...rec, content: await this.crypto.decryptPayload(rec.content, rec.id) };
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
    const titleHits = await this.notes.searchTitlesFts(q, 50);
    const titleIds = new Set(titleHits.map((h) => h.id));
    const candidates = await this.notes.findRecentForSearch(100);
    const bodyHits: NoteSearchHit[] = [];
    for (const rec of candidates) {
      if (titleIds.has(rec.id)) continue;
      const plain = extractPlainText(await this.crypto.decryptPayload(rec.content, rec.id));
      if (plain.toLowerCase().includes(q)) {
        bodyHits.push({
          id: rec.id,
          workspaceId: rec.workspaceId,
          title: rec.title,
          icon: rec.icon,
          snippet: buildSnippet(plain, q),
        });
      }
    }
    return [...titleHits, ...bodyHits];
  }

  async createNote(
    workspaceId: string,
    title = DEFAULT_NOTE_TITLE,
    content = EMPTY_NOTE_CONTENT,
    icon?: string,
  ): Promise<Note> {
    this.assertUnlocked();
    const id = makeNoteId();
    const rec = await this.notes.createNote({
      id,
      workspaceId,
      title,
      content: await this.crypto.encryptPayload(content, id),
      icon,
      coverColor: undefined,
      isPinned: false,
      isFavorite: false,
    });
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    return { ...rec, content };
  }

  async updateMetadata(
    id: string,
    updates: Partial<
      Pick<
        Note,
        "title" | "icon" | "coverColor" | "docMode" | "isPinned" | "isFavorite" | "workspaceId"
      >
    >,
  ): Promise<Note> {
    this.assertUnlocked();
    return this.toNote(await this.notes.updateNote(id, updates));
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
    return records.map(toMeta);
  }

  async getLinkTargets(ids: string[]): Promise<NoteMeta[]> {
    this.assertUnlocked();
    const records = await this.notes.getMetaByIds(ids);
    return records.map(toMeta);
  }

  async deleteNote(id: string): Promise<void> {
    this.assertUnlocked();
    return this.notes.deleteNote(id);
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
    return records.map((rec) => ({ ...rec, content: "" }));
  }

  async purgeExpiredTrash(now = Date.now()): Promise<number> {
    this.assertUnlocked();
    const expired = await this.notes.findExpiredTrash(trashPurgeCutoff(now));
    for (const id of expired) {
      await this.notes.deleteNote(id);
    }
    return expired.length;
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
