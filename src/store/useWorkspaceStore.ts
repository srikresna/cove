import { create } from "zustand";
import { noteService, workspaceService } from "../di/container";
import type { Workspace } from "../domain/workspace/Workspace";
import { notifyError } from "./notify";
import { useTagStore } from "./useTagStore";
import { useUIStore } from "./useUIStore";
import { useViewStore } from "./useViewStore";

/**
 * Tag filters and saved-view rules are workspace-scoped (tag ids and property
 * ids belong to one workspace). Whenever the active workspace actually
 * changes, drop them so the previous workspace's filters never leak into the
 * new one's note list.
 */
function resetWorkspaceScopedFilters(): void {
  useTagStore.setState({ activeTagId: null, taggedNoteIds: null });
  useViewStore.setState({ activeViewId: null, draftRules: [] });
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  setActiveWorkspace: (id: string) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (
    name: string,
    emoji: string,
    color: string,
    description?: string,
  ) => Promise<Workspace | null>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,

  setActiveWorkspace: (id) => {
    if (get().activeWorkspaceId === id) return;
    set({ activeWorkspaceId: id });
    resetWorkspaceScopedFilters();
  },

  fetchWorkspaces: async () => {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
      set((state) => {
        const activeWorkspaceId =
          state.activeWorkspaceId && workspaces.some((w) => w.id === state.activeWorkspaceId)
            ? state.activeWorkspaceId
            : (workspaces[0]?.id ?? null);
        if (activeWorkspaceId !== state.activeWorkspaceId) resetWorkspaceScopedFilters();
        return { workspaces, activeWorkspaceId };
      });
    } catch (err) {
      notifyError(err);
    }
  },

  createWorkspace: async (name, emoji, color, description) => {
    try {
      const created = await workspaceService.createWorkspace(name, emoji, color, description);
      set((state) => ({
        workspaces: [...state.workspaces, created],
        activeWorkspaceId: created.id,
      }));

      useUIStore.getState().setCreateModalOpen(false);
      return created;
    } catch (err) {
      notifyError(err);
      return null;
    }
  },

  updateWorkspace: async (id, updates) => {
    const previous = get().workspaces;
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));

    try {
      await workspaceService.updateWorkspace(id, updates);
    } catch (err) {
      set({ workspaces: previous });
      notifyError(err);
    }
  },

  deleteWorkspace: async (id) => {
    const current = get().workspaces;
    const filtered = current.filter((w) => w.id !== id);
    const nextActive = filtered[0]?.id ?? null;

    let blobCandidates: string[] = [];
    try {
      blobCandidates = await noteService.collectWorkspaceBlobCandidates(id);
    } catch {}

    try {
      await workspaceService.deleteWorkspace(id);
      set({ workspaces: filtered, activeWorkspaceId: nextActive });
      resetWorkspaceScopedFilters();
      if (blobCandidates.length > 0) {
        void noteService.gcOrphanBlobs(blobCandidates).catch(() => {});
      }
    } catch (err) {
      notifyError(err);
    }
  },
}));
