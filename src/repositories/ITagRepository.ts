import type { Tag } from "../domain/tag/Tag";

export interface ITagRepository {
  listAll(): Promise<Tag[]>;
  findByName(name: string): Promise<Tag | null>;
  create(tag: Tag): Promise<void>;
  count(): Promise<number>;
  tagsForNote(noteId: string): Promise<Tag[]>;
  noteIdsForTag(tagId: string): Promise<string[]>;
  addToNote(noteId: string, tagId: string): Promise<void>;
  removeFromNote(noteId: string, tagId: string): Promise<void>;
}
