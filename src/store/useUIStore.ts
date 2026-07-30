import { create } from "zustand";

/**
 * Ephemeral UI state: modal open/close flags and theme. Separated from
 * useWorkspaceStore (domain data) so toggling a modal or the theme does not
 * re-render workspace-data consumers, and vice versa.
 */
interface UIState {
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isSettingsOpen: boolean;
  isTrashOpen: boolean;
  isDarkMode: boolean;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTrashOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
}

const THEME_KEY = "cove_theme";

const getInitialDarkMode = (): boolean => localStorage.getItem(THEME_KEY) === "dark";

export const useUIStore = create<UIState>((set) => ({
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isSettingsOpen: false,
  isTrashOpen: false,
  isDarkMode: getInitialDarkMode(),

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
