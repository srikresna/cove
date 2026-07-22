import type { INoteRepository } from "../repositories/INoteRepository";
import type { IWorkspaceRepository } from "../repositories/IWorkspaceRepository";
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import type { INoteService } from "../services/INoteService";
import type { IWorkspaceService } from "../services/IWorkspaceService";
import { NoteService } from "../services/NoteService";
import { WorkspaceService } from "../services/WorkspaceService";

const noteRepository = new SQLiteNoteRepository();
const workspaceRepository = new SQLiteWorkspaceRepository();

export const noteService: INoteService = new NoteService(noteRepository);
export const workspaceService: IWorkspaceService = new WorkspaceService(
  workspaceRepository,
  noteRepository,
);

export const createNoteService = (repo: INoteRepository): INoteService => new NoteService(repo);
export const createWorkspaceService = (
  wsRepo: IWorkspaceRepository,
  noteRepo: INoteRepository,
): IWorkspaceService => new WorkspaceService(wsRepo, noteRepo);
