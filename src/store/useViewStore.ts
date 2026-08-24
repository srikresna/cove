import { create } from "zustand";
import { savedViewService, vaultService } from "../di/container";
import type { FilterRule, FilterRules } from "../domain/filters/FilterRule";
import type { SavedView } from "../domain/filters/SavedView";
import type { PropertyDefinition } from "../domain/property/Property";
import { notifyError } from "./notify";

interface ViewState {
  /** Saved views of the active workspace. */
  views: SavedView[];
  /** The applied saved view, when any. */
  activeViewId: string | null;
  /**
   * JSON snapshot of the rules setActiveView copied into the drafts. Used
   * by fetchViews to detect that the applied copy came from a STALE row
   * (straggler click between a heal/prune commit and the refresh) and
   * re-copy the healed rules — without ever touching user-tweaked drafts,
   * which no longer match the snapshot.
   */
  appliedRulesSnapshot: string | null;
  /** Ad-hoc rules the user is composing in the filter bar (unsaved). */
  draftRules: FilterRules;
  version: number;
  /** Monotonic fetch generation: a late stale fetch is dropped entirely. */
  fetchSeq: number;

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
  /** Prune draft rules referencing dead defs/options (startup heal). */
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
      // A fetch for a superseded generation (rapid workspace switches race
      // their fetches) must be dropped entirely — applying it would swap in
      // another workspace's list and, via the reconcile below, clear a
      // legitimate active selection.
      if (get().fetchSeq !== seq) return;
      set((s) => {
        const active = s.activeViewId ? fresh.find((v) => v.id === s.activeViewId) : undefined;
        if (s.activeViewId && !active) {
          // Self-reconciling: the active view was deleted underneath the
          // fetch (startup heal, prune) — clear the stranded selection.
          return { views: fresh, activeViewId: null, draftRules: [], appliedRulesSnapshot: null };
        }
        // Straggler guard: the applied copy still matches what setActiveView
        // snapshotted (user hasn't tweaked it) yet the fresh rules differ —
        // the copy came from a stale pre-heal row; re-copy the healed rules.
        if (
          active &&
          s.appliedRulesSnapshot != null &&
          JSON.stringify(active.rules) !== s.appliedRulesSnapshot
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
      // Applying a view loads its rules into the draft so the filter bar
      // shows and can tweak them; clearing keeps the drafts untouched.
      draftRules: view ? view.rules.map((r) => ({ ...r })) : viewId === null ? s.draftRules : [],
      appliedRulesSnapshot: view ? JSON.stringify(view.rules) : null,
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
    set((s) => ({
      draftRules: s.draftRules.flatMap((r) => {
        if ((r.kind === "select" || r.kind === "multiSelect") && r.propertyId === propertyId) {
          const optionIds = r.optionIds.filter((id) => id !== optionId);
          if (optionIds.length === 0 && (r.op === "is" || r.op === "is-not")) return [];
          return [{ ...r, optionIds }];
        }
        return [r];
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
    // Bump AFTER the prune commits: CollectionsSection refetches on version
    // changes, so an earlier bump would race the prune transaction and cache
    // pre-commit rows (draft subscribers re-render off draftRules directly
    // and do not need the pre-set bump).
    set((s) => ({
      ...(activeDeleted ? { activeViewId: null, draftRules: [] } : {}),
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
      ...(activeDeleted ? { activeViewId: null, draftRules: [] } : {}),
      version: s.version + 1,
    }));
  },

  healDrafts: (defs) => {
    const defsById = new Map(defs.map((d) => [d.id, d]));
    set((s) => ({
      // Same contract as the runtime sync paths: drafts referencing dead
      // defs/options are pruned unconditionally — the FilterBar can never
      // render or clear a dead reference. Kinds are narrowed explicitly
      // because drafts copied from loaded views carry the loader's stamped
      // propertyId key on tags/journal/template rules too.
      draftRules: s.draftRules.flatMap((r): FilterRule[] => {
        switch (r.kind) {
          case "text":
          case "number":
          case "date":
          case "checkbox": {
            return defsById.has(r.propertyId) ? [r] : [];
          }
          case "select":
          case "multiSelect": {
            const def = defsById.get(r.propertyId);
            if (!def) return [];
            const live = new Set(def.options.map((o) => o.id));
            const optionIds = r.optionIds.filter((id) => live.has(id));
            // Drop only rules that HAD options and lost them all to dead
            // ids — an already-empty rule is the FilterBar's normal
            // mid-composition state ("is" with nothing picked yet) and
            // stays as an inactive chip until the user picks one.
            if (
              r.optionIds.length > 0 &&
              optionIds.length === 0 &&
              (r.op === "is" || r.op === "is-not")
            ) {
              return [];
            }
            if (optionIds.length !== r.optionIds.length) return [{ ...r, optionIds }];
            return [r];
          }
          default:
            return [r];
        }
      }),
      version: s.version + 1,
    }));
  },
}));

vaultService.onLock(() => {
  useViewStore.setState({ views: [], activeViewId: null, draftRules: [] });
});
