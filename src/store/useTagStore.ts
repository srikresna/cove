import { create } from "zustand";
import { tagService, vaultService } from "../di/container";
import type { Tag } from "../domain/tag/Tag";
import { presentError } from "../services/errorPresenter";
import { useNotificationStore } from "./useNotificationStore";

interface TagState {
  tags: Tag[];
  activeTagId: string | null;
  /** Note ids carrying the active tag; null when no filter is active. */
  taggedNoteIds: Set<string> | null;
  fetchTags: () => Promise<void>;
  setTagFilter: (tagId: string | null) => Promise<void>;
  /** Re-sync tag list and the active filter after note-tag mutations. */
  refresh: () => Promise<void>;
}

function notifyError(err: unknown): void {
  const p = presentError(err);
  useNotificationStore.getState().pushToast({
    kind: p.kind,
    title: p.toastTitle,
    description: p.toastDescription,
  });
}

export const useTagStore = create<TagState>((set, get) => ({
  tags: [],
  activeTagId: null,
  taggedNoteIds: null,

  fetchTags: async () => {
    try {
      set({ tags: await tagService.listTags() });
    } catch (err) {
      notifyError(err);
    }
  },

  setTagFilter: async (tagId) => {
    if (tagId === null || tagId === get().activeTagId) {
      set({ activeTagId: null, taggedNoteIds: null });
      return;
    }
    try {
      const ids = await tagService.notesForTag(tagId);
      set({ activeTagId: tagId, taggedNoteIds: new Set(ids) });
    } catch (err) {
      notifyError(err);
    }
  },

  refresh: async () => {
    await get().fetchTags();
    const activeTagId = get().activeTagId;
    if (!activeTagId) return;
    try {
      const ids = await tagService.notesForTag(activeTagId);
      set({ taggedNoteIds: new Set(ids) });
    } catch (err) {
      notifyError(err);
    }
  },
}));

vaultService.onLock(() => {
  useTagStore.setState({ tags: [], activeTagId: null, taggedNoteIds: null });
});
