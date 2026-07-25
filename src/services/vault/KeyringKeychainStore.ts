import { deletePassword, getPassword, setPassword } from "tauri-plugin-keyring-api";
import type { IKeychainStore } from "./IKeychainStore";

/** Real IKeychainStore backed by the OS credential store via tauri-plugin-keyring. */
export class KeyringKeychainStore implements IKeychainStore {
  async get(service: string, user: string): Promise<string | null> {
    return getPassword(service, user);
  }

  async set(service: string, user: string, value: string): Promise<void> {
    await setPassword(service, user, value);
  }

  async delete(service: string, user: string): Promise<void> {
    await deletePassword(service, user);
  }
}
