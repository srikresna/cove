import { presentError } from "../services/errorPresenter";
import { useNotificationStore } from "./useNotificationStore";

/**
 * Present an error as a toast — the single shared path for UI error feedback.
 *
 * useNoteStore keeps its own wrapper that ALSO sets the save-status badge
 * (useSaveStatusStore), since that is note-save-specific; every other caller
 * uses this directly instead of duplicating presentError + pushToast.
 */
export function notifyError(err: unknown): void {
  const p = presentError(err);
  useNotificationStore.getState().pushToast({
    kind: p.kind,
    title: p.toastTitle,
    description: p.toastDescription,
  });
}
