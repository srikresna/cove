import { create } from "zustand";
import { workspaceService } from "../di/container";
import type { Workspace } from "../domain/workspace/Workspace";
import { presentError } from "../services/errorPresenter";
import { useNotificationStore } from "./useNotificationStore";

export type EditorEngine = "blocknote" | "blocksuite";

interface WorkspaceState {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isSettingsOpen: boolean;
  isDarkMode: boolean;
  editorEngine: EditorEngine;
  setEditorEngine: (engine: EditorEngine) => void;
  setActiveWorkspace: (id: string) => void;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  isTrashOpen: boolean;
  setTrashOpen: (open: boolean) => void;
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
  return localStorage.getItem("cove_theme") === "dark";
};

const EDITOR_ENGINE_KEY = "cove_editor_engine";

const getInitialEditorEngine = (): EditorEngine => {
  return localStorage.getItem(EDITOR_ENGINE_KEY) === "blocksuite" ? "blocksuite" : "blocknote";
};

function notifyError(err: unknown): void {
  const p = presentError(err);
  useNotificationStore.getState().pushToast({
    kind: p.kind,
    title: p.toastTitle,
    description: p.toastDescription,
  });
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  activeWorkspaceId: null,
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isSettingsOpen: false,
  isTrashOpen: false,
  isDarkMode: getInitialDarkMode(),
  editorEngine: getInitialEditorEngine(),

  setEditorEngine: (engine) => {
    localStorage.setItem(EDITOR_ENGINE_KEY, engine);
    set({ editorEngine: engine });
  },

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id });
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setQuickSearchOpen: (open) => set({ isQuickSearchOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setTrashOpen: (open) => set({ isTrashOpen: open }),
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
      notifyError(err);
    }
  },

  createWorkspace: async (name, emoji, color, description) => {
    try {
      const created = await workspaceService.createWorkspace(name, emoji, color, description);
      set((state) => ({
        workspaces: [...state.workspaces, created],
        activeWorkspaceId: created.id,
        isCreateModalOpen: false,
      }));
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
      await workspaceService.deleteWorkspace(id, current.length);
      set({ workspaces: filtered, activeWorkspaceId: nextActive });
    } catch (err) {
      notifyError(err);
    }
  },
}));
