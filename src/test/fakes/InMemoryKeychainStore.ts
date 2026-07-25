import type { IKeychainStore } from "../../services/vault/IKeychainStore";

/** In-memory IKeychainStore fake for unit tests (no OS keychain / Tauri IPC). */
export class InMemoryKeychainStore implements IKeychainStore {
  private store = new Map<string, string>();

  private key(service: string, user: string): string {
    return `${service}:${user}`;
  }

  async get(service: string, user: string): Promise<string | null> {
    return this.store.get(this.key(service, user)) ?? null;
  }

  async set(service: string, user: string, value: string): Promise<void> {
    this.store.set(this.key(service, user), value);
  }

  async delete(service: string, user: string): Promise<void> {
    this.store.delete(this.key(service, user));
  }

  /** Test helper: simulate a missing/unavailable OS keychain. */
  clear(): void {
    this.store.clear();
  }
}
