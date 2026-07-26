import type { IKeychainStore } from "../../services/vault/IKeychainStore";

export class InMemoryKeychainStore implements IKeychainStore {
  private store = new Map<string, string>();

  async get(user: string): Promise<string | null> {
    return this.store.get(user) ?? null;
  }

  async set(user: string, value: string): Promise<void> {
    this.store.set(user, value);
  }

  async delete(user: string): Promise<void> {
    this.store.delete(user);
  }

  clear(): void {
    this.store.clear();
  }
}
