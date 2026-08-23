import { create } from "zustand";
import { savedViewService, vaultService } from "../di/container";
import type { FilterRule, FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import { notifyError } from "./notify";

interface ViewState {
  /** Saved views of the active workspace. */
  views: SavedView[];
  /** The applied saved view, when any. */
  activeViewId: string | null;
  /** Ad-hoc rules the user is composing in the filter bar (unsaved). */
  draftRules: FilterRules;
  version: number;

  fetchViews: (workspaceId: string) => Promise<void>;
  setActiveView: (viewId: string | null) => void;
  setDraftRules: (rules: FilterRules) => void;
  addDraftRule: (rule: FilterRule) => void;
  updateDraftRule: (id: string, patch: Partial<FilterRule>) => void;
  removeDraftRule: (id: string) => void;
  clearDraft: () => void;
  saveDraftAsView: (workspaceId: string, name: string) => Promise<SavedView | null>;
  renameView: (id: string, name: string) => Promise<void>;
  deleteView: (id: string) => Promise<void>;
  /** Sync saved views + drafts after a select option was deleted. */
  syncAfterOptionDelete: (propertyId: string, optionId: string) => Promise<void>;
  /** Sync saved views + drafts after a property definition was deleted. */
  syncAfterPropertyDelete: (propertyId: string) => Promise<void>;
}

export const useViewStore = create<ViewState>((set, get) => ({
  views: [],
  activeViewId: null,
  draftRules: [],
  version: 0,

  fetchViews: async (workspaceId) => {
    try {
      set({ views: await savedViewService.listViews(workspaceId) });
    } catch (err) {
      notifyError(err);
    }
  },

  setActiveView: (viewId) => {
    const view = get().views.find((v) => v.id === viewId) ?? null;
    set((s) => ({
      activeViewId: viewId,
      // Applying a view loads its rules into the draft so the filter bar
      // shows and can tweak them; clearing keeps the drafts untouched.
      draftRules: view ? view.rules.map((r) => ({ ...r })) : viewId === null ? s.draftRules : [],
      version: s.version + 1,
    }));
  },

  setDraftRules: (rules) => set((s) => ({ draftRules: rules, version: s.version + 1 })),

  addDraftRule: (rule) =>
    set((s) => ({ draftRules: [...s.draftRules, rule], version: s.version + 1 })),

  updateDraftRule: (id, patch) =>
    set((s) => ({
      draftRules: s.draftRules.map((r) => (r.id === id ? ({ ...r, ...patch } as FilterRule) : r)),
      version: s.version + 1,
    })),

  removeDraftRule: (id) =>
    set((s) => ({
      draftRules: s.draftRules.filter((r) => r.id !== id),
      version: s.version + 1,
    })),

  clearDraft: () => set((s) => ({ draftRules: [], activeViewId: null, version: s.version + 1 })),

  saveDraftAsView: async (workspaceId, name) => {
    try {
      const view = await savedViewService.createView(workspaceId, name, get().draftRules);
      await get().fetchViews(workspaceId);
      set((s) => ({ activeViewId: view.id, version: s.version + 1 }));
      return view;
    } catch (err) {
      notifyError(err);
      return null;
    }
  },

  renameView: async (id, name) => {
    try {
      await savedViewService.renameView(id, name);
      const ws = get().views.find((v) => v.id === id)?.workspaceId;
      if (ws) await get().fetchViews(ws);
    } catch (err) {
      notifyError(err);
    }
  },

  deleteView: async (id) => {
    try {
      await savedViewService.deleteView(id);
      const ws = get().views.find((v) => v.id === id)?.workspaceId;
      if (ws) await get().fetchViews(ws);
      if (get().activeViewId === id) {
        set((s) => ({ activeViewId: null, draftRules: [], version: s.version + 1 }));
      }
    } catch (err) {
      notifyError(err);
    }
  },

  syncAfterOptionDelete: async (propertyId, optionId) => {
    // Prune drafts FIRST and unconditionally: the rule dropdown only renders
    // live options, so a dead id could never be cleared from a draft — even
    // if the service-side prune itself fails, the in-memory state must not
    // keep it (the startup heal repairs the persisted side later).
    let deletedViewIds: string[] = [];
    set((s) => ({
      draftRules: s.draftRules.flatMap((r) => {
        if ((r.kind === "select" || r.kind === "multiSelect") && r.propertyId === propertyId) {
          const optionIds = r.optionIds.filter((id) => id !== optionId);
          if (optionIds.length === 0 && (r.op === "is" || r.op === "is-not")) return [];
          return [{ ...r, optionIds }];
        }
        return [r];
      }),
      version: s.version + 1,
    }));
    try {
      deletedViewIds = await savedViewService.pruneOption(propertyId, optionId);
    } catch (err) {
      notifyError(err);
      return;
    }
    const activeDeleted =
      get().activeViewId !== null && deletedViewIds.includes(get().activeViewId ?? "");
    if (activeDeleted) {
      set((s) => ({ activeViewId: null, draftRules: [], version: s.version + 1 }));
    }
  },

  syncAfterPropertyDelete: async (propertyId) => {
    set((s) => ({
      draftRules: s.draftRules.filter((r) => !("propertyId" in r) || r.propertyId !== propertyId),
      version: s.version + 1,
    }));
    let deletedViewIds: string[] = [];
    try {
      deletedViewIds = await savedViewService.pruneProperty(propertyId);
    } catch (err) {
      notifyError(err);
      return;
    }
    const activeDeleted =
      get().activeViewId !== null && deletedViewIds.includes(get().activeViewId ?? "");
    if (activeDeleted) {
      set((s) => ({ activeViewId: null, draftRules: [], version: s.version + 1 }));
    }
  },
}));

vaultService.onLock(() => {
  useViewStore.setState({ views: [], activeViewId: null, draftRules: [] });
});
