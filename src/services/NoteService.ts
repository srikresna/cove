import { NotFoundError } from "../domain/errors";
import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import {
  DEFAULT_NOTE_TITLE,
  EMPTY_NOTE_CONTENT,
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
import { coverAad, titleAad } from "./vault/aad";

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

  private async decryptTitle(rec: NoteRecord): Promise<string> {
    // titleKmsVersion 0 = pre-H6 plaintext (not yet migrated); >=1 = encrypted
    // under the session DEK with the title AAD.
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
    // Titles are encrypted at rest, so there is no full-text index: decrypt title
    // and body for each recent note and match either (decrypt-on-search).
    const candidates = await this.notes.findRecentForSearch(100);
    const hits: NoteSearchHit[] = [];
    for (const rec of candidates) {
      try {
        const title = await this.decryptTitle(rec);
        const plain = extractPlainText(await this.crypto.decryptPayload(rec.content, rec.id));
        const matchesBody = plain.toLowerCase().includes(q);
        if (title.toLowerCase().includes(q) || matchesBody) {
          hits.push({
            id: rec.id,
            workspaceId: rec.workspaceId,
            title,
            icon: rec.icon,
            snippet: matchesBody ? buildSnippet(plain, q) : "",
          });
        }
      } catch {
        // A single corrupt/undecodable note must not abort the whole search.
      }
    }
    return hits;
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
      title: await this.crypto.encryptPayload(title, titleAad(id)),
      titleKmsVersion: 1,
      content: await this.crypto.encryptPayload(content, id),
      icon,
      coverColor: undefined,
      isPinned: false,
      isFavorite: false,
    });
    await this.links.replaceForSource(id, extractNoteLinkIds(content));
    return { ...rec, content, title };
  }

  /** Create a note with a caller-supplied ID (for BlockSuite "new doc" sync). */
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
        "title" | "icon" | "coverColor" | "docMode" | "isPinned" | "isFavorite" | "workspaceId"
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
    return this.toNote(await this.notes.updateNote(id, recUpdates));
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
