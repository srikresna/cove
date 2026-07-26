import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";
import type { EncryptedPayload } from "../services/vault/IEncryptionService";

/**
 * A note as persisted: content is ciphertext, never plaintext. Encryption and
 * decryption happen in the application layer (NoteService) — the repository
 * contract itself makes plaintext persistence a type error, so any future
 * implementation (export, sync, ...) inherits encryption-at-rest for free.
 * Metadata-only reads carry an empty content payload.
 */
export interface NoteRecord extends Omit<Note, "content"> {
  content: EncryptedPayload;
}

export interface INoteRepository {
  /** Metadata only — content comes back as an empty payload (no decrypt cost). */
  getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]>;
  getNoteById(id: string): Promise<NoteRecord | null>;
  /** Top-N most recently updated notes with their (encrypted) content, for cross-workspace search. */
  findRecentForSearch(limit: number): Promise<NoteRecord[]>;
  /** Fast FTS5 title search (no decrypt). Returns metadata-only hits. Empty if FTS5 unavailable. */
  searchTitlesFts(query: string, limit: number): Promise<NoteSearchHit[]>;
  createNote(note: Omit<NoteRecord, "createdAt" | "updatedAt">): Promise<NoteRecord>;
  updateNote(id: string, updates: Partial<NoteRecord>): Promise<NoteRecord>;
  deleteNote(id: string): Promise<void>;
  deleteNotesByWorkspace(workspaceId: string): Promise<void>;
}
