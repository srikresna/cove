import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/domain/errors";
import type { FilterRules } from "@/domain/filters/FilterRule";
import { ValidationError } from "@/errors/AppError";
import { SavedViewService } from "@/services/SavedViewService";
import { InMemorySavedViewRepository } from "../fakes/InMemorySavedViewRepository";

const tagRule = (tagIds: string[]): FilterRules => [
  { id: "r1", kind: "tags", op: "has-any-of", tagIds },
];

const selectRule = (propertyId: string, optionIds: string[]): FilterRules => [
  { id: "r1", kind: "select", propertyId, op: "is", optionIds },
];

describe("SavedViewService", () => {
  it("creates and lists views per workspace with unique names", async () => {
    const service = new SavedViewService(new InMemorySavedViewRepository());
    const view = await service.createView("ws1", "Tagged", tagRule(["t1"]));

    expect((await service.listViews("ws1")).map((v) => v.id)).toEqual([view.id]);
    expect(await service.listViews("ws2")).toEqual([]);
    await expect(service.createView("ws1", "tagged", tagRule(["t1"]))).rejects.toThrow(
      ValidationError,
    );
    await expect(service.createView("ws1", "Empty", tagRule([]))).rejects.toThrow(ValidationError);
  });

  it("refuses views whose every rule is incomplete", async () => {
    const service = new SavedViewService(new InMemorySavedViewRepository());
    const incomplete: FilterRules = [
      { id: "r1", kind: "number", propertyId: "p", op: ">", value: undefined },
      { id: "r2", kind: "select", propertyId: "p", op: "is", optionIds: [] },
    ];
    await expect(service.createView("ws1", "Broken", incomplete)).rejects.toThrow(ValidationError);

    // At least one complete rule is enough.
    const mixed = [...incomplete, ...tagRule(["t1"])];
    await expect(service.createView("ws1", "Mixed", mixed)).resolves.toBeTruthy();
  });

  it("renameView rejects duplicates in the same workspace", async () => {
    const service = new SavedViewService(new InMemorySavedViewRepository());
    const a = await service.createView("ws1", "A", tagRule(["t1"]));
    await service.createView("ws1", "B", tagRule(["t2"]));

    await expect(service.renameView(a.id, "b")).rejects.toThrow(ValidationError);
    await expect(service.renameView(a.id, "  A  ")).resolves.toBeUndefined();
    await expect(service.renameView("missing", "X")).rejects.toThrow(NotFoundError);
  });

  it("pruneOption trims option ids, drops emptied rules, deletes emptied views", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    // 1. multi-id rule keeps the surviving option.
    const keepOne = await service.createView("ws1", "Multi", selectRule("p1", ["o1", "o2"]));
    // 2. single-id rule under a value op is dropped -> view deleted.
    const emptied = await service.createView("ws1", "Single", selectRule("p1", ["o1"]));
    // 3. rule on another property is untouched.
    const other = await service.createView("ws2", "Other", selectRule("p2", ["o1"]));
    // 4. is-empty rule carries no option ids and survives as-is.
    const emptiness = await service.createView("ws1", "Emptiness", [
      { id: "r1", kind: "select", propertyId: "p1", op: "is-empty", optionIds: [] },
    ]);

    const deleted = await service.pruneOption("p1", "o1");

    expect(deleted).toEqual([emptied.id]);
    expect((await repo.findById(keepOne.id))?.rules).toEqual([
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["o2"] },
    ]);
    expect(await repo.findById(emptied.id)).toBeNull();
    expect((await repo.findById(other.id))?.rules).toEqual(selectRule("p2", ["o1"]));
    expect((await repo.findById(emptiness.id))?.rules).toHaveLength(1);
  });

  it("pruneOption deletes a view left with only incomplete rules, not match-all", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    // Select rule complete + number rule valueless: passes the create gate.
    const mixed = await service.createView("ws1", "Mixed", [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["o1"] },
      { id: "r2", kind: "number", propertyId: "p2", op: ">", value: undefined },
    ]);

    const deleted = await service.pruneOption("p1", "o1");

    // Dropping the select rule leaves an all-incomplete set that would
    // evaluate to match-all — the view is dead and must be deleted.
    expect(deleted).toEqual([mixed.id]);
    expect(await repo.findById(mixed.id)).toBeNull();
  });

  it("pruneProperty drops rules on the property and deletes emptied views", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    const view = await service.createView("ws1", "OnP1", [
      ...selectRule("p1", ["o1"]),
      { id: "r2", kind: "text", propertyId: "p1", op: "contains", value: "x" },
    ]);
    const survivor = await service.createView("ws1", "OnP2", selectRule("p2", ["o2"]));

    const deleted = await service.pruneProperty("p1");

    expect(deleted).toEqual([view.id]);
    expect(await repo.findById(view.id)).toBeNull();
    expect((await repo.findById(survivor.id))?.rules).toEqual(selectRule("p2", ["o2"]));
  });

  it("healRules rewrites rules with dead option ids and dead properties", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    // Seed rows directly: a view with a dead option id and a dead property,
    // and one fully healthy view.
    await repo.create({
      id: "v1",
      workspaceId: "ws1",
      name: "Partly dead",
      createdAt: 1,
      rules: [
        { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["live", "dead"] },
        { id: "r2", kind: "text", propertyId: "pGONE", op: "contains", value: "x" },
      ],
    });
    await repo.create({
      id: "v2",
      workspaceId: "ws1",
      name: "All dead",
      createdAt: 2,
      rules: [{ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["dead"] }],
    });
    await repo.create({
      id: "v3",
      workspaceId: "ws1",
      name: "Healthy",
      createdAt: 3,
      rules: [{ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["live"] }],
    });

    await service.healRules([
      {
        id: "p1",
        name: "Stage",
        type: "select",
        options: [
          { id: "live", name: "Live", color: "#000" },
          { id: "dead2", name: "Dead2", color: "#111" },
        ],
        createdAt: 0,
        order: "a0",
        show: "always-show",
        icon: null,
      },
    ]);

    expect((await repo.findById("v1"))?.rules).toEqual([
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["live"] },
    ]);
    expect(await repo.findById("v2")).toBeNull();
    expect((await repo.findById("v3"))?.rules).toHaveLength(1);
  });
});
