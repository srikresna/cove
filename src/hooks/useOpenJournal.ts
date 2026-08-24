import { useCallback } from "react";
import { journalService } from "../di/container";
import { notifyError } from "../store/notify";
import { useNoteStore } from "../store/useNoteStore";
import { usePropertyStore } from "../store/usePropertyStore";
import { useUIStore } from "../store/useUIStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

/**
 * The single journal navigation helper (AFFI NE repeats this ternary in four
 * places): ensure-or-create the journal note for a date, refresh both stores,
 * then open it. A same-id re-select (clicking Today on today's journal, or
 * the already-highlighted day chip) skips setActiveNoteId — it would null
 * activeCoverImage with no effect to reload it — but still returns the main
 * area to the editor page.
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
          usePropertyStore.getState().refresh();
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
