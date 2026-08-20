import type { Note } from "../domain/note/Note";
import type { NoteSearchHit } from "../domain/note/NoteSearchHit";

export type NoteMeta = Pick<Note, "id" | "workspaceId" | "title" | "icon">;

export interface INoteService {
  backlinksOf(id: string): Promise<NoteMeta[]>;

  outgoingLinksOf(id: string): Promise<NoteMeta[]>;

  getLinkTargets(ids: string[]): Promise<NoteMeta[]>;
  listMetadataByWorkspace(workspaceId: string): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  searchAcrossWorkspaces(query: string): Promise<NoteSearchHit[]>;
  createNote(workspaceId: string, title?: string, content?: string, icon?: string): Promise<Note>;

  createNoteWithId(workspaceId: string, id: string, title?: string): Promise<Note>;
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

  getCoverImage(id: string): Promise<string | null>;
  setCoverImage(id: string, dataUrl: string): Promise<void>;
  removeCoverImage(id: string): Promise<void>;

  deleteNote(id: string): Promise<void>;

  collectWorkspaceBlobCandidates(workspaceId: string): Promise<string[]>;

  gcOrphanBlobs(candidates: string[]): Promise<void>;

  trashNote(id: string): Promise<void>;
  restoreNote(id: string): Promise<void>;

  listTrash(): Promise<Note[]>;

  purgeExpiredTrash(now?: number): Promise<number>;
  duplicateNote(id: string): Promise<Note>;
  togglePin(id: string): Promise<Note>;
  toggleFavorite(id: string): Promise<Note>;
}
