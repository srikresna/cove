import { create } from "zustand";
import { SQLiteWorkspaceRepository } from "../repositories/SQLiteWorkspaceRepository";
import type { Workspace } from "../types";
import { useNoteStore } from "./useNoteStore";

const workspaceRepository = new SQLiteWorkspaceRepository();

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
  ) => Promise<Workspace>;
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

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: DEFAULT_WORKSPACES,
  activeWorkspaceId: "default-workspace-1",
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isDarkMode: false,

  setActiveWorkspace: (id) => {
    set({ activeWorkspaceId: id });
    useNoteStore.getState().fetchNotes(id);
  },

  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setQuickSearchOpen: (open) => set({ isQuickSearchOpen: open }),
  toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),

  fetchWorkspaces: async () => {
    try {
      const workspaces = await workspaceRepository.getAllWorkspaces();
      if (workspaces.length > 0) {
        set({ workspaces, activeWorkspaceId: workspaces[0].id });
        useNoteStore.getState().fetchNotes(workspaces[0].id);
      }
    } catch (err) {
      console.error("fetchWorkspaces store error:", err);
    }
  },

  createWorkspace: async (name, emoji, color, description) => {
    const newWsInput: Omit<Workspace, "createdAt"> = {
      id: crypto.randomUUID(),
      name,
      emoji,
      color,
      description,
    };

    set((state) => ({
      workspaces: [...state.workspaces, { ...newWsInput, createdAt: Date.now() }],
      activeWorkspaceId: newWsInput.id,
      isCreateModalOpen: false,
    }));

    try {
      const created = await workspaceRepository.createWorkspace(newWsInput);
      set((state) => ({
        workspaces: state.workspaces.map((w) => (w.id === created.id ? created : w)),
      }));
      useNoteStore.getState().fetchNotes(created.id);
      return created;
    } catch (err) {
      console.error("createWorkspace store error:", err);
      return { ...newWsInput, createdAt: Date.now() };
    }
  },

  updateWorkspace: async (id, updates) => {
    set((state) => ({
      workspaces: state.workspaces.map((w) => (w.id === id ? { ...w, ...updates } : w)),
    }));

    try {
      await workspaceRepository.updateWorkspace(id, updates);
    } catch (err) {
      console.error("updateWorkspace store error:", err);
    }
  },

  deleteWorkspace: async (id) => {
    const current = get().workspaces;
    if (current.length <= 1) return;

    const filtered = current.filter((w) => w.id !== id);
    const nextActive = filtered[0].id;

    set({ workspaces: filtered, activeWorkspaceId: nextActive });

    useNoteStore.getState().deleteNotesByWorkspace(id);

    try {
      await workspaceRepository.deleteWorkspace(id);
    } catch (err) {
      console.error("deleteWorkspace store error:", err);
    }
  },
}));
