import type { Tag, TagCount } from "../domain/tag/Tag";

export interface ITagService {
  listTags(workspaceId: string): Promise<Tag[]>;
  tagCounts(workspaceId: string): Promise<TagCount[]>;
  tagsForNote(noteId: string): Promise<Tag[]>;

  notesForTag(tagId: string): Promise<string[]>;

  addTag(noteId: string, name: string): Promise<Tag>;
  removeTag(noteId: string, tagId: string): Promise<void>;

  renameTag(tagId: string, name: string): Promise<void>;
  setTagColor(tagId: string, color: string): Promise<void>;
  deleteTag(tagId: string): Promise<void>;
}
