import type { Tag } from "../domain/tag/Tag";
import { makeTagId, nextTagColor, normalizeTagName } from "../domain/tag/Tag";
import { ValidationError } from "../errors/AppError";
import type { ITagRepository } from "../repositories/ITagRepository";
import type { ITagService } from "./ITagService";

export class TagService implements ITagService {
  constructor(private readonly tags: ITagRepository) {}

  listTags(): Promise<Tag[]> {
    return this.tags.listAll();
  }

  tagsForNote(noteId: string): Promise<Tag[]> {
    return this.tags.tagsForNote(noteId);
  }

  async addTag(noteId: string, name: string): Promise<Tag> {
    const normalized = normalizeTagName(name);
    if (!normalized) throw new ValidationError("Tag name cannot be empty.");

    let tag = await this.tags.findByName(normalized);
    if (!tag) {
      tag = {
        id: makeTagId(),
        name: normalized,
        color: nextTagColor(await this.tags.count()),
        createdAt: Date.now(),
      };
      await this.tags.create(tag);
    }
    await this.tags.addToNote(noteId, tag.id);
    return tag;
  }

  removeTag(noteId: string, tagId: string): Promise<void> {
    return this.tags.removeFromNote(noteId, tagId);
  }
}
