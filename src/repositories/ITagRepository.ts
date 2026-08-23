import type { Tag } from "../domain/tag/Tag";

export interface TagCount {
  tagId: string;
  noteCount: number;
}

export interface ITagRepository {
  listByWorkspace(workspaceId: string): Promise<Tag[]>;
  countsByWorkspace(workspaceId: string): Promise<TagCount[]>;
  findById(tagId: string): Promise<Tag | null>;
  findByName(workspaceId: string, name: string): Promise<Tag | null>;
  create(tag: Tag): Promise<void>;
  update(tagId: string, patch: { name?: string; color?: string }): Promise<void>;
  delete(tagId: string): Promise<void>;
  countInWorkspace(workspaceId: string): Promise<number>;
  tagsForNote(noteId: string): Promise<Tag[]>;
  noteIdsForTag(tagId: string): Promise<string[]>;
  addToNote(noteId: string, tagId: string): Promise<void>;
  removeFromNote(noteId: string, tagId: string): Promise<void>;
}
