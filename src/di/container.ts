import { invoke } from "@tauri-apps/api/core";
import type { INoteRepository } from "../repositories/INoteRepository";
import type { IWorkspaceRepository } from "../repositories/IWorkspaceRepository";
import { SQLiteKmsRepository } from "../repositories/SQLiteKmsRepository";
import { SQLiteMigrationRepository } from "../repositories/SQLiteMigrationRepository";
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import type { INoteService } from "../services/INoteService";
import type { IWorkspaceService } from "../services/IWorkspaceService";
import { NoteService } from "../services/NoteService";
import { type KdfDerive, VaultService } from "../services/VaultService";
import { WorkspaceService } from "../services/WorkspaceService";
import { CryptoVault } from "../services/vault/CryptoVault";
import { DeviceBind } from "../services/vault/DeviceBind";
import { KeyringKeychainStore } from "../services/vault/KeyringKeychainStore";

// --- Vault singletons ---
const kmsRepository = new SQLiteKmsRepository();
const migrationRepository = new SQLiteMigrationRepository();
const keychainStore = new KeyringKeychainStore();
const cryptoVault = new CryptoVault(kmsRepository);

const noteRepository = new SQLiteNoteRepository(cryptoVault);
const workspaceRepository = new SQLiteWorkspaceRepository();

export const noteService: INoteService = new NoteService(noteRepository, cryptoVault);
export const workspaceService: IWorkspaceService = new WorkspaceService(
  workspaceRepository,
  noteRepository,
);
const deviceBind = new DeviceBind();
const deriveKeyFn: KdfDerive = async (passphrase, salt, kdfAlg, params) => {
  const result = await invoke<number[]>("derive_key_kdf", {
    passphrase,
    salt: Array.from(salt),
    kdfAlg,
    params,
  });
  return new Uint8Array(result);
};
export const vaultService = new VaultService(
  cryptoVault,
  kmsRepository,
  keychainStore,
  migrationRepository,
  deviceBind,
  deriveKeyFn,
);

export const createNoteService = (repo: INoteRepository): INoteService =>
  new NoteService(repo, cryptoVault);
export const createWorkspaceService = (
  wsRepo: IWorkspaceRepository,
  noteRepo: INoteRepository,
): IWorkspaceService => new WorkspaceService(wsRepo, noteRepo);
