import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";

export type NoteMeta = Pick<Note, "id" | "workspaceId" | "title" | "icon">;

export interface INoteService {
  /** Notes that link TO this note (metadata only). */
  backlinksOf(id: string): Promise<NoteMeta[]>;
  /** Metadata for specific ids across workspaces — for link chips. */
  getLinkTargets(ids: string[]): Promise<NoteMeta[]>;
  listMetadataByWorkspace(workspaceId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  searchAcrossWorkspaces(query: string): Promise<NoteSearchHit[]>;
  createNote(workspaceId: string, title?: string, content?: string, icon?: string): Promise<Note>;
  updateMetadata(
    id: string,
    updates: Partial<
      Pick<
        Note,
        "title" | "icon" | "coverColor" | "docMode" | "isPinned" | "isFavorite" | "workspaceId"
      >
    >,
  ): Promise<Note>;
  updateContent(id: string, content: string): Promise<Note>;
  /** Decrypted cover image data URL, or null when the note has no image cover. */
  getCoverImage(id: string): Promise<string | null>;
  setCoverImage(id: string, dataUrl: string): Promise<void>;
  removeCoverImage(id: string): Promise<void>;
  /** Permanently removes the note and its links, tags, and cover. */
  deleteNote(id: string): Promise<void>;
  /** Soft delete: hides the note everywhere until restored or purged. */
  trashNote(id: string): Promise<void>;
  restoreNote(id: string): Promise<void>;
  /** Trashed notes across all workspaces, metadata only, newest first. */
  listTrash(): Promise<Note[]>;
  /** Hard-deletes trash older than the retention window; returns the count. */
  purgeExpiredTrash(now?: number): Promise<number>;
  duplicateNote(id: string): Promise<Note>;
  togglePin(id: string): Promise<Note>;
  toggleFavorite(id: string): Promise<Note>;
}
