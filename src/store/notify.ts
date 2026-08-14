import { presentError } from "../services/errorPresenter";
import { useNotificationStore } from "./useNotificationStore";

export function notifyError(err: unknown): void {
  const p = presentError(err);
  useNotificationStore.getState().pushToast({
    kind: p.kind,
    title: p.toastTitle,
    description: p.toastDescription,
  });
}
