import { create } from "zustand";

export type SaveStatus = "idle" | "saving" | "saved" | "error";

interface SaveStatusState {
  status: SaveStatus;
  lastSavedAt: number | null;
  errorMessage: string | null;
  setSaving: () => void;
  setSaved: () => void;
  setError: (msg: string) => void;
}

export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  status: "idle",
  lastSavedAt: null,
  errorMessage: null,

  setSaving: () => set({ status: "saving", errorMessage: null }),
  setSaved: () => set({ status: "saved", lastSavedAt: Date.now(), errorMessage: null }),
  setError: (msg) => set({ status: "error", errorMessage: msg }),
}));
