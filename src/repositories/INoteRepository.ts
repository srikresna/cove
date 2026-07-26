import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import type { EncryptedPayload } from "../services/vault/IEncryptionService";

export interface NoteRecord extends Omit<Note, "content"> {
  content: EncryptedPayload;
}

export interface INoteRepository {
  getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]>;
  getMetaByIds(ids: string[]): Promise<NoteRecord[]>;
  getNoteById(id: string): Promise<NoteRecord | null>;
  findRecentForSearch(limit: number): Promise<NoteRecord[]>;
  searchTitlesFts(query: string, limit: number): Promise<NoteSearchHit[]>;
  createNote(note: Omit<NoteRecord, "createdAt" | "updatedAt">): Promise<NoteRecord>;
  updateNote(id: string, updates: Partial<NoteRecord>): Promise<NoteRecord>;
  deleteNote(id: string): Promise<void>;
  deleteNotesByWorkspace(workspaceId: string): Promise<void>;
  getCover(noteId: string): Promise<EncryptedPayload | null>;
  upsertCover(noteId: string, payload: EncryptedPayload): Promise<void>;
  deleteCover(noteId: string): Promise<void>;
  listTrashed(): Promise<NoteRecord[]>;
  setDeleted(id: string, deletedAt: number | null): Promise<void>;
  findExpiredTrash(cutoff: number): Promise<string[]>;
}
