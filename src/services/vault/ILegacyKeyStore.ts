export interface ILegacyKeyStore {
  get(): string | null;
  remove(): void;
}
