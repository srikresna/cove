import type { EncryptedPayload } from "@/domain/EncryptedPayload";
import type { CustomIconRow, ICustomIconRepository } from "@/repositories/ICustomIconRepository";

export class InMemoryCustomIconRepository implements ICustomIconRepository {
  rows = new Map<string, { name: string; payload: string }>();

  async list(): Promise<Array<CustomIconRow & { payload: EncryptedPayload }>> {
    return [...this.rows.entries()]
      .map(([id, row]) => ({ id, name: row.name, payload: row.payload as EncryptedPayload }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async get(id: string): Promise<EncryptedPayload | null> {
    const row = this.rows.get(id);
    return row ? (row.payload as EncryptedPayload) : null;
  }

  async upsert(id: string, name: string, payload: EncryptedPayload): Promise<void> {
    this.rows.set(id, { name, payload });
  }

  async delete(id: string): Promise<void> {
    this.rows.delete(id);
  }
}
