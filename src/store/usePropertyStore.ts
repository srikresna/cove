import { create } from "zustand";
import { changeBus } from "../services/changeBus";

interface PropertyState {
  version: number;
  refresh: () => void;
}

export const usePropertyStore = create<PropertyState>((set) => ({
  version: 0,
  refresh: () => set((s) => ({ version: s.version + 1 })),
}));

changeBus.on("properties", () => usePropertyStore.getState().refresh());
