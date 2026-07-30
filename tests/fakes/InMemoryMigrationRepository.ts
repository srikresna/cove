import type { IMigrationRepository, LegacyRow } from "@/repositories/IMigrationRepository";

export class InMemoryMigrationRepository implements IMigrationRepository {
  private rows = new Map<string, { content: string; migrated: boolean }>();
  private coverRows = new Map<string, string>();
  private failures = new Map<string, string>();

  seed(id: string, content: string): void {
    this.rows.set(id, { content, migrated: false });
  }

  seedCover(noteId: string, payload: string): void {
    this.coverRows.set(noteId, payload);
  }

  async findLegacyBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    const ids = [...this.rows.keys()].filter((id) => !this.rows.get(id)?.migrated).sort();
    const filtered = afterId ? ids.filter((id) => id > afterId) : ids;
    return filtered
      .slice(0, limit)
      .map((id) => ({ id, content: this.rows.get(id)?.content ?? "" }));
  }

  async findAllBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    const ids = [...this.rows.keys()].sort();
    const filtered = afterId ? ids.filter((id) => id > afterId) : ids;
    return filtered
      .slice(0, limit)
      .map((id) => ({ id, content: this.rows.get(id)?.content ?? "" }));
  }

  async findAllCoverBatch(afterId: string | null, limit: number): Promise<LegacyRow[]> {
    const ids = [...this.coverRows.keys()].sort();
    const filtered = afterId ? ids.filter((id) => id > afterId) : ids;
    return filtered.slice(0, limit).map((id) => ({ id, content: this.coverRows.get(id) ?? "" }));
  }

  async markCoverMigrated(noteId: string, encryptedPayload: string): Promise<void> {
    this.coverRows.set(noteId, encryptedPayload);
  }

  coverContentOf(noteId: string): string | undefined {
    return this.coverRows.get(noteId);
  }

  async markMigrated(id: string, encryptedContent: string): Promise<void> {
    this.rows.set(id, { content: encryptedContent, migrated: true });
  }

  async recordFailure(id: string, reason: string): Promise<void> {
    this.failures.set(id, reason);
  }

  async countLegacy(): Promise<number> {
    return [...this.rows.values()].filter((r) => !r.migrated).length;
  }

  contentOf(id: string): string | undefined {
    return this.rows.get(id)?.content;
  }

  isMigrated(id: string): boolean {
    return this.rows.get(id)?.migrated ?? false;
  }
}
