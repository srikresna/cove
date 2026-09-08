import { create } from "zustand";
import { type PeekRequest, providePeekSink } from "../services/blocksuite/peekViewService";

interface PeekViewState {
  request: PeekRequest | null;
  resolve: (() => void) | null;
  open: (request: PeekRequest, resolve: () => void) => void;
  close: () => void;
}

export const usePeekViewStore = create<PeekViewState>((set, get) => ({
  request: null,
  resolve: null,
  open: (request, resolve) => {
    get().resolve?.();
    set({ request, resolve });
  },
  close: () => {
    get().resolve?.();
    set({ request: null, resolve: null });
  },
}));

providePeekSink({
  open: (request, resolve) => usePeekViewStore.getState().open(request, resolve),
  close: () => usePeekViewStore.getState().close(),
});
