export type MigrationState =
  | "pending_migration"
  | "in_progress"
  | "rotation_in_progress"
  | "complete";

export interface KmsRecord {
  kdfVersion: number;
  kdfAlg: string;
  kdfParamsJson: string;
  saltB64: string;
  ivCounter: number;
  wrappedDekLocalB64: string | null;
  integrityMacB64: string;
  migrationState: MigrationState;
  migrationCursor: string | null;
  createdAt: number;
  updatedAt: number;
}

export interface KmsPatch {
  ivCounter?: number;
  wrappedDekLocalB64?: string | null;
  integrityMacB64?: string;
  migrationState?: MigrationState;
  migrationCursor?: string | null;
}

export interface IKmsRepository {
  get(): Promise<KmsRecord | null>;
  save(rec: KmsRecord): Promise<void>;
  update(patch: KmsPatch): Promise<KmsRecord>;
  setIvCounter(n: number): Promise<void>;
}
