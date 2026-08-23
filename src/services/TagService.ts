import { NotFoundError } from "../domain/errors";
import {
  makeTagId,
  nextTagColor,
  normalizeTagName,
  TAG_COLORS,
  type Tag,
  type TagCount,
} from "../domain/tag/Tag";
import { ValidationError } from "../errors/AppError";
import type { ITagRepository } from "../repositories/ITagRepository";
import type { INoteService } from "./INoteService";
import type { ITagService } from "./ITagService";

export class TagService implements ITagService {
  constructor(
    private readonly tags: ITagRepository,
    private readonly notes: INoteService,
  ) {}

  listTags(workspaceId: string): Promise<Tag[]> {
    return this.tags.listByWorkspace(workspaceId);
  }

  tagCounts(workspaceId: string): Promise<TagCount[]> {
    return this.tags.countsByWorkspace(workspaceId);
  }

  tagsForNote(noteId: string): Promise<Tag[]> {
    return this.tags.tagsForNote(noteId);
  }

  notesForTag(tagId: string): Promise<string[]> {
    return this.tags.noteIdsForTag(tagId);
  }

  async addTag(noteId: string, name: string): Promise<Tag> {
    const normalized = normalizeTagName(name);
    if (!normalized) throw new ValidationError("Tag name cannot be empty.");

    // Tags belong to the note's workspace; two workspaces can share a name.
    const note = await this.notes.getNote(noteId);
    if (!note) throw new NotFoundError("Note", noteId);

    const existing = await this.tags.findByName(note.workspaceId, normalized);
    if (existing) {
      await this.tags.addToNote(noteId, existing.id);
      return existing;
    }

    const tag: Tag = {
      id: makeTagId(),
      workspaceId: note.workspaceId,
      name: normalized,
      color: nextTagColor(await this.tags.countInWorkspace(note.workspaceId)),
      createdAt: Date.now(),
    };
    try {
      await this.tags.create(tag);
    } catch (err) {
      // Lost a create race against a concurrent addTag of the same name
      // (UNIQUE(workspaceId, name)): reuse the winner instead of failing.
      const winner = await this.tags.findByName(note.workspaceId, normalized);
      if (winner) {
        await this.tags.addToNote(noteId, winner.id);
        return winner;
      }
      throw err;
    }
    await this.tags.addToNote(noteId, tag.id);
    return tag;
  }

  removeTag(noteId: string, tagId: string): Promise<void> {
    return this.tags.removeFromNote(noteId, tagId);
  }

  async renameTag(tagId: string, name: string): Promise<void> {
    const normalized = normalizeTagName(name);
    if (!normalized) throw new ValidationError("Tag name cannot be empty.");
    const tag = await this.tags.findById(tagId);
    if (!tag) throw new NotFoundError("Tag", tagId);
    if (tag.name.toLowerCase() === normalized.toLowerCase()) return;
    const duplicate = await this.tags.findByName(tag.workspaceId, normalized);
    if (duplicate) throw new ValidationError("A tag with this name already exists.");
    await this.tags.update(tagId, { name: normalized });
  }

  async setTagColor(tagId: string, color: string): Promise<void> {
    if (!(TAG_COLORS as readonly string[]).includes(color)) {
      throw new ValidationError("Unknown tag color.");
    }
    await this.tags.update(tagId, { color });
  }

  async deleteTag(tagId: string): Promise<void> {
    if (!(await this.tags.findById(tagId))) throw new NotFoundError("Tag", tagId);
    await this.tags.delete(tagId);
  }
}
