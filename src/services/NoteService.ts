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
import type { INoteRepository } from "../repositories/INoteRepository";
import { buildSnippet, extractPlainText } from "../utils/plainText";
import type { INoteService } from "./INoteService";
import type { IEncryptionService } from "./vault/IEncryptionService";

export class NoteService implements INoteService {
  constructor(
    private readonly notes: INoteRepository,
    private readonly crypto: IEncryptionService,
  ) {}

  /** H2 fix: defense-in-depth lock gate — throws before any repo call if vault is locked. */
  private assertUnlocked(): void {
    if (!this.crypto.isUnlocked()) {
      throw new VaultLockedError();
    }
  }

  async listMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    this.assertUnlocked();
    return this.notes.getNotesMetadataByWorkspace(workspaceId);
  }

  async getNote(id: string): Promise<Note | null> {
    this.assertUnlocked();
    return this.notes.getNoteById(id);
  }

  async searchAcrossWorkspaces(query: string): Promise<NoteSearchHit[]> {
    this.assertUnlocked();
    const q = query.trim().toLowerCase();
    if (!q) return [];
    // Fast path: FTS5 title search (no decrypt, SQL-level MATCH with ranking).
    const titleHits = await this.notes.searchTitlesFts(q, 50);
    const titleIds = new Set(titleHits.map((h) => h.id));
    // Slow path: decrypt-on-search for body matches. Each note is decrypted
    // individually and the full plaintext goes out of scope immediately after
    // the snippet is built — no Note[] holding 100 decrypted bodies in memory.
    const candidates = await this.notes.findRecentForSearch(100);
    const bodyHits: NoteSearchHit[] = [];
    for (const note of candidates) {
      if (titleIds.has(note.id)) continue;
      const plain = extractPlainText(note.content);
      if (plain.toLowerCase().includes(q)) {
        bodyHits.push({
          id: note.id,
          workspaceId: note.workspaceId,
          title: note.title,
          icon: note.icon,
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
    return this.notes.createNote({
      id: makeNoteId(),
      workspaceId,
      title,
      content,
      icon,
      coverColor: DEFAULT_NOTE_COVER_COLOR,
      isPinned: false,
      isFavorite: false,
    });
  }

  async updateMetadata(
    id: string,
    updates: Partial<
      Pick<Note, "title" | "icon" | "coverColor" | "isPinned" | "isFavorite" | "workspaceId">
    >,
  ): Promise<Note> {
    this.assertUnlocked();
    return this.notes.updateNote(id, updates);
  }

  async updateContent(id: string, content: string): Promise<Note> {
    this.assertUnlocked();
    return this.notes.updateNote(id, { content });
  }

  async deleteNote(id: string): Promise<void> {
    this.assertUnlocked();
    return this.notes.deleteNote(id);
  }

  async duplicateNote(id: string): Promise<Note> {
    this.assertUnlocked();
    const src = await this.notes.getNoteById(id);
    if (!src) throw new NotFoundError("Note", id);
    const { title, content, icon } = duplicateNoteProps(src);
    return this.createNote(src.workspaceId, title, content, icon);
  }

  async togglePin(id: string): Promise<Note> {
    this.assertUnlocked();
    const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id);
    return this.notes.updateNote(id, { isPinned: !n.isPinned });
  }

  async toggleFavorite(id: string): Promise<Note> {
    this.assertUnlocked();
    const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id);
    return this.notes.updateNote(id, { isFavorite: !n.isFavorite });
  }
}
