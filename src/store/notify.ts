import { presentError } from "../services/errorPresenter";
import { useNotificationStore } from "./useNotificationStore";
import { useSaveStatusStore } from "./useSaveStatusStore";

export function notifyError(err: unknown): void {
  notifyErrorWithSaveStatus(err, { saveStatus: false });
}

export function notifyErrorWithSaveStatus(
  err: unknown,
  opts: { saveStatus: boolean } = { saveStatus: true },
): void {
  const p = presentError(err);
  if (opts.saveStatus) {
    useSaveStatusStore.getState().setError(p.userMessage);
  }
  useNotificationStore.getState().pushToast({
    kind: p.kind,
    title: p.toastTitle,
    description: p.toastDescription,
  });
}
