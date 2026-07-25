import type { IMigrationRepository, LegacyRow } from "../../repositories/IMigrationRepository";

/**
 * In-memory IMigrationRepository fake. Holds raw encrypted content per note id
 * plus a migrated flag, so VaultService migration can be unit-tested without SQLite.
 */
export class InMemoryMigrationRepository implements IMigrationRepository {
  private rows = new Map<string, { content: string; migrated: boolean }>();
  private failures = new Map<string, string>();

  /** Test helper: seed a legacy (unmigrated) row with raw ciphertext. */
  seed(id: string, content: string): void {
    this.rows.set(id, { content, migrated: false });
  }

  async findLegacyBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    const ids = [...this.rows.keys()].filter((id) => !this.rows.get(id)?.migrated).sort();
    const filtered = afterId ? ids.filter((id) => id > afterId) : ids;
    return filtered
      .slice(0, limit)
      .map((id) => ({ id, content: this.rows.get(id)?.content ?? "" }));
  }

  async markMigrated(id: string, encryptedContent: string): Promise<void> {
    const row = this.rows.get(id);
    if (row) this.rows.set(id, { content: encryptedContent, migrated: true });
    else this.rows.set(id, { content: encryptedContent, migrated: true });
  }

  async recordFailure(id: string, reason: string): Promise<void> {
    this.failures.set(id, reason);
  }

  async countLegacy(): Promise<number> {
    return [...this.rows.values()].filter((r) => !r.migrated).length;
  }

  /** Test helper: inspect a row's (possibly re-encrypted) content. */
  contentOf(id: string): string | undefined {
    return this.rows.get(id)?.content;
  }

  /** Test helper: did a given row get marked migrated? */
  isMigrated(id: string): boolean {
    return this.rows.get(id)?.migrated ?? false;
  }
}
