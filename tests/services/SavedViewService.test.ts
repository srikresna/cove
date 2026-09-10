import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/domain/errors";
import type { FilterRule, FilterRules } from "@/domain/filters/FilterRule";
import type { PropertyDefinition } from "@/domain/property/Property";
import { ValidationError } from "@/errors/AppError";
import { SavedViewService } from "@/services/SavedViewService";
import { InMemorySavedViewRepository } from "../fakes/InMemorySavedViewRepository";

const tagRule = (tagIds: string[]): FilterRules => [
  { id: "r1", kind: "tags", op: "has-any-of", tagIds },
];

const selectRule = (propertyId: string, optionIds: string[]): FilterRules => [
  { id: "r1", kind: "select", propertyId, op: "is", optionIds },
];

const decoded = <T extends FilterRule>(rule: T): T =>
  ({
    ...rule,
    propertyId: "propertyId" in rule ? rule.propertyId : "",
    optionIds: "optionIds" in rule ? rule.optionIds : [],
    tagIds: "tagIds" in rule ? rule.tagIds : [],
  }) as T;

const liveDef = (id: string, optionIds: string[]): PropertyDefinition => ({
  id,
  name: id,
  type: "select",
  options: optionIds.map((optionId) => ({ id: optionId, name: optionId, color: "#000" })),
  createdAt: 0,
  order: "a0",
  show: "always-show",
  icon: null,
});

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
    const keepOne = await service.createView("ws1", "Multi", selectRule("p1", ["o1", "o2"]));
    const emptied = await service.createView("ws1", "Single", selectRule("p1", ["o1"]));
    const other = await service.createView("ws2", "Other", selectRule("p2", ["o1"]));
    const emptiness = await service.createView("ws1", "Emptiness", [
      { id: "r1", kind: "select", propertyId: "p1", op: "is-empty", optionIds: [] },
    ]);

    const deleted = await service.pruneOption("p1", "o1");

    expect(deleted).toEqual([emptied.id]);
    expect((await repo.findById(keepOne.id))?.rules).toEqual([
      decoded({ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["o2"] }),
    ]);
    expect(await repo.findById(emptied.id)).toBeNull();
    expect((await repo.findById(other.id))?.rules).toEqual(selectRule("p2", ["o1"]).map(decoded));
    expect((await repo.findById(emptiness.id))?.rules).toHaveLength(1);
  });

  it("pruneOption deletes a view left with only incomplete rules, not match-all", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    const mixed = await service.createView("ws1", "Mixed", [
      { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["o1"] },
      { id: "r2", kind: "number", propertyId: "p2", op: ">", value: undefined },
    ]);

    const deleted = await service.pruneOption("p1", "o1");

    expect(deleted).toEqual([mixed.id]);
    expect(await repo.findById(mixed.id)).toBeNull();
  });

  it("pruneOption keeps an is-not-only view as match-all when its option dies", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    const view = await service.createView("ws1", "NotUrgent", [
      { id: "r1", kind: "select", propertyId: "p1", op: "is-not", optionIds: ["o1"] },
    ]);

    const deleted = await service.pruneOption("p1", "o1");

    expect(deleted).toEqual([]);
    expect((await repo.findById(view.id))?.rules).toEqual([]);
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
    expect((await repo.findById(survivor.id))?.rules).toEqual(
      selectRule("p2", ["o2"]).map(decoded),
    );
  });

  it("pruneProperty deletes a view whose only active rule was real, despite an inactive is-not", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    const view = await service.createView("ws1", "Real", [
      { id: "r1", kind: "text", propertyId: "p1", op: "contains", value: "foo" },
      { id: "r2", kind: "text", propertyId: "p1", op: "is-not", value: "" },
    ]);

    const deleted = await service.pruneProperty("p1");

    expect(deleted).toEqual([view.id]);
    expect(await repo.findById(view.id)).toBeNull();
  });

  it("pruneProperty keeps is-empty and checkbox-false views as match-all, deletes their positives", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    const noDueDate = await service.createView("ws1", "No due date", [
      { id: "r1", kind: "date", propertyId: "pDue", op: "is-empty" },
    ]);
    const unreviewed = await service.createView("ws1", "Unreviewed", [
      { id: "r1", kind: "checkbox", propertyId: "pDone", op: "is", value: false },
    ]);
    const hasDue = await service.createView("ws1", "Has due date", [
      { id: "r1", kind: "date", propertyId: "pDue", op: "is-not-empty" },
    ]);
    const done = await service.createView("ws1", "Done", [
      { id: "r1", kind: "checkbox", propertyId: "pDone", op: "is", value: true },
    ]);

    const deletedDue = await service.pruneProperty("pDue");
    const deletedDone = await service.pruneProperty("pDone");

    expect(deletedDue).toEqual([hasDue.id]);
    expect((await repo.findById(noDueDate.id))?.rules).toEqual([]);
    expect(deletedDone).toEqual([done.id]);
    expect((await repo.findById(unreviewed.id))?.rules).toEqual([]);
  });

  it("healRules keeps tags/template views and rewrites dead references", async () => {
    const repo = new InMemorySavedViewRepository();
    const service = new SavedViewService(repo);
    await repo.create({
      id: "vTags",
      workspaceId: "ws1",
      name: "Tagged",
      createdAt: 1,
      rules: tagRule(["work"]),
      allowNoteIds: [],
    });
    await repo.create({
      id: "vPartly",
      workspaceId: "ws1",
      name: "Partly dead",
      createdAt: 3,
      rules: [
        { id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["live", "dead"] },
        { id: "r2", kind: "text", propertyId: "pGONE", op: "contains", value: "x" },
      ],
      allowNoteIds: [],
    });
    await repo.create({
      id: "vAllDead",
      workspaceId: "ws1",
      name: "All dead",
      createdAt: 4,
      rules: [{ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["dead"] }],
      allowNoteIds: [],
    });
    await repo.create({
      id: "vNotDead",
      workspaceId: "ws1",
      name: "Not dead",
      createdAt: 5,
      rules: [{ id: "r1", kind: "select", propertyId: "p1", op: "is-not", optionIds: ["dead"] }],
      allowNoteIds: [],
    });

    const deletedByHeal = await service.healRules([liveDef("p1", ["live"])]);

    expect((await repo.findById("vTags"))?.rules).toEqual(tagRule(["work"]).map(decoded));
    expect((await repo.findById("vPartly"))?.rules).toEqual([
      decoded({ id: "r1", kind: "select", propertyId: "p1", op: "is", optionIds: ["live"] }),
    ]);
    expect(await repo.findById("vAllDead")).toBeNull();
    expect(deletedByHeal).toEqual(["vAllDead"]);
    expect((await repo.findById("vNotDead"))?.rules).toEqual([]);
  });
});
