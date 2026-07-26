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
      Pick<Note, "title" | "icon" | "coverColor" | "isPinned" | "isFavorite" | "workspaceId">
    >,
  ): Promise<Note>;
  updateContent(id: string, content: string): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  duplicateNote(id: string): Promise<Note>;
  togglePin(id: string): Promise<Note>;
  toggleFavorite(id: string): Promise<Note>;
}
