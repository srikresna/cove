import { create } from "zustand";

export type EditorEngine = "blocknote" | "blocksuite";

/**
 * Ephemeral UI state: modal open/close flags, theme, and editor-engine
 * preference. Separated from useWorkspaceStore (domain data) so toggling a
 * modal or the theme does not re-render workspace-data consumers, and vice
 * versa. (Render-storm prevention is also handled by per-field selectors.)
 */
interface UIState {
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isSettingsOpen: boolean;
  isTrashOpen: boolean;
  isDarkMode: boolean;
  editorEngine: EditorEngine;
  setEditorEngine: (engine: EditorEngine) => void;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTrashOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
}

const THEME_KEY = "cove_theme";
const ENGINE_KEY = "cove_editor_engine";

const getInitialDarkMode = (): boolean => localStorage.getItem(THEME_KEY) === "dark";
const getInitialEditorEngine = (): EditorEngine =>
  localStorage.getItem(ENGINE_KEY) === "blocksuite" ? "blocksuite" : "blocknote";

export const useUIStore = create<UIState>((set) => ({
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isSettingsOpen: false,
  isTrashOpen: false,
  isDarkMode: getInitialDarkMode(),
  editorEngine: getInitialEditorEngine(),

  setEditorEngine: (engine) => {
    localStorage.setItem(ENGINE_KEY, engine);
    set({ editorEngine: engine });
  },
  setCreateModalOpen: (open) => set({ isCreateModalOpen: open }),
  setQuickSearchOpen: (open) => set({ isQuickSearchOpen: open }),
  setSettingsOpen: (open) => set({ isSettingsOpen: open }),
  setTrashOpen: (open) => set({ isTrashOpen: open }),
  toggleDarkMode: () =>
    set((state) => {
      const nextMode = !state.isDarkMode;
      localStorage.setItem(THEME_KEY, nextMode ? "dark" : "light");
      return { isDarkMode: nextMode };
    }),
}));
