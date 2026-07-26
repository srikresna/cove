import { describe, expect, it } from "vitest";
import { NotFoundError } from "../domain/errors";
import { ValidationError } from "../errors/AppError";
import { InMemoryPropertyRepository } from "../test/fakes/InMemoryPropertyRepository";
import { PropertyService } from "./PropertyService";

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

    // A stored value whose type no longer matches its definition is ignored.
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
});
