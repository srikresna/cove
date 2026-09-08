import { provideCoveUi } from "../services/blocksuite/coveBlockSuiteProviders";
import { useBlockSuiteDialogStore } from "./useBlockSuiteDialogStore";
import { useNotificationStore } from "./useNotificationStore";
import { useUIStore } from "./useUIStore";

provideCoveUi({
  toast: (message) => useNotificationStore.getState().pushToast({ kind: "info", title: message }),
  confirm: (options) => useBlockSuiteDialogStore.getState().confirm(options),
  prompt: (options) => useBlockSuiteDialogStore.getState().prompt(options),
  notify: (options) =>
    useNotificationStore.getState().pushToast({
      kind: options.accent,
      title: options.title,
      description: options.message,
    }),
  pickNote: () => useUIStore.getState().pickNote(),
});
