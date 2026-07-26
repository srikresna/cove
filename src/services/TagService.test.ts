import { describe, expect, it } from "vitest";
import { TAG_COLORS } from "../domain/tag/Tag";
import { ValidationError } from "../errors/AppError";
import { InMemoryTagRepository } from "../test/fakes/InMemoryTagRepository";
import { TagService } from "./TagService";

describe("TagService", () => {
  it("creates a tag with the next palette color and attaches it to the note", async () => {
    const repo = new InMemoryTagRepository();
    const service = new TagService(repo);

    const first = await service.addTag("n1", "ideas");
    const second = await service.addTag("n1", "work");

    expect(first.color).toBe(TAG_COLORS[0]);
    expect(second.color).toBe(TAG_COLORS[1]);
    expect((await service.tagsForNote("n1")).map((t) => t.name)).toEqual(["ideas", "work"]);
  });

  it("reuses an existing tag by name (case-insensitive, trimmed)", async () => {
    const repo = new InMemoryTagRepository();
    const service = new TagService(repo);

    const created = await service.addTag("n1", "Ideas");
    const reused = await service.addTag("n2", "  ideas ");

    expect(reused.id).toBe(created.id);
    expect(await repo.count()).toBe(1);
    expect((await service.tagsForNote("n2"))[0]?.id).toBe(created.id);
  });

  it("rejects empty names and removes tags from a note", async () => {
    const repo = new InMemoryTagRepository();
    const service = new TagService(repo);

    await expect(service.addTag("n1", "   ")).rejects.toThrow(ValidationError);

    const tag = await service.addTag("n1", "temp");
    await service.removeTag("n1", tag.id);
    expect(await service.tagsForNote("n1")).toEqual([]);
    expect(await repo.count()).toBe(1);
  });

  it("cycles the palette after nine tags", async () => {
    const repo = new InMemoryTagRepository();
    const service = new TagService(repo);
    for (let i = 0; i < TAG_COLORS.length; i++) {
      await service.addTag("n1", `tag-${i}`);
    }
    const wrapped = await service.addTag("n1", "tag-wrap");
    expect(wrapped.color).toBe(TAG_COLORS[0]);
  });
});
