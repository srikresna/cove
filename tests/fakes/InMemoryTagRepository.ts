import { type Tag, makeTagId } from "@/domain/tag/Tag";
import type { ITagRepository } from "@/repositories/ITagRepository";

export class InMemoryTagRepository implements ITagRepository {
  public tags: Tag[] = [];
  public noteTags = new Map<string, Set<string>>();

  async listAll(): Promise<Tag[]> {
    return [...this.tags].sort((a, b) => a.name.localeCompare(b.name));
  }

  async findByName(name: string): Promise<Tag | null> {
    return this.tags.find((t) => t.name.toLowerCase() === name.toLowerCase()) ?? null;
  }

  async findOrCreateByName(name: string, color: string): Promise<Tag> {
    const existing = this.tags.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (existing) return { ...existing };
    const tag: Tag = { id: makeTagId(), name, color, createdAt: Date.now() };
    this.tags.push(tag);
    return { ...tag };
  }

  async create(tag: Tag): Promise<void> {
    this.tags.push({ ...tag });
  }

  async count(): Promise<number> {
    return this.tags.length;
  }

  async tagsForNote(noteId: string): Promise<Tag[]> {
    const ids = this.noteTags.get(noteId) ?? new Set();
    return this.tags.filter((t) => ids.has(t.id)).sort((a, b) => a.name.localeCompare(b.name));
  }

  async noteIdsForTag(tagId: string): Promise<string[]> {
    const ids: string[] = [];
    for (const [noteId, tagIds] of this.noteTags.entries()) {
      if (tagIds.has(tagId)) ids.push(noteId);
    }
    return ids;
  }

  async addToNote(noteId: string, tagId: string): Promise<void> {
    const set = this.noteTags.get(noteId) ?? new Set<string>();
    set.add(tagId);
    this.noteTags.set(noteId, set);
  }

  async removeFromNote(noteId: string, tagId: string): Promise<void> {
    this.noteTags.get(noteId)?.delete(tagId);
  }
}
