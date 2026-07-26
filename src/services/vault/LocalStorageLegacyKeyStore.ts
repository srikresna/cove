import type { ILegacyKeyStore } from "./ILegacyKeyStore";

/** Where the pre-vault app stored its (hex) encryption key. */
const LEGACY_STORAGE_KEY = "cove_device_sec_key";

/** Real ILegacyKeyStore over localStorage — the pre-vault key's historical home. */
export class LocalStorageLegacyKeyStore implements ILegacyKeyStore {
  get(): string | null {
    return localStorage.getItem(LEGACY_STORAGE_KEY);
  }

  remove(): void {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}
