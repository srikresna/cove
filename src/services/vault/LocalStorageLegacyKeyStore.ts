import type { ILegacyKeyStore } from "./ILegacyKeyStore";

const LEGACY_STORAGE_KEY = "cove_device_sec_key";

export class LocalStorageLegacyKeyStore implements ILegacyKeyStore {
  get(): string | null {
    return localStorage.getItem(LEGACY_STORAGE_KEY);
  }

  remove(): void {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
  }
}
