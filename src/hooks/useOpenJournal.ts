import { useCallback } from "react";
import { journalService } from "../di/container";
import { noteActions } from "../store/noteActions";
import { notifyError } from "../store/notify";
import { useNoteUiStore } from "../store/useNoteUiStore";
import { useUIStore } from "../store/useUIStore";
import { useWorkspaceStore } from "../store/useWorkspaceStore";

export function useOpenJournal(): (timestamp: number) => void {
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);

  return useCallback(
    (timestamp: number) => {
      if (!activeWorkspaceId) return;
      journalService
        .ensureJournalByDate(activeWorkspaceId, timestamp)
        .then(async (noteId) => {
          await noteActions.refreshNotesInPlace(activeWorkspaceId);
          if (useNoteUiStore.getState().activeNoteId === noteId) {
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
