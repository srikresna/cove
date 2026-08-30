import { useCallback } from "react";
import { journalService } from "../di/container";
import { notifyError } from "../store/notify";
import { useNoteStore } from "../store/useNoteStore";
import { useUIStore } from "../store/useUIStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

/**
 * Ensure-or-create the journal note for a date, refresh stores, open it.
 * A same-id re-select skips setActiveNoteId (it would null activeCoverImage)
 * but still returns the main area to the editor page.
 */
export function useOpenJournal(): (timestamp: number) => void {
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useCallback(
    (timestamp: number) => {
      if (!activeWorkspaceId) return;
      journalService
        .ensureJournalByDate(activeWorkspaceId, timestamp)
        .then(async (noteId) => {
          await useNoteStore.getState().refreshNotesInPlace(activeWorkspaceId);
          if (useNoteStore.getState().activeNoteId === noteId) {
            useUIStore.getState().setActivePage("editor");
            return;
          }
          setActiveNoteId(noteId);
        })
        .catch(notifyError);
    },
    [activeWorkspaceId, setActiveNoteId],
  );
}
