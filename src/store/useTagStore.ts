import { create } from "zustand";
import { tagService, vaultService } from "../di/container";
import type { Tag } from "../domain/tag/Tag";
import { notifyError } from "./notify";

interface TagState {
  tags: Tag[];
  activeTagId: string | null;
  version: number;

  taggedNoteIds: Set<string> | null;
  fetchTags: () => Promise<void>;
  setTagFilter: (tagId: string | null) => Promise<void>;

  refresh: () => Promise<void>;
}

let reqId = 0;

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  activeTagId: null,
  version: 0,
  taggedNoteIds: null,

  fetchTags: async () => {
    try {
      set({ tags: await tagService.listTags() });
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

  refresh: async () => {
    set((s) => ({ version: s.version + 1 }));
    await get().fetchTags();
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
  useTagStore.setState({ tags: [], activeTagId: null, taggedNoteIds: null });
});
