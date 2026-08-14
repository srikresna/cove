import { create } from "zustand";
import { workspaceService } from "../di/container";
import type { Workspace } from "../domain/workspace/Workspace";
import { notifyError } from "./notify";
import { useUIStore } from "./useUIStore";

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

  setActiveWorkspace: (id) => set({ activeWorkspaceId: id }),

  fetchWorkspaces: async () => {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
      const first = workspaces[0];
      set({ workspaces, activeWorkspaceId: first ? first.id : null });
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

    try {
      await workspaceService.deleteWorkspace(id);
      set({ workspaces: filtered, activeWorkspaceId: nextActive });
    } catch (err) {
      notifyError(err);
    }
  },
}));
