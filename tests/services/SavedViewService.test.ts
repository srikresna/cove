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
});
