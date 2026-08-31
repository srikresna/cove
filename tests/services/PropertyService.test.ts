import { describe, expect, it } from "vitest";
import { NotFoundError } from "@/domain/errors";
import { ValidationError } from "@/errors/AppError";
import { PropertyService } from "@/services/PropertyService";
import { InMemoryPropertyRepository } from "../fakes/InMemoryPropertyRepository";

describe("PropertyService", () => {
  it("creates definitions; status starts with the default option set", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());

    const text = await service.createDefinition("Owner", "text");
    expect(text.options).toEqual([]);

    const status = await service.createDefinition("Progress", "status");
    expect(status.options.map((o) => o.name)).toEqual(["To do", "In progress", "Done"]);

    await expect(service.createDefinition("   ", "text")).rejects.toThrow(ValidationError);
  });

  it("adds palette-colored options to select-likes and reuses by name", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());
    const select = await service.createDefinition("Category", "select");

    const first = await service.addOption(select.id, "Deep Work");
    const reused = await service.addOption(select.id, "deep work");
    expect(reused.id).toBe(first.id);

    const number = await service.createDefinition("Effort", "number");
    await expect(service.addOption(number.id, "x")).rejects.toThrow(ValidationError);
    await expect(service.addOption("missing", "x")).rejects.toThrow(NotFoundError);
  });

  it("round-trips typed values and drops mismatched ones", async () => {
    const repo = new InMemoryPropertyRepository();
    const service = new PropertyService(repo);
    const checkbox = await service.createDefinition("Done?", "checkbox");
    const relation = await service.createDefinition("Related", "relation");

    await service.setValue("n1", checkbox.id, { type: "checkbox", checked: true });
    await service.setValue("n1", relation.id, { type: "relation", noteIds: ["n2", "n3"] });

    const values = await service.valuesForNote("n1");
    expect(values.get(checkbox.id)).toEqual({ type: "checkbox", checked: true });
    expect(values.get(relation.id)).toEqual({ type: "relation", noteIds: ["n2", "n3"] });

    await repo.setValue("n1", checkbox.id, JSON.stringify({ type: "text", text: "stale" }));
    expect((await service.valuesForNote("n1")).has(checkbox.id)).toBe(false);

    await service.removeValue("n1", relation.id);
    expect((await service.valuesForNote("n1")).has(relation.id)).toBe(false);
  });

  it("deleting a definition removes its values", async () => {
    const repo = new InMemoryPropertyRepository();
    const service = new PropertyService(repo);
    const url = await service.createDefinition("Docs", "url");
    await service.setValue("n1", url.id, { type: "url", url: "https://cove.app" });

    await service.deleteDefinition(url.id);
    expect(await service.listDefinitions()).toEqual([]);
    expect((await service.valuesForNote("n1")).size).toBe(0);
  });

  it("deleting an option sweeps values referencing it", async () => {
    const repo = new InMemoryPropertyRepository();
    const service = new PropertyService(repo);
    const select = await service.createDefinition("Stage", "select");
    const multi = await service.createDefinition("Topics", "multiSelect");
    const gone = await service.addOption(select.id, "Draft");
    const kept = await service.addOption(select.id, "Shipped");
    const mGone = await service.addOption(multi.id, "rust");
    const mKept = await service.addOption(multi.id, "tauri");

    await service.setValue("n1", select.id, { type: "select", optionId: gone.id });
    await service.setValue("n2", select.id, { type: "select", optionId: kept.id });
    await service.setValue("n3", multi.id, { type: "multiSelect", optionIds: [mGone.id] });
    await service.setValue("n4", multi.id, {
      type: "multiSelect",
      optionIds: [mGone.id, mKept.id],
    });

    await service.deleteOption(select.id, gone.id);
    await service.deleteOption(multi.id, mGone.id);

    // select rows holding the deleted option are removed; others survive.
    expect((await service.valuesForNote("n1")).has(select.id)).toBe(false);
    expect((await service.valuesForNote("n2")).get(select.id)).toEqual({
      type: "select",
      optionId: kept.id,
    });
    // multiSelect rows drop the id; empty arrays remove the row entirely.
    expect((await service.valuesForNote("n3")).has(multi.id)).toBe(false);
    expect((await service.valuesForNote("n4")).get(multi.id)).toEqual({
      type: "multiSelect",
      optionIds: [mKept.id],
    });
    // The definition no longer lists the deleted options.
    const defs = await service.listDefinitions();
    expect(defs.find((d) => d.id === select.id)?.options.map((o) => o.id)).toEqual([kept.id]);
    expect(defs.find((d) => d.id === multi.id)?.options.map((o) => o.id)).toEqual([mKept.id]);
  });

  it("deleteOption finishes an interrupted sweep when the option is already gone", async () => {
    const repo = new InMemoryPropertyRepository();
    const service = new PropertyService(repo);
    const select = await service.createDefinition("Stage", "select");
    const gone = await service.addOption(select.id, "Draft");
    await service.setValue("n1", select.id, { type: "select", optionId: gone.id });

    // Simulate a crash between the optionsJson commit and the sweep: the
    // option is missing from the definition but the note value survives.
    await repo.updateOptions(select.id, JSON.stringify([]));

    // The retry must sweep instead of throwing NotFound, and a fully-clean
    // retry afterwards must throw NotFound (the option truly no longer exists).
    await expect(service.deleteOption(select.id, gone.id)).resolves.toBeUndefined();
    expect((await service.valuesForNote("n1")).has(select.id)).toBe(false);
    await expect(service.deleteOption(select.id, gone.id)).rejects.toThrow(NotFoundError);
  });

  it("new definitions append in order and default to hide-when-empty", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());
    const a = await service.createDefinition("Owner", "text");
    const b = await service.createDefinition("Effort", "number");

    expect(a.show).toBe("hide-when-empty");
    expect(a.order).not.toBe(b.order);
    const list = await service.listDefinitions();
    expect(list.map((d) => d.name)).toEqual(["Owner", "Effort"]);
  });

  it("reorders before/after a target and at list edges", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());
    const a = await service.createDefinition("A", "text");
    const b = await service.createDefinition("B", "text");
    const c = await service.createDefinition("C", "text");

    await service.reorderDefinition(a.id, c.id, "after");
    expect((await service.listDefinitions()).map((d) => d.name)).toEqual(["B", "C", "A"]);

    await service.reorderDefinition(a.id, b.id, "before");
    expect((await service.listDefinitions()).map((d) => d.name)).toEqual(["A", "B", "C"]);

    await service.reorderDefinition(c.id, a.id, "before");
    expect((await service.listDefinitions()).map((d) => d.name)).toEqual(["C", "A", "B"]);

    await service.reorderDefinition(b.id, b.id, "after");
    expect((await service.listDefinitions()).map((d) => d.name)).toEqual(["C", "A", "B"]);

    await expect(service.reorderDefinition(a.id, "missing", "after")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("reorder onto an adjacent neighbor's near edge is a no-op with distinct keys", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());
    const a = await service.createDefinition("A", "text");
    const b = await service.createDefinition("B", "text");
    const c = await service.createDefinition("C", "text");
    const d = await service.createDefinition("D", "text");

    // Arrange A, D, C, B.
    await service.reorderDefinition(d.id, a.id, "after");
    await service.reorderDefinition(c.id, b.id, "before");
    expect((await service.listDefinitions()).map((x) => x.name)).toEqual(["A", "D", "C", "B"]);

    // Dropping C "before B" and D "after A" leave them in place; regression:
    // these used to emit duplicate edge keys (e.g. a second "a0") that
    // silently reordered rows and later crashed generateKeyBetween.
    await service.reorderDefinition(c.id, b.id, "before");
    await service.reorderDefinition(d.id, a.id, "after");

    const after = await service.listDefinitions();
    expect(after.map((x) => x.name)).toEqual(["A", "D", "C", "B"]);
    const keys = after.map((x) => x.order);
    expect(new Set(keys).size).toBe(4);
    expect(keys.every((k) => k !== "")).toBe(true);
  });

  it("renames with dedupe and updates visibility", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());
    const a = await service.createDefinition("Owner", "text");
    const b = await service.createDefinition("Effort", "number");

    await service.renameDefinition(a.id, "  Owner   Name ");
    expect((await service.listDefinitions())[0]?.name).toBe("Owner Name");

    await expect(service.renameDefinition(a.id, "effort")).rejects.toThrow(ValidationError);
    await expect(service.renameDefinition("missing", "x")).rejects.toThrow(NotFoundError);
    await expect(service.renameDefinition(a.id, "   ")).rejects.toThrow(ValidationError);

    await service.setDefinitionVisibility(b.id, "always-hide");
    const list = await service.listDefinitions();
    expect(list.find((d) => d.id === b.id)?.show).toBe("always-hide");
    await expect(service.setDefinitionVisibility("missing", "always-hide")).rejects.toThrow(
      NotFoundError,
    );
  });

  it("guards built-in system properties", async () => {
    const repo = new InMemoryPropertyRepository();
    repo.definitions.push({
      id: "system:tags",
      name: "Tags",
      type: "tags",
      options: [],
      createdAt: 0,
      order: "a0",
      show: "always-show",
      icon: null,
    });
    const service = new PropertyService(repo);

    await expect(service.createDefinition("Fake tags", "tags")).rejects.toThrow(ValidationError);
    await expect(service.renameDefinition("system:tags", "Renamed")).rejects.toThrow(
      ValidationError,
    );
    await expect(service.deleteDefinition("system:created")).rejects.toThrow(ValidationError);
    await expect(
      service.setDefinitionVisibility("system:updated", "hide-when-empty"),
    ).rejects.toThrow(ValidationError);
    await expect(service.setDefinitionIcon("system:tags", "star")).rejects.toThrow(ValidationError);

    // Reordering and show/hide stay allowed for system rows.
    const custom = await service.createDefinition("Owner", "text");
    await expect(
      service.setDefinitionVisibility("system:tags", "always-hide"),
    ).resolves.toBeUndefined();
    await expect(
      service.reorderDefinition(custom.id, "system:tags", "before"),
    ).resolves.toBeUndefined();
    expect((await service.listDefinitions()).map((d) => d.id)).toEqual([custom.id, "system:tags"]);
  });

  it("sets and clears custom icons with name validation", async () => {
    const service = new PropertyService(new InMemoryPropertyRepository());
    const a = await service.createDefinition("Owner", "text");

    await service.setDefinitionIcon(a.id, "star");
    expect((await service.listDefinitions()).find((d) => d.id === a.id)?.icon).toBe("star");

    await service.setDefinitionIcon(a.id, null);
    expect((await service.listDefinitions()).find((d) => d.id === a.id)?.icon).toBeNull();

    await expect(service.setDefinitionIcon(a.id, "not-an-icon")).rejects.toThrow(ValidationError);
  });
});
