import type { Note } from "../domain/note/Note";

export interface INoteService {
  listMetadataByWorkspace(workspaceId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
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
