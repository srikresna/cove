import type { Tag, TagCount } from "@/domain/tag/Tag";
import type { ITagRepository } from "@/repositories/ITagRepository";

export class InMemoryTagRepository implements ITagRepository {
  public tags: Tag[] = [];
  public noteTags = new Map<string, Set<string>>();

  async listByWorkspace(workspaceId: string): Promise<Tag[]> {
    return this.tags
      .filter((t) => t.workspaceId === workspaceId)
      .sort((a, b) => a.name.localeCompare(b.name));
  }

  async countsByWorkspace(workspaceId: string): Promise<TagCount[]> {
    return this.tags
      .filter((t) => t.workspaceId === workspaceId)
      .map((t) => ({
        tagId: t.id,
        noteCount: this.noteIdsForTagSync(t.id).length,
      }));
  }

  async findById(tagId: string): Promise<Tag | null> {
    return this.tags.find((t) => t.id === tagId) ?? null;
  }

  async findByName(workspaceId: string, name: string): Promise<Tag | null> {
    return (
      this.tags.find(
        (t) => t.workspaceId === workspaceId && t.name.toLowerCase() === name.toLowerCase(),
      ) ?? null
    );
  }

  async create(tag: Tag): Promise<void> {
    this.tags.push({ ...tag });
  }

  async update(tagId: string, patch: { name?: string; color?: string }): Promise<void> {
    this.tags = this.tags.map((t) => (t.id === tagId ? { ...t, ...patch } : t));
  }

  async delete(tagId: string): Promise<void> {
    this.tags = this.tags.filter((t) => t.id !== tagId);
    for (const set of this.noteTags.values()) set.delete(tagId);
  }

  async countInWorkspace(workspaceId: string): Promise<number> {
    return this.tags.filter((t) => t.workspaceId === workspaceId).length;
  }

  async tagsForNote(noteId: string): Promise<Tag[]> {
    const ids = this.noteTags.get(noteId) ?? new Set();
    return this.tags.filter((t) => ids.has(t.id)).sort((a, b) => a.name.localeCompare(b.name));
  }

  private noteIdsForTagSync(tagId: string): string[] {
    const ids: string[] = [];
    for (const [noteId, tagIds] of this.noteTags.entries()) {
      if (tagIds.has(tagId)) ids.push(noteId);
    }
    return ids;
  }

  async noteIdsForTag(tagId: string): Promise<string[]> {
    return this.noteIdsForTagSync(tagId);
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
