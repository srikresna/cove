import { PersistenceError } from "@/errors/AppError";
import type { INoteRepository, NoteRecord } from "@/repositories/INoteRepository";
import type { EncryptedPayload } from "@/services/vault/IEncryptionService";

export class InMemoryNoteRepository implements INoteRepository {
  public notes: NoteRecord[] = [];
  public covers = new Map<string, EncryptedPayload>();
  public callLog: string[] = [];
  public shouldFail = false;

  async getNotesMetadataByWorkspace(workspaceId: string): Promise<NoteRecord[]> {
    this.callLog.push("getNotesMetadataByWorkspace");
    if (this.shouldFail) throw new Error("Fake repo error: getNotesMetadataByWorkspace");
    return this.notes
      .filter((n) => n.workspaceId === workspaceId && n.deletedAt == null)
      .sort((a, b) => b.updatedAt - a.updatedAt || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0))
      .map((n) => ({ ...n, content: "" as EncryptedPayload }));
  }

  async getMetaByIds(ids: string[]): Promise<NoteRecord[]> {
    this.callLog.push(`getMetaByIds:${ids.join(",")}`);
    if (this.shouldFail) throw new Error("Fake repo error: getMetaByIds");
    const idSet = new Set(ids);
    return this.notes
      .filter((n) => idSet.has(n.id))
      .map((n) => ({ ...n, content: "" as EncryptedPayload }));
  }

  async getNoteById(id: string): Promise<NoteRecord | null> {
    this.callLog.push(`getNoteById:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: getNoteById");
    const found = this.notes.find((n) => n.id === id);
    return found ? { ...found } : null;
  }

  async findRecentForSearch(limit: number): Promise<NoteRecord[]> {
    this.callLog.push(`findRecentForSearch:${limit}`);
    if (this.shouldFail) throw new Error("Fake repo error: findRecentForSearch");
    return this.notes
      .filter((n) => n.deletedAt == null)
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, limit)
      .map((n) => ({ ...n }));
  }

  async findNotesForKeyset(
    limit: number,
    cursor?: { updatedAt: number; id: string },
  ): Promise<NoteRecord[]> {
    this.callLog.push("findNotesForKeyset");
    if (this.shouldFail) throw new Error("Fake repo error: findNotesForKeyset");
    return this.notes
      .filter(
        (n) =>
          n.deletedAt == null &&
          (!cursor ||
            n.updatedAt < cursor.updatedAt ||
            (n.updatedAt === cursor.updatedAt && n.id < cursor.id)),
      )
      .sort((a, b) => b.updatedAt - a.updatedAt || (a.id < b.id ? 1 : a.id > b.id ? -1 : 0))
      .slice(0, limit)
      .map((n) => ({ ...n }));
  }

  async createNote(noteInput: Omit<NoteRecord, "createdAt" | "updatedAt">): Promise<NoteRecord> {
    this.callLog.push(`createNote:${noteInput.id}`);
    if (this.shouldFail) throw new Error("Fake repo error: createNote");
    const now = Date.now();
    const note: NoteRecord = { ...noteInput, createdAt: now, updatedAt: now };
    this.notes.unshift(note);
    return note;
  }

  async updateNote(id: string, updates: Partial<NoteRecord>): Promise<NoteRecord> {
    this.callLog.push(`updateNote:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: updateNote");
    const index = this.notes.findIndex((n) => n.id === id);
    const existing = this.notes[index];
    if (index === -1 || !existing) {
      throw new PersistenceError("updateNote", `Note not found after update: ${id}`);
    }
    const updated: NoteRecord = { ...existing, ...updates, updatedAt: Date.now() };
    this.notes[index] = updated;
    return updated;
  }

  async deleteNote(id: string): Promise<void> {
    this.callLog.push(`deleteNote:${id}`);
    if (this.shouldFail) throw new Error("Fake repo error: deleteNote");
    this.notes = this.notes.filter((n) => n.id !== id);
    this.covers.delete(id);
  }

  async deleteNotesByWorkspace(workspaceId: string): Promise<void> {
    this.callLog.push(`deleteNotesByWorkspace:${workspaceId}`);
    if (this.shouldFail) throw new Error("Fake repo error: deleteNotesByWorkspace");
    for (const n of this.notes) {
      if (n.workspaceId === workspaceId) this.covers.delete(n.id);
    }
    this.notes = this.notes.filter((n) => n.workspaceId !== workspaceId);
  }

  async getCover(noteId: string): Promise<EncryptedPayload | null> {
    this.callLog.push(`getCover:${noteId}`);
    if (this.shouldFail) throw new Error("Fake repo error: getCover");
    return this.covers.get(noteId) ?? null;
  }

  async upsertCover(noteId: string, payload: EncryptedPayload): Promise<void> {
    this.callLog.push(`upsertCover:${noteId}`);
    if (this.shouldFail) throw new Error("Fake repo error: upsertCover");
    this.covers.set(noteId, payload);
  }

  async deleteCover(noteId: string): Promise<void> {
    this.callLog.push(`deleteCover:${noteId}`);
    if (this.shouldFail) throw new Error("Fake repo error: deleteCover");
    this.covers.delete(noteId);
  }

  async listTrashed(): Promise<NoteRecord[]> {
    this.callLog.push("listTrashed");
    if (this.shouldFail) throw new Error("Fake repo error: listTrashed");
    return this.notes
      .filter((n) => n.deletedAt != null)
      .sort((a, b) => (b.deletedAt ?? 0) - (a.deletedAt ?? 0))
      .map((n) => ({ ...n, content: "" as EncryptedPayload }));
  }

  async setDeleted(id: string, deletedAt: number | null): Promise<void> {
    this.callLog.push(`setDeleted:${id}:${deletedAt}`);
    if (this.shouldFail) throw new Error("Fake repo error: setDeleted");
    this.notes = this.notes.map((n) =>
      n.id === id ? { ...n, deletedAt: deletedAt ?? undefined } : n,
    );
  }

  async findExpiredTrash(cutoff: number): Promise<string[]> {
    this.callLog.push(`findExpiredTrash:${cutoff}`);
    if (this.shouldFail) throw new Error("Fake repo error: findExpiredTrash");
    return this.notes.filter((n) => n.deletedAt != null && n.deletedAt < cutoff).map((n) => n.id);
  }
}
