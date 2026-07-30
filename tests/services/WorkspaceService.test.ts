import { BusinessRuleError, NotFoundError } from "@/domain/errors";
import { WorkspaceService } from "@/services/WorkspaceService";
import { describe, expect, it } from "vitest";
import { InMemoryWorkspaceRepository } from "../fakes/InMemoryWorkspaceRepository";

describe("WorkspaceService", () => {
  it("getAllWorkspaces, getWorkspace, createWorkspace, updateWorkspace work as expected", async () => {
    const wsRepo = new InMemoryWorkspaceRepository();
    const service = new WorkspaceService(wsRepo);

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
    const wsRepo = new InMemoryWorkspaceRepository();
    const service = new WorkspaceService(wsRepo);

    wsRepo.workspaces.push({
      id: "ws-1",
      name: "Only One",
      emoji: "💼",
      color: "#ff6f1e",
      createdAt: 1000,
    });

    await expect(service.deleteWorkspace("ws-1")).rejects.toThrow(BusinessRuleError);
  });

  // Note cascade is enforced at the DB layer (ON DELETE CASCADE on a
  // foreign_keys=ON transaction connection), so it is not asserted here.
  it("deleteWorkspace removes the workspace when more than one exists", async () => {
    const wsRepo = new InMemoryWorkspaceRepository();
    const service = new WorkspaceService(wsRepo);

    wsRepo.workspaces.push(
      { id: "ws-1", name: "First", emoji: "💼", color: "#ff6f1e", createdAt: 1000 },
      { id: "ws-2", name: "Second", emoji: "🚀", color: "#ff70a6", createdAt: 2000 },
    );

    await service.deleteWorkspace("ws-1");

    expect(wsRepo.workspaces).toHaveLength(1);
    expect(wsRepo.workspaces[0]?.id).toBe("ws-2");
  });

  it("deleteWorkspace throws NotFoundError if workspace does not exist", async () => {
    const wsRepo = new InMemoryWorkspaceRepository();
    const service = new WorkspaceService(wsRepo);

    wsRepo.workspaces.push(
      { id: "ws-1", name: "First", emoji: "💼", color: "#ff6f1e", createdAt: 1000 },
      { id: "ws-2", name: "Second", emoji: "🚀", color: "#ff70a6", createdAt: 2000 },
    );

    await expect(service.deleteWorkspace("non-existent")).rejects.toThrow(NotFoundError);
  });
});
