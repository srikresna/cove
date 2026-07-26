import type { Tag } from "../domain/tag/Tag";

export interface ITagService {
  listTags(): Promise<Tag[]>;
  tagsForNote(noteId: string): Promise<Tag[]>;
  /** Find-or-create by name (palette-rotated color), then attach to the note. */
  addTag(noteId: string, name: string): Promise<Tag>;
  removeTag(noteId: string, tagId: string): Promise<void>;
}
