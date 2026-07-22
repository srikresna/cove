import { create } from "zustand";
import { workspaceService } from "../di/container";
import type { Workspace } from "../domain/workspace/Workspace";
import { Logger } from "../services/Logger";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string;
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isDarkMode: boolean;
  setActiveWorkspace: (id: string) => void;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
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

const DEFAULT_WORKSPACES: Workspace[] = [
  {
    id: "default-workspace-1",
    name: "Work & Projects",
    emoji: "💼",
    color: "#ff6f1e",
    description: "Personal notes and side hustle projects",
    createdAt: Date.now(),
  },
];

const getInitialDarkMode = (): boolean => {
  const saved = localStorage.getItem("cove_theme");
  if (saved !== null) {
    return saved === "dark";
  }
  return typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches;
};

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: DEFAULT_WORKSPACES,
  activeWorkspaceId: "default-workspace-1",
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isDarkMode: getInitialDarkMode(),

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id });
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setQuickSearchOpen: (open) => set({ isQuickSearchOpen: open }),
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
      if (first) {
        set({ workspaces, activeWorkspaceId: first.id });
      }
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
    const nextActive = filtered[0]?.id || get().activeWorkspaceId;

    try {
      await workspaceService.deleteWorkspace(id, current.length);
      set({ workspaces: filtered, activeWorkspaceId: nextActive });
    } catch (err) {
      Logger.error("deleteWorkspace store error", err);
      set({ workspaces: current });
    }
  },
}));
