import type { Note } from "../domain/note/Note";

export interface INoteRepository {
  getAllNotes(): Promise<Note[]>;
  getNotesByWorkspace(workspaceId: string): Promise<Note[]>;
  getNotesMetadataByWorkspace(workspaceId: string): Promise<Note[]>;
  getNoteById(id: string): Promise<Note | null>;
  createNote(note: Omit<Note, "createdAt" | "updatedAt">): Promise<Note>;
  updateNote(id: string, updates: Partial<Note>): Promise<Note>;
  deleteNote(id: string): Promise<void>;
  deleteNotesByWorkspace(workspaceId: string): Promise<void>;
  searchNotes(query: string): Promise<Note[]>;
}
