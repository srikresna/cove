import { create } from "zustand";
import { noteService, workspaceService } from "../di/container";
import type { Workspace } from "../domain/workspace/Workspace";
import { processWorkspaceIcon } from "../utils/workspaceIcon";
import { notifyError } from "./notify";
import { useTagStore } from "./useTagStore";
import { useUIStore } from "./useUIStore";
import { useViewStore } from "./useViewStore";

function resetWorkspaceScopedFilters(): void {
  useTagStore.setState({ activeTagId: null, taggedNoteIds: null });
  useViewStore.setState((s) => ({
    activeViewId: null,
    draftRules: [],
    appliedRulesSnapshot: null,
    fetchSeq: s.fetchSeq + 1,
  }));
}

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  icons: Record<string, string>;
  setActiveWorkspace: (id: string) => void;
  fetchWorkspaces: () => Promise<void>;
  createWorkspace: (
    name: string,
    emoji: string,
    color: string,
    description?: string,
  ) => Promise<Workspace | null>;
  updateWorkspace: (id: string, updates: Partial<Workspace>) => Promise<void>;
  renameWorkspace: (id: string, name: string) => Promise<void>;
  deleteWorkspace: (id: string) => Promise<void>;
  uploadWorkspaceIcon: (id: string, file: File) => Promise<void>;
  setWorkspaceIconFromDataUrl: (id: string, dataUrl: string) => Promise<boolean>;
  removeWorkspaceIcon: (id: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  icons: {},

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
      const icons: Record<string, string> = {};
      await Promise.all(
        workspaces.map(async (w) => {
          try {
            const icon = await workspaceService.getIcon(w.id);
            if (icon) icons[w.id] = icon;
          } catch {}
        }),
      );
      set({ icons });
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
      resetWorkspaceScopedFilters();

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

  renameWorkspace: async (id, name) => {
    try {
      const updated = await workspaceService.renameWorkspace(id, name);
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === id ? updated : w)),
      }));
    } catch (err) {
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
      set((state) => {
        const icons = { ...state.icons };
        delete icons[id];
        return { workspaces: filtered, activeWorkspaceId: nextActive, icons };
      });
      resetWorkspaceScopedFilters();
      if (blobCandidates.length > 0) {
        void noteService.gcOrphanBlobs(blobCandidates).catch(() => {});
      }
    } catch (err) {
      notifyError(err);
    }
  },

  uploadWorkspaceIcon: async (id, file) => {
    try {
      const dataUrl = await processWorkspaceIcon(file);
      await workspaceService.setIcon(id, dataUrl);
      set((state) => ({ icons: { ...state.icons, [id]: dataUrl } }));
    } catch (err) {
      notifyError(err);
    }
  },

  setWorkspaceIconFromDataUrl: async (id, dataUrl) => {
    try {
      await workspaceService.setIcon(id, dataUrl);
      set((state) => ({ icons: { ...state.icons, [id]: dataUrl } }));
      return true;
    } catch (err) {
      notifyError(err);
      return false;
    }
  },

  removeWorkspaceIcon: async (id) => {
    try {
      await workspaceService.removeIcon(id);
      set((state) => {
        const icons = { ...state.icons };
        delete icons[id];
        return { icons };
      });
    } catch (err) {
      notifyError(err);
    }
  },
}));
