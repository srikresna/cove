import { create } from "zustand";
import { changeBus } from "../services/changeBus";

interface PropertyState {
  /** Bumped after every property write so all mounted surfaces refetch. */
  version: number;
  refresh: () => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  version: 0,
  refresh: () => set((s) => ({ version: s.version + 1 })),
}));

// Repo writes publish "properties" — the bump is centralized here instead of
// every mutation call site.
changeBus.on("properties", () => usePropertyStore.getState().refresh());
