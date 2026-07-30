import type { ILegacyKeyStore } from "@/services/vault/ILegacyKeyStore";

export class InMemoryLegacyKeyStore implements ILegacyKeyStore {
  constructor(private value: string | null = null) {}

  get(): string | null {
    return this.value;
  }

  remove(): void {
    this.value = null;
  }

  seed(value: string): void {
    this.value = value;
  }
}
