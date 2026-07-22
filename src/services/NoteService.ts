import { NotFoundError } from "../domain/errors";
import type { Note } from "../domain/note/Note";
import {
  DEFAULT_NOTE_COVER_COLOR,
  DEFAULT_NOTE_ICON,
  DEFAULT_NOTE_TITLE,
  EMPTY_NOTE_CONTENT,
  duplicateNoteProps,
  makeNoteId,
} from "../domain/note/notePolicy";
import type { INoteRepository } from "../repositories/INoteRepository";
import type { INoteService } from "./INoteService";

export class NoteService implements INoteService {
  constructor(private readonly notes: INoteRepository) {}

  async listMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    return this.notes.getNotesMetadataByWorkspace(workspaceId);
  }

  async getNote(id: string): Promise<Note | null> {
    return this.notes.getNoteById(id);
  }

  async createNote(
    workspaceId: string,
    title = DEFAULT_NOTE_TITLE,
    content = EMPTY_NOTE_CONTENT,
    icon = DEFAULT_NOTE_ICON,
  ): Promise<Note> {
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
    return this.notes.updateNote(id, updates);
  }

  async updateContent(id: string, content: string): Promise<Note> {
    return this.notes.updateNote(id, { content });
  }

  async deleteNote(id: string): Promise<void> {
    return this.notes.deleteNote(id);
  }

  async duplicateNote(id: string): Promise<Note> {
    const src = await this.notes.getNoteById(id);
    if (!src) throw new NotFoundError("Note", id);
    const { title, content, icon } = duplicateNoteProps(src);
    return this.createNote(src.workspaceId, title, content, icon);
  }

  async togglePin(id: string): Promise<Note> {
    const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id);
    return this.notes.updateNote(id, { isPinned: !n.isPinned });
  }

  async toggleFavorite(id: string): Promise<Note> {
    const n = await this.notes.getNoteById(id);
    if (!n) throw new NotFoundError("Note", id);
    return this.notes.updateNote(id, { isFavorite: !n.isFavorite });
  }
}
