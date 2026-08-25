import type { EncryptedPayload } from "../domain/EncryptedPayload";
import type { Note } from "../domain/note/Note";

export interface NoteRecord extends Omit<Note, "content" | "title"> {
  content: EncryptedPayload;
  title: EncryptedPayload;

  titleKmsVersion: number;
}

export interface INoteRepository {
  getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]>;
  /** Largest non-empty manual-order key in the workspace (BINARY order —
   *  fractional-index keys are ASCII code-unit ordered), or null. */
  getMaxOrderIndex(workspaceId: string): Promise<string | null>;
  getMetaByIds(ids: string[]): Promise<NoteRecord[]>;
  getNoteById(id: string): Promise<NoteRecord | null>;
  findRecentForSearch(limit: number): Promise<NoteRecord[]>;
  findNotesForKeyset(
    limit: number,
    cursor?: { updatedAt: number; id: string },
  ): Promise<NoteRecord[]>;
  createNote(
    note: Omit<NoteRecord, "createdAt" | "updatedAt">,
    opts?: { createdAt?: number },
  ): Promise<NoteRecord>;
  updateNote(id: string, updates: Partial<NoteRecord>): Promise<NoteRecord>;
  deleteNote(id: string): Promise<void>;
  getCover(noteId: string): Promise<EncryptedPayload | null>;
  upsertCover(noteId: string, payload: EncryptedPayload): Promise<void>;
  deleteCover(noteId: string): Promise<void>;
  listTrashed(): Promise<NoteRecord[]>;
  setDeleted(id: string, deletedAt: number | null): Promise<void>;
  findExpiredTrash(cutoff: number): Promise<string[]>;
  getAllContents?(): Promise<Array<{ id: string; content: EncryptedPayload }>>;
}
