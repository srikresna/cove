import { create } from "zustand";

interface UIState {
  isCreateModalOpen: boolean;
  isQuickSearchOpen: boolean;
  isSettingsOpen: boolean;
  isTrashOpen: boolean;
  isDarkMode: boolean;

  pickerResolve: ((id: string | null) => void) | null;
  setCreateModalOpen: (open: boolean) => void;
  setQuickSearchOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setTrashOpen: (open: boolean) => void;
  toggleDarkMode: () => void;

  pickNote: () => Promise<string | null>;

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
  setQuickSearchOpen: (open) => {
    if (!open && get().pickerResolve) {
      get().resolvePicker(null);
      return;
    }
    set({ isQuickSearchOpen: open });
  },
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
      const prev = get().pickerResolve;
      if (prev) prev(null);
      set({ pickerResolve: resolve, isQuickSearchOpen: true });
    }),
  resolvePicker: (id) => {
    const r = get().pickerResolve;
    set({ pickerResolve: null, isQuickSearchOpen: false });
    r?.(id);
  },
}));
