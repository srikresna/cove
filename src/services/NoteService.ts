import { NotFoundError } from "../domain/errors";
import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import {
  DEFAULT_NOTE_COVER_COLOR,
  DEFAULT_NOTE_ICON,
  DEFAULT_NOTE_TITLE,
  EMPTY_NOTE_CONTENT,
  duplicateNoteProps,
  makeNoteId,
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
    icon = DEFAULT_NOTE_ICON,
  ): Promise<Note> {
    this.assertUnlocked();
    const id = makeNoteId();
    const rec = await this.notes.createNote({
      id,
      workspaceId,
      title,
      content: await this.crypto.encryptPayload(content, id),
      icon,
      coverColor: DEFAULT_NOTE_COVER_COLOR,
      isPinned: false,
      isFavorite: false,
    });
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    return { ...rec, content };
  }

  async updateMetadata(
    id: string,
    updates: Partial<
      Pick<Note, "title" | "icon" | "coverColor" | "isPinned" | "isFavorite" | "workspaceId">
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

  async duplicateNote(id: string): Promise<Note> {
    this.assertUnlocked();
    const src = await this.getNote(id);
    if (!src) throw new NotFoundError("Note", id);
    const { title, content, icon } = duplicateNoteProps(src);
    return this.createNote(src.workspaceId, title, content, icon);
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
