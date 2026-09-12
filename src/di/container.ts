import type { BlobSource } from "@blocksuite/sync";
import { invoke } from "@tauri-apps/api/core";
import "./../services/blocksuite/externalLinks";
import "./../services/blocksuite/idempotentCustomElements";
import { SQLiteBlobRepository } from "../repositories/SQLiteBlobRepository";
import { SQLiteCustomIconRepository } from "../repositories/SQLiteCustomIconRepository";
import { SQLiteDatabase } from "../repositories/SQLiteDatabase";
import { SQLiteKmsRepository } from "../repositories/SQLiteKmsRepository";
import { SQLiteMigrationRepository } from "../repositories/SQLiteMigrationRepository";
import { SQLiteNoteLinkRepository } from "../repositories/SQLiteNoteLinkRepository";
import { SQLiteNoteRepository } from "../repositories/SQLiteNoteRepository";
import { SQLitePropertyRepository } from "../repositories/SQLitePropertyRepository";
import { SQLiteSavedViewRepository } from "../repositories/SQLiteSavedViewRepository";
import { SQLiteTagRepository } from "../repositories/SQLiteTagRepository";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import { BlockSuiteEditorService } from "../services/blocksuite/BlockSuiteEditorService";
import type { IBlockSuiteEditorService } from "../services/blocksuite/IBlockSuiteEditorService";
import { CustomIconService } from "../services/CustomIconService";
import { publishingWrites } from "../services/changeBus";
import type { ICustomIconService } from "../services/ICustomIconService";
import type { INoteService } from "../services/INoteService";
import type { IPropertyService } from "../services/IPropertyService";
import type { ISavedViewService } from "../services/ISavedViewService";
import type { ITagService } from "../services/ITagService";
import type { IVaultService } from "../services/IVaultService";
import type { IWorkspaceService } from "../services/IWorkspaceService";
import { NoteService } from "../services/NoteService";
import { PropertyService } from "../services/PropertyService";
import { SavedViewService } from "../services/SavedViewService";
import { TagService } from "../services/TagService";
import { type KdfDerive, VaultService } from "../services/VaultService";
import { TauriBackupService } from "../services/vault/backup";
import { CryptoVault } from "../services/vault/CryptoVault";
import { DeviceBind } from "../services/vault/DeviceBind";
import type { IBackupService } from "../services/vault/IBackupService";
import { KeyringKeychainStore } from "../services/vault/KeyringKeychainStore";
import { LocalStorageLegacyKeyStore } from "../services/vault/LocalStorageLegacyKeyStore";
import { SqliteBlobSource } from "../services/vault/SqliteBlobSource";
import { WorkspaceService } from "../services/WorkspaceService";

const kmsRepository = new SQLiteKmsRepository();
const migrationRepository = new SQLiteMigrationRepository();
const keychainStore = new KeyringKeychainStore();
const cryptoVault = new CryptoVault(kmsRepository);

const noteRepository = new SQLiteNoteRepository();
const workspaceRepository = new SQLiteWorkspaceRepository();
const noteLinkRepository = new SQLiteNoteLinkRepository();
const tagRepository = publishingWrites(
  new SQLiteTagRepository(),
  ["create", "update", "delete", "addToNote", "removeFromNote"],
  "tags",
);
const propertyRepository = publishingWrites(
  new SQLitePropertyRepository(),
  [
    "createDefinition",
    "updateDefinition",
    "updateOptions",
    "appendOption",
    "deleteDefinition",
    "applyOptionDeletion",
    "setValue",
    "removeValue",
  ],
  "properties",
);
const blobRepository = new SQLiteBlobRepository();
const customIconRepository = new SQLiteCustomIconRepository();

export const blobSource: BlobSource & { clearCache(): void } = new SqliteBlobSource(
  blobRepository,
  cryptoVault,
);

export const noteService: INoteService = new NoteService(
  noteRepository,
  cryptoVault,
  noteLinkRepository,
  blobSource,
);
export const tagService: ITagService = new TagService(tagRepository, noteService);
export const propertyService: IPropertyService = new PropertyService(propertyRepository);
export const savedViewService: ISavedViewService = new SavedViewService(
  new SQLiteSavedViewRepository(),
);
export const workspaceService: IWorkspaceService = new WorkspaceService({
  workspaces: workspaceRepository,
  crypto: cryptoVault,
});
export const customIconService: ICustomIconService = new CustomIconService({
  icons: customIconRepository,
  crypto: cryptoVault,
});
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
export const vaultService: IVaultService = new VaultService(
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

export const blockSuiteEditorService: IBlockSuiteEditorService = new BlockSuiteEditorService({
  blobSource,
});
vaultService.onLock(() => blockSuiteEditorService.reset());

vaultService.onLock(() => blobSource.clearCache());
