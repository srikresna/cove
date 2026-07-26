import { invoke } from "@tauri-apps/api/core";
import type { IKeychainStore } from "./IKeychainStore";

export class KeyringKeychainStore implements IKeychainStore {
  async get(user: string): Promise<string | null> {
    return (await invoke<string | null>("keychain_get", { user })) ?? null;
  }

  async set(user: string, value: string): Promise<void> {
    await invoke("keychain_set", { user, value });
  }

  async delete(user: string): Promise<void> {
    await invoke("keychain_delete", { user });
  }
}
