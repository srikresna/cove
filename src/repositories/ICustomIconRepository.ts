import type { EncryptedPayload } from "../domain/EncryptedPayload";

export interface CustomIconRow {
  id: string;
  name: string;
}

export interface ICustomIconRepository {
  list(): Promise<Array<CustomIconRow & { payload: EncryptedPayload }>>;
  get(id: string): Promise<EncryptedPayload | null>;
  upsert(id: string, name: string, payload: EncryptedPayload): Promise<void>;
  delete(id: string): Promise<void>;
}
