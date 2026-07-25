import type { INoteRepository } from "../repositories/INoteRepository";
import type { IWorkspaceRepository } from "../repositories/IWorkspaceRepository";
import { SQLiteKmsRepository } from "../repositories/SQLiteKmsRepository";
import { SQLiteMigrationRepository } from "../repositories/SQLiteMigrationRepository";
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import type { INoteService } from "../services/INoteService";
import type { IWorkspaceService } from "../services/IWorkspaceService";
import { NoteService } from "../services/NoteService";
import { VaultService } from "../services/VaultService";
import { WorkspaceService } from "../services/WorkspaceService";
import { CryptoVault } from "../services/vault/CryptoVault";
import { KeyringKeychainStore } from "../services/vault/KeyringKeychainStore";

const noteRepository = new SQLiteNoteRepository();
const workspaceRepository = new SQLiteWorkspaceRepository();

export const noteService: INoteService = new NoteService(noteRepository);
export const workspaceService: IWorkspaceService = new WorkspaceService(
  workspaceRepository,
  noteRepository,
);

// --- Vault wiring (passphrase-based encryption). The note repository still uses
// the legacy static EncryptionService until the cutover wires it to cryptoVault. ---
const kmsRepository = new SQLiteKmsRepository();
const migrationRepository = new SQLiteMigrationRepository();
const keychainStore = new KeyringKeychainStore();
const cryptoVault = new CryptoVault(kmsRepository);
export const vaultService = new VaultService(
  cryptoVault,
  kmsRepository,
  keychainStore,
  migrationRepository,
);

export const createNoteService = (repo: INoteRepository): INoteService => new NoteService(repo);
export const createWorkspaceService = (
  wsRepo: IWorkspaceRepository,
  noteRepo: INoteRepository,
): IWorkspaceService => new WorkspaceService(wsRepo, noteRepo);
