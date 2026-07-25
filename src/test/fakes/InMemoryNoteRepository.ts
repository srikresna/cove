import type { Note } from "../../domain/note/Note";
import type { INoteRepository } from "../../repositories/INoteRepository";

export class InMemoryNoteRepository implements INoteRepository {
  public notes: Note[] = [];
  public callLog: string[] = [];
  public shouldFail = false;

  async getAllNotes(): Promise<Note[]> {
    this.callLog.push("getAllNotes");
    if (this.shouldFail) throw new Error("Fake repo error: getAllNotes");
    return [...this.notes];
  }

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<Note[]> {
    this.callLog.push("getNotesMetadataByWorkspace");
    if (this.shouldFail) throw new Error("Fake repo error: getNotesMetadataByWorkspace");
    return this.notes
      .filter((n) => n.workspaceId === workspaceId)
      .map((n) => ({ ...n, content: "" }));
  }

  async getNotesByWorkspace(workspaceId: string): Promise<Note[]> {
    this.callLog.push("getNotesByWorkspace");
    if (this.shouldFail) throw new Error("Fake repo error: getNotesByWorkspace");
    return this.notes.filter((n) => n.workspaceId === workspaceId);
  }

  async getNoteById(id: string): Promise<Note | null> {
    this.callLog.push(`getNoteById:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: getNoteById");
    const found = this.notes.find((n) => n.id === id);
    return found ? { ...found } : null;
  }

  async createNote(noteInput: Omit<Note, "createdAt" | "updatedAt">): Promise<Note> {
    this.callLog.push(`createNote:${noteInput.id}`);
    if (this.shouldFail) throw new Error("Fake repo error: createNote");
    const now = Date.now();
    const note: Note = { ...noteInput, createdAt: now, updatedAt: now };
    this.notes.unshift(note);
    return note;
  }

  async updateNote(id: string, updates: Partial<Note>): Promise<Note> {
    this.callLog.push(`updateNote:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: updateNote");
    const index = this.notes.findIndex((n) => n.id === id);
    const existing = this.notes[index];
    if (index === -1 || !existing) throw new Error(`Note not found: ${id}`);
    const updated: Note = { ...existing, ...updates, updatedAt: Date.now() };
    this.notes[index] = updated;
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    this.callLog.push(`deleteNote:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: deleteNote");
    this.notes = this.notes.filter((n) => n.id !== id);
  }

  async deleteNotesByWorkspace(workspaceId: string): Promise<void> {
    this.callLog.push(`deleteNotesByWorkspace:${workspaceId}`);
    if (this.shouldFail) throw new Error("Fake repo error: deleteNotesByWorkspace");
    this.notes = this.notes.filter((n) => n.workspaceId !== workspaceId);
  }
}
