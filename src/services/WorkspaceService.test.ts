import { describe, expect, it } from "vitest";
import { BusinessRuleError, NotFoundError } from "../domain/errors";
import { InMemoryNoteRepository } from "../test/fakes/InMemoryNoteRepository";
import { InMemoryWorkspaceRepository } from "../test/fakes/InMemoryWorkspaceRepository";
import { WorkspaceService } from "./WorkspaceService";

describe("WorkspaceService", () => {
  it("getAllWorkspaces, getWorkspace, createWorkspace, updateWorkspace work as expected", async () => {
    const wsRepo = new InMemoryWorkspaceRepository();
    const noteRepo = new InMemoryNoteRepository();
    const service = new WorkspaceService(wsRepo, noteRepo);

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
    const noteRepo = new InMemoryNoteRepository();
    const service = new WorkspaceService(wsRepo, noteRepo);

    wsRepo.workspaces.push({
      id: "ws-1",
      name: "Only One",
      emoji: "💼",
      color: "#ff6f1e",
      createdAt: 1000,
    });

    await expect(service.deleteWorkspace("ws-1", 1)).rejects.toThrow(BusinessRuleError);
  });

  it("deleteWorkspace cascades note deletion and deletes workspace when count > 1", async () => {
    const wsRepo = new InMemoryWorkspaceRepository();
    const noteRepo = new InMemoryNoteRepository();
    const service = new WorkspaceService(wsRepo, noteRepo);

    wsRepo.workspaces.push(
      { id: "ws-1", name: "First", emoji: "💼", color: "#ff6f1e", createdAt: 1000 },
      { id: "ws-2", name: "Second", emoji: "🚀", color: "#ff70a6", createdAt: 2000 },
    );

    noteRepo.notes.push({
      id: "note-1",
      workspaceId: "ws-1",
      title: "Note in ws 1",
      content: "",
      isPinned: false,
      isFavorite: false,
      createdAt: 1000,
      updatedAt: 2000,
    });

    await service.deleteWorkspace("ws-1", 2);

    expect(wsRepo.workspaces).toHaveLength(1);
    const first = wsRepo.workspaces[0];
    expect(first).toBeDefined();
    if (first) {
      expect(first.id).toBe("ws-2");
    }
    expect(noteRepo.notes).toHaveLength(0);
  });

  it("deleteWorkspace throws NotFoundError if workspace does not exist", async () => {
    const wsRepo = new InMemoryWorkspaceRepository();
    const noteRepo = new InMemoryNoteRepository();
    const service = new WorkspaceService(wsRepo, noteRepo);

    wsRepo.workspaces.push(
      { id: "ws-1", name: "First", emoji: "💼", color: "#ff6f1e", createdAt: 1000 },
      { id: "ws-2", name: "Second", emoji: "🚀", color: "#ff70a6", createdAt: 2000 },
    );

    await expect(service.deleteWorkspace("non-existent", 2)).rejects.toThrow(NotFoundError);
  });
});
