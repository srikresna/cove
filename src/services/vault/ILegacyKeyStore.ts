/**
 * Storage of the pre-vault legacy encryption key (historically a hex string in
 * localStorage). Injected as a port so VaultService has no hidden
 * platform-global dependency and the migration path is testable against a
 * controlled fake.
 */
export interface ILegacyKeyStore {
  get(): string | null;
  remove(): void;
}
