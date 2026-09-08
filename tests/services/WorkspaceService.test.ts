import { describe, expect, it } from "vitest";
import type { EncryptedPayload } from "@/domain/EncryptedPayload";
import { BusinessRuleError, NotFoundError, ValidationError } from "@/domain/errors";
import type { IEncryptionService } from "@/services/vault/IEncryptionService";
import { WorkspaceService } from "@/services/WorkspaceService";
import { InMemoryWorkspaceRepository } from "../fakes/InMemoryWorkspaceRepository";

const identityCrypto = {
  encryptPayload: async (p: string) => p as EncryptedPayload,
  decryptPayload: async (p: string) => p as string,
} as unknown as IEncryptionService;

const makeService = () => {
  const wsRepo = new InMemoryWorkspaceRepository();
  const service = new WorkspaceService({ workspaces: wsRepo, crypto: identityCrypto });
  return { wsRepo, service };
};

describe("WorkspaceService", () => {
  it("getAllWorkspaces, getWorkspace, createWorkspace, updateWorkspace work as expected", async () => {
    const { service } = makeService();

    const created = await service.createWorkspace(
      "Side Hustle",
      "🚀",
      "#ff6f1e",
      "My side projects",
    );
    expect(created.name).toBe("Side Hustle");

    const all = await service.getAllWorkspaces();
    expect(all).toHaveLength(1);

    const fetched = await service.getWorkspace(created.id);
    expect(fetched?.name).toBe("Side Hustle");

    const updated = await service.updateWorkspace(created.id, { name: "Updated Side Hustle" });
    expect(updated.name).toBe("Updated Side Hustle");
  });

  it("deleteWorkspace throws BusinessRuleError when deleting the last workspace", async () => {
    const { wsRepo, service } = makeService();

    wsRepo.workspaces.push({
      id: "ws-1",
      name: "Only One",
      emoji: "💼",
      color: "#ff6f1e",
      createdAt: 1000,
    });

    await expect(service.deleteWorkspace("ws-1")).rejects.toThrow(BusinessRuleError);
  });

  it("deleteWorkspace removes the workspace (and its icon) when more than one exists", async () => {
    const { wsRepo, service } = makeService();

    wsRepo.workspaces.push(
      { id: "ws-1", name: "First", emoji: "💼", color: "#ff6f1e", createdAt: 1000 },
      { id: "ws-2", name: "Second", emoji: "🚀", color: "#ff70a6", createdAt: 2000 },
    );
    wsRepo.icons.set("ws-1", "enc-payload" as EncryptedPayload);

    await service.deleteWorkspace("ws-1");

    expect(wsRepo.workspaces).toHaveLength(1);
    expect(wsRepo.workspaces[0]?.id).toBe("ws-2");
    expect(wsRepo.icons.has("ws-1")).toBe(false);
  });

  it("deleteWorkspace throws NotFoundError if workspace does not exist", async () => {
    const { wsRepo, service } = makeService();

    wsRepo.workspaces.push(
      { id: "ws-1", name: "First", emoji: "💼", color: "#ff6f1e", createdAt: 1000 },
      { id: "ws-2", name: "Second", emoji: "🚀", color: "#ff70a6", createdAt: 2000 },
    );

    await expect(service.deleteWorkspace("non-existent")).rejects.toThrow(NotFoundError);
  });

  it("renameWorkspace trims, rejects empty names, and persists the change", async () => {
    const { wsRepo, service } = makeService();
    wsRepo.workspaces.push({
      id: "ws-1",
      name: "First",
      emoji: "💼",
      color: "#ff6f1e",
      createdAt: 1000,
    });

    const renamed = await service.renameWorkspace("ws-1", "  Renamed  ");
    expect(renamed.name).toBe("Renamed");

    await expect(service.renameWorkspace("ws-1", "   ")).rejects.toThrow(ValidationError);
    await expect(service.renameWorkspace("missing", "X")).rejects.toThrow(NotFoundError);
  });

  it("icon roundtrip: null before, setIcon stores encrypted payload, getIcon decrypts, removeIcon clears", async () => {
    const { wsRepo, service } = makeService();
    wsRepo.workspaces.push({
      id: "ws-1",
      name: "First",
      emoji: "💼",
      color: "#ff6f1e",
      createdAt: 1000,
    });

    expect(await service.getIcon("ws-1")).toBeNull();

    await service.setIcon("ws-1", "data:image/webp;base64,AAAA");
    expect(await service.getIcon("ws-1")).toBe("data:image/webp;base64,AAAA");
    expect(wsRepo.icons.get("ws-1")).toBe("data:image/webp;base64,AAAA");

    await service.removeIcon("ws-1");
    expect(await service.getIcon("ws-1")).toBeNull();
  });

  it("setIcon on a missing workspace throws NotFoundError", async () => {
    const { service } = makeService();
    await expect(service.setIcon("missing", "data:image/webp;base64,AAAA")).rejects.toThrow(
      NotFoundError,
    );
  });
});
