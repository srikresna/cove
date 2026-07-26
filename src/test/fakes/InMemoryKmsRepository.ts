import type { IKmsRepository, KmsPatch, KmsRecord } from "../../repositories/IKmsRepository";

export class InMemoryKmsRepository implements IKmsRepository {
  private record: KmsRecord | null = null;

  constructor(initial: KmsRecord | null = null) {
    this.record = initial;
  }

  async get(): Promise<KmsRecord | null> {
    return this.record ? { ...this.record } : null;
  }

  async save(rec: KmsRecord): Promise<void> {
    this.record = { ...rec };
  }

  async update(patch: KmsPatch): Promise<KmsRecord> {
    if (!this.record) throw new Error("InMemoryKmsRepository: no kms record to update");
    this.record = {
      ...this.record,
      ...patch,
      ivCounter: patch.ivCounter ?? this.record.ivCounter,
      updatedAt: Date.now(),
    };
    return { ...this.record };
  }

  async setIvCounter(n: number): Promise<void> {
    if (!this.record) throw new Error("InMemoryKmsRepository: no kms record");
    this.record.ivCounter = n;
  }

  clear(): void {
    this.record = null;
  }
}
