import type { ILegacyKeyStore } from "../../services/vault/ILegacyKeyStore";

/** In-memory ILegacyKeyStore fake — replaces the localStorage-backed real one in tests. */
export class InMemoryLegacyKeyStore implements ILegacyKeyStore {
  constructor(private value: string | null = null) {}

  get(): string | null {
    return this.value;
  }

  remove(): void {
    this.value = null;
  }

  /** Test helper: seed the legacy key. */
  seed(value: string): void {
    this.value = value;
  }
}
