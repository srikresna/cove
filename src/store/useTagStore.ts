import { create } from "zustand";
import { tagService, vaultService } from "../di/container";
import type { Tag, TagCount } from "../domain/tag/Tag";
import { changeBus } from "../services/changeBus";
import { notifyError } from "./notify";

interface TagState {
  tags: Tag[];
  tagCounts: TagCount[];
  activeTagId: string | null;
  version: number;

  taggedNoteIds: Set<string> | null;
  fetchTags: (workspaceId: string) => Promise<void>;
  setTagFilter: (tagId: string | null) => Promise<void>;

  renameTag: (tagId: string, name: string) => Promise<void>;
  setTagColor: (tagId: string, color: string) => Promise<void>;
  deleteTag: (tagId: string) => Promise<void>;

  refresh: () => Promise<void>;
}

let reqId = 0;
let lastWorkspaceId: string | null = null;

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  tagCounts: [],
  activeTagId: null,
  version: 0,
  taggedNoteIds: null,

  fetchTags: async (workspaceId) => {
    lastWorkspaceId = workspaceId;
    try {
      const [tags, tagCounts] = await Promise.all([
        tagService.listTags(workspaceId),
        tagService.tagCounts(workspaceId),
      ]);
      if (lastWorkspaceId !== workspaceId) return;
      set({ tags, tagCounts });
    } catch (err) {
      notifyError(err);
    }
  },

  setTagFilter: async (tagId) => {
    const req = ++reqId;
    if (tagId === null || tagId === get().activeTagId) {
      set({ activeTagId: null, taggedNoteIds: null });
      return;
    }
    set({ activeTagId: tagId });
    try {
      const ids = await tagService.notesForTag(tagId);
      if (req !== reqId || get().activeTagId !== tagId) return;
      set({ activeTagId: tagId, taggedNoteIds: new Set(ids) });
    } catch (err) {
      if (req !== reqId || get().activeTagId !== tagId) return;
      notifyError(err);
    }
  },

  renameTag: async (tagId, name) => {
    try {
      await tagService.renameTag(tagId, name);
    } catch (err) {
      notifyError(err);
    }
  },

  setTagColor: async (tagId, color) => {
    try {
      await tagService.setTagColor(tagId, color);
    } catch (err) {
      notifyError(err);
    }
  },

  deleteTag: async (tagId) => {
    try {
      await tagService.deleteTag(tagId);
      if (get().activeTagId === tagId) {
        set({ activeTagId: null, taggedNoteIds: null });
      }
    } catch (err) {
      notifyError(err);
    }
  },

  refresh: async () => {
    set((s) => ({ version: s.version + 1 }));
    const workspaceId = lastWorkspaceId;
    if (workspaceId) {
      await get().fetchTags(workspaceId);
    }
    const activeTagId = get().activeTagId;
    if (!activeTagId) return;
    try {
      const ids = await tagService.notesForTag(activeTagId);
      if (get().activeTagId !== activeTagId) return;
      set({ taggedNoteIds: new Set(ids) });
    } catch (err) {
      notifyError(err);
    }
  },
}));

vaultService.onLock(() => {
  useTagStore.setState({ tags: [], tagCounts: [], activeTagId: null, taggedNoteIds: null });
});

changeBus.on("tags", () => {
  void useTagStore.getState().refresh();
});
