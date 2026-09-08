import { create } from "zustand";
import { vaultService } from "../di/container";
import { useUIStore } from "./useUIStore";

interface NoteUiState {
  activeNoteId: string | null;
  activeCoverImage: string | null;
  setActiveNoteId: (id: string | null) => void;
}

export const useNoteUiStore = create<NoteUiState>((set) => ({
  activeNoteId: null,
  activeCoverImage: null,

  setActiveNoteId: (id) => {
    useUIStore.getState().setActivePage("editor");
    set({ activeNoteId: id, activeCoverImage: null });
  },
}));

vaultService.onLock(() => {
  useNoteUiStore.setState({ activeNoteId: null, activeCoverImage: null });
});
