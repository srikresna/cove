import { create } from "zustand";

interface PropertyState {
  /** Bumped after every property mutation so all mounted surfaces refetch. */
  version: number;
  refresh: () => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  version: 0,
  refresh: () => set((s) => ({ version: s.version + 1 })),
}));
