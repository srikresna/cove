export interface IKeychainStore {
  get(user: string): Promise<string | null>;
  set(user: string, value: string): Promise<void>;
  delete(user: string): Promise<void>;
}

export const KEYRING_USERS = {
  dekBackup: "dek-backup",
  legacyBridge: "legacy-dek-bridge",
  ivHighWaterMark: "iv-highwatermark",
} as const;
