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
  /** When set, the quick-search modal runs in "picker" mode: selecting a hit
   *  resolves this promise with the doc id instead of navigating. */
  pickerResolve: ((id: string | null) => void) | null;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTrashOpen: (open: boolean) => void;
  toggleDarkMode: () => void;
  /** Open quick-search as a note picker; resolves with the picked doc id or null. */
  pickNote: () => Promise<string | null>;
  /** Resolve an in-flight picker (doc id or null) and close the modal. */
  resolvePicker: (id: string | null) => void;
}

const THEME_KEY = "cove_theme";

const getInitialDarkMode = (): boolean => localStorage.getItem(THEME_KEY) === "dark";

export const useUIStore = create<UIState>((set, get) => ({
  isCreateModalOpen: false,
  isQuickSearchOpen: false,
  isSettingsOpen: false,
  isTrashOpen: false,
  isDarkMode: getInitialDarkMode(),
  pickerResolve: null,

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
  pickNote: () =>
    new Promise<string | null>((resolve) => {
      set({ pickerResolve: resolve, isQuickSearchOpen: true });
    }),
  resolvePicker: (id) => {
    const r = get().pickerResolve;
    set({ pickerResolve: null, isQuickSearchOpen: false });
    r?.(id);
  },
}));
