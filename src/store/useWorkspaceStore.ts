import { create } from "zustand";
import { workspaceService } from "../di/container";
import type { Workspace } from "../domain/workspace/Workspace";
import { Logger } from "../services/Logger";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isSettingsOpen: boolean;
  isDarkMode: boolean;
  setActiveWorkspace: (id: string) => void;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
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

const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem("cove_theme");
  if (saved !== null) {
    return saved === "dark";
  }
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isSettingsOpen: false,
  isDarkMode: getInitialDarkMode(),

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id });
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setQuickSearchOpen: (open) => set({ isQuickSearchOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  toggleDarkMode: () =>
    set((state) => {
      const nextMode = !state.isDarkMode;
      localStorage.setItem("cove_theme", nextMode ? "dark" : "light");
      return { isDarkMode: nextMode };
    }),

  fetchWorkspaces: async () => {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
      const first = workspaces[0];
      set({ workspaces, activeWorkspaceId: first ? first.id : null });
    } catch (err) {
      Logger.error("fetchWorkspaces store error", err);
    }
  },

  createWorkspace: async (name, emoji, color, description) => {
    const previous = get().workspaces;
    try {
      const created = await workspaceService.createWorkspace(name, emoji, color, description);
      set((state) => ({
        workspaces: [...state.workspaces, created],
        activeWorkspaceId: created.id,
        isCreateModalOpen: false,
      }));
      return created;
    } catch (err) {
      Logger.error("createWorkspace store error", err);
      set({ workspaces: previous, isCreateModalOpen: false });
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
      Logger.error("updateWorkspace store error", err);
      set({ workspaces: previous });
    }
  },

  deleteWorkspace: async (id) => {
    const current = get().workspaces;
    const filtered = current.filter((w) => w.id !== id);
    const nextActive = filtered[0]?.id ?? null;

    try {
      await workspaceService.deleteWorkspace(id, current.length);
      set({ workspaces: filtered, activeWorkspaceId: nextActive });
    } catch (err) {
      Logger.error("deleteWorkspace store error", err);
      set({ workspaces: current });
    }
  },
}));
