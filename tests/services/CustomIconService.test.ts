import { describe, expect, it } from "vitest";
import type { EncryptedPayload } from "@/domain/EncryptedPayload";
import { ValidationError } from "@/domain/errors";
import { CustomIconService } from "@/services/CustomIconService";
import type { IEncryptionService } from "@/services/vault/IEncryptionService";
import { InMemoryCustomIconRepository } from "../fakes/InMemoryCustomIconRepository";

const identityCrypto = {
  encryptPayload: async (p: string) => p as EncryptedPayload,
  decryptPayload: async (p: string) => p as string,
} as unknown as IEncryptionService;

const makeService = () => {
  const repo = new InMemoryCustomIconRepository();
  const service = new CustomIconService({ icons: repo, crypto: identityCrypto });
  return { repo, service };
};

describe("CustomIconService", () => {
  it("add mints an id, trims the name, and persists the payload", async () => {
    const { repo, service } = makeService();

    const added = await service.add("  logo  ", "data:image/webp;base64,AAAA");
    expect(added.id).toBeTruthy();
    expect(added.name).toBe("logo");
    expect(added.dataUrl).toBe("data:image/webp;base64,AAAA");
    expect(repo.rows.get(added.id)).toEqual({
      name: "logo",
      payload: "data:image/webp;base64,AAAA",
    });
  });

  it("add rejects an empty name", async () => {
    const { service } = makeService();
    await expect(service.add("   ", "data:image/webp;base64,AAAA")).rejects.toThrow(
      ValidationError,
    );
  });

  it("list decrypts every stored payload back into data urls", async () => {
    const { service } = makeService();
    const a = await service.add("alpha", "data:image/webp;base64,AAA");
    const b = await service.add("beta", "data:image/webp;base64,BBB");

    const all = await service.list();
    expect(all).toHaveLength(2);
    expect(all.find((i) => i.id === a.id)?.dataUrl).toBe("data:image/webp;base64,AAA");
    expect(all.find((i) => i.id === b.id)?.name).toBe("beta");
  });

  it("remove deletes the icon from the pack", async () => {
    const { service } = makeService();
    const added = await service.add("logo", "data:image/webp;base64,AAAA");

    await service.remove(added.id);
    expect(await service.list()).toHaveLength(0);
  });
});
