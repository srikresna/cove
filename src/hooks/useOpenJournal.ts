import { useCallback } from "react";
import { journalService } from "../di/container";
import { notifyError } from "../store/notify";
import { useNoteStore } from "../store/useNoteStore";
import { usePropertyStore } from "../store/usePropertyStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

/**
 * The single journal navigation helper (AFFI NE repeats this ternary in four
 * places): ensure-or-create the journal note for a date, refresh both stores,
 * then open it.
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
          setActiveNoteId(noteId);
        })
        .catch(notifyError);
    },
    [activeWorkspaceId, setActiveNoteId],
  );
}
