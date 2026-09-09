import type { EncryptedPayload } from "../domain/EncryptedPayload";
import { ValidationError } from "../domain/errors";
import type { ICustomIconRepository } from "../repositories/ICustomIconRepository";
import type { CustomIcon, ICustomIconService } from "./ICustomIconService";
import { customIconAad } from "./vault/aad";
import type { IEncryptionService } from "./vault/IEncryptionService";

interface CustomIconServiceDeps {
  icons: ICustomIconRepository;
  crypto: IEncryptionService;
}

export class CustomIconService implements ICustomIconService {
  constructor(private readonly deps: CustomIconServiceDeps) {}

  async list(): Promise<CustomIcon[]> {
    const rows = await this.deps.icons.list();
    const icons: CustomIcon[] = [];
    for (const row of rows) {
      try {
        icons.push({
          id: row.id,
          name: row.name,
          dataUrl: await this.deps.crypto.decryptPayload(row.payload, customIconAad(row.id)),
        });
      } catch {}
    }
    return icons;
  }

  async add(name: string, dataUrl: string): Promise<CustomIcon> {
    const trimmed = name.trim();
    if (!trimmed) throw new ValidationError("Custom icon name cannot be empty.");
    const id = crypto.randomUUID();
    const payload: EncryptedPayload = await this.deps.crypto.encryptPayload(
      dataUrl,
      customIconAad(id),
    );
    await this.deps.icons.upsert(id, trimmed, payload);
    return { id, name: trimmed, dataUrl };
  }

  async remove(id: string): Promise<void> {
    await this.deps.icons.delete(id);
  }
}
