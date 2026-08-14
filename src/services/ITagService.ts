import type { Tag } from "../domain/tag/Tag";

export interface ITagService {
  listTags(): Promise<Tag[]>;
  tagsForNote(noteId: string): Promise<Tag[]>;

  notesForTag(tagId: string): Promise<string[]>;

  addTag(noteId: string, name: string): Promise<Tag>;
  removeTag(noteId: string, tagId: string): Promise<void>;
}
