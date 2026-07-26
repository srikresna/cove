import { invoke } from "@tauri-apps/api/core";
import { SQLiteDatabase } from "../repositories/SQLiteDatabase";
import { SQLiteKmsRepository } from "../repositories/SQLiteKmsRepository";
import { SQLiteMigrationRepository } from "../repositories/SQLiteMigrationRepository";
import { SQLiteNoteLinkRepository } from "../repositories/SQLiteNoteLinkRepository";
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import { SQLiteTagRepository } from "../repositories/SQLiteTagRepository";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import type { INoteService } from "../services/INoteService";
import type { ITagService } from "../services/ITagService";
import type { IWorkspaceService } from "../services/IWorkspaceService";
import { NoteService } from "../services/NoteService";
import { TagService } from "../services/TagService";
import { type KdfDerive, VaultService } from "../services/VaultService";
import { WorkspaceService } from "../services/WorkspaceService";
import { CryptoVault } from "../services/vault/CryptoVault";
import { DeviceBind } from "../services/vault/DeviceBind";
import type { IBackupService } from "../services/vault/IBackupService";
import { KeyringKeychainStore } from "../services/vault/KeyringKeychainStore";
import { LocalStorageLegacyKeyStore } from "../services/vault/LocalStorageLegacyKeyStore";
import { TauriBackupService } from "../services/vault/backup";

const kmsRepository = new SQLiteKmsRepository();
const migrationRepository = new SQLiteMigrationRepository();
const keychainStore = new KeyringKeychainStore();
const cryptoVault = new CryptoVault(kmsRepository);

const noteRepository = new SQLiteNoteRepository();
const workspaceRepository = new SQLiteWorkspaceRepository();
const noteLinkRepository = new SQLiteNoteLinkRepository();
const tagRepository = new SQLiteTagRepository();

export const noteService: INoteService = new NoteService(
  noteRepository,
  cryptoVault,
  noteLinkRepository,
);
export const tagService: ITagService = new TagService(tagRepository);
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
  new LocalStorageLegacyKeyStore(),
);

export const backupService: IBackupService = new TauriBackupService({
  suspend: () => SQLiteDatabase.suspend(),
  resume: () => SQLiteDatabase.resume(),
});
