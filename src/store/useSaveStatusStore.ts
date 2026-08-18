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

let inFlightSaves = 0;

export const useSaveStatusStore = create<SaveStatusState>((set) => ({
  status: "idle",
  lastSavedAt: null,
  errorMessage: null,

  setSaving: () => {
    inFlightSaves += 1;
    set({ status: "saving", errorMessage: null });
  },
  setSaved: () => {
    inFlightSaves = Math.max(0, inFlightSaves - 1);
    if (inFlightSaves === 0) {
      set({ status: "saved", lastSavedAt: Date.now(), errorMessage: null });
    }
  },
  setError: (msg) => {
    inFlightSaves = Math.max(0, inFlightSaves - 1);
    if (inFlightSaves === 0) {
      set({ status: "error", errorMessage: msg });
    }
  },
}));
