import { create } from "zustand";
import { vaultService } from "../di/container";
import { useUIStore } from "./useUIStore";

/** Pure client state around the active note (the list itself lives in the
 *  query cache). */
interface NoteUiState {
  activeNoteId: string | null;
  activeCoverImage: string | null;
  setActiveNoteId: (id: string | null) => void;
}

export const useNoteUiStore = create<NoteUiState>((set) => ({
  activeNoteId: null,
  activeCoverImage: null,

  setActiveNoteId: (id) => {
    // Opening a note always returns the main area to the editor page
    // (leaving Library/Journals/Trash behind).
    useUIStore.getState().setActivePage("editor");
    set({ activeNoteId: id, activeCoverImage: null });
  },
}));

vaultService.onLock(() => {
  useNoteUiStore.setState({ activeNoteId: null, activeCoverImage: null });
});
