import { create } from "zustand";
import { savedViewService, vaultService } from "../di/container";
import type { FilterRule, FilterRules } from "../domain/filters/FilterRule";
import { healRule, removeOption } from "../domain/filters/ruleMaintenance";
import type { SavedView } from "../domain/filters/SavedView";
import type { PropertyDefinition } from "../domain/property/Property";
import { notifyError } from "./notify";

interface ViewState {
  views: SavedView[];
  activeViewId: string | null;
  appliedRulesSnapshot: string | null;
  draftRules: FilterRules;
  version: number;
  fetchSeq: number;

  fetchViews: (workspaceId: string) => Promise<void>;
  setActiveView: (viewId: string | null) => void;
  addDraftRule: (rule: FilterRule) => void;
  updateDraftRule: (id: string, patch: Partial<FilterRule>) => void;
  removeDraftRule: (id: string) => void;
  clearDraft: () => void;
  saveDraftAsView: (workspaceId: string, name: string) => Promise<SavedView>;
  updateActiveViewRules: () => Promise<void>;
  renameView: (id: string, name: string) => Promise<void>;
  deleteView: (id: string) => Promise<void>;
  syncAfterOptionDelete: (propertyId: string, optionId: string) => Promise<void>;
  syncAfterPropertyDelete: (propertyId: string) => Promise<void>;
  healDrafts: (defs: PropertyDefinition[]) => void;
}

export const useViewStore = create<ViewState>((set, get) => ({
  views: [],
  activeViewId: null,
  appliedRulesSnapshot: null,
  draftRules: [],
  version: 0,
  fetchSeq: 0,

  fetchViews: async (workspaceId) => {
    const seq = get().fetchSeq + 1;
    set({ fetchSeq: seq });
    try {
      const fresh = await savedViewService.listViews(workspaceId);
      if (get().fetchSeq !== seq) return;
      set((s) => {
        const active = s.activeViewId ? fresh.find((v) => v.id === s.activeViewId) : undefined;
        if (s.activeViewId && !active) {
          return { views: fresh, activeViewId: null, draftRules: [], appliedRulesSnapshot: null };
        }
        if (
          active &&
          s.appliedRulesSnapshot != null &&
          JSON.stringify(active.rules) !== s.appliedRulesSnapshot &&
          JSON.stringify(s.draftRules) === s.appliedRulesSnapshot
        ) {
          return {
            views: fresh,
            draftRules: active.rules.map((r) => ({ ...r })),
            appliedRulesSnapshot: JSON.stringify(active.rules),
          };
        }
        return { views: fresh };
      });
    } catch (err) {
      notifyError(err);
    }
  },

  setActiveView: (viewId) => {
    const view = get().views.find((v) => v.id === viewId) ?? null;
    set((s) => ({
      activeViewId: viewId,
      draftRules: view ? view.rules.map((r) => ({ ...r })) : viewId === null ? s.draftRules : [],
      appliedRulesSnapshot: view ? JSON.stringify(view.rules) : null,
      version: s.version + 1,
    }));
  },

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

  clearDraft: () =>
    set((s) => ({
      draftRules: [],
      activeViewId: null,
      appliedRulesSnapshot: null,
      version: s.version + 1,
    })),

  saveDraftAsView: async (workspaceId, name) => {
    const view = await savedViewService.createView(workspaceId, name, get().draftRules);
    await get().fetchViews(workspaceId);
    set((s) => ({
      activeViewId: view.id,
      appliedRulesSnapshot: JSON.stringify(view.rules),
      version: s.version + 1,
    }));
    return view;
  },

  updateActiveViewRules: async () => {
    const activeViewId = get().activeViewId;
    if (!activeViewId) return;
    try {
      await savedViewService.updateViewRules(activeViewId, get().draftRules);
      set((s) => ({
        appliedRulesSnapshot: JSON.stringify(s.draftRules),
        version: s.version + 1,
      }));
    } catch (err) {
      notifyError(err);
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
        set((s) => ({
          activeViewId: null,
          draftRules: [],
          appliedRulesSnapshot: null,
          version: s.version + 1,
        }));
      }
    } catch (err) {
      notifyError(err);
    }
  },

  syncAfterOptionDelete: async (propertyId, optionId) => {
    set((s) => ({
      draftRules: s.draftRules.flatMap((r) => {
        const next = removeOption(r, propertyId, optionId);
        return next.drop ? [] : [next.rule];
      }),
    }));
    let deletedViewIds: string[] = [];
    try {
      deletedViewIds = await savedViewService.pruneOption(propertyId, optionId);
    } catch (err) {
      notifyError(err);
      return;
    }
    const activeDeleted =
      get().activeViewId !== null && deletedViewIds.includes(get().activeViewId ?? "");
    set((s) => ({
      ...(activeDeleted ? { activeViewId: null, draftRules: [], appliedRulesSnapshot: null } : {}),
      version: s.version + 1,
    }));
  },

  syncAfterPropertyDelete: async (propertyId) => {
    set((s) => ({
      draftRules: s.draftRules.filter((r) => !("propertyId" in r) || r.propertyId !== propertyId),
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
    set((s) => ({
      ...(activeDeleted ? { activeViewId: null, draftRules: [], appliedRulesSnapshot: null } : {}),
      version: s.version + 1,
    }));
  },

  healDrafts: (defs) => {
    set((s) => ({
      draftRules: s.draftRules.flatMap((r): FilterRule[] => {
        const next = healRule(r, defs, { emptySelectIsComposing: true });
        return next.drop ? [] : [next.rule];
      }),
      version: s.version + 1,
    }));
  },
}));

vaultService.onLock(() => {
  useViewStore.setState({
    views: [],
    activeViewId: null,
    draftRules: [],
    appliedRulesSnapshot: null,
  });
});
