import {
  NotificationExtension,
  type NotificationService,
  QuickSearchExtension,
  type QuickSearchService,
} from "@blocksuite/affine/shared/services";
import type { ExtensionType } from "@blocksuite/affine/store";
import { useBlockSuiteDialogStore } from "../../store/useBlockSuiteDialogStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useUIStore } from "../../store/useUIStore";

const asText = (v: unknown): string => (typeof v === "string" ? v : "");

export const coveNotificationService: NotificationService = {
  toast: (message, options) => {
    void options;
    useNotificationStore.getState().pushToast({ kind: "info", title: message });
  },
  confirm: (options) =>
    useBlockSuiteDialogStore.getState().confirm({
      title: asText(options.title),
      message: asText(options.message),
      confirmText: options.confirmText ? asText(options.confirmText) : undefined,
      cancelText: options.cancelText ? asText(options.cancelText) : undefined,
    }),
  prompt: (options) =>
    useBlockSuiteDialogStore.getState().prompt({
      title: asText(options.title),
      message: asText(options.message),
      autofill: options.autofill,
      placeholder: options.placeholder,
      confirmText: options.confirmText ? asText(options.confirmText) : undefined,
      cancelText: options.cancelText ? asText(options.cancelText) : undefined,
    }),
  notify: (options) => {
    useNotificationStore.getState().pushToast({
      kind:
        options.accent === "error"
          ? "error"
          : options.accent === "warning"
            ? "warning"
            : options.accent === "success"
              ? "success"
              : "info",
      title: asText(options.title),
      description: options.message ? asText(options.message) : undefined,
    });
  },

  notifyWithUndoAction: (options) => coveNotificationService.notify(options),
};

export const coveNotificationExtension: ExtensionType =
  NotificationExtension(coveNotificationService);

export const coveQuickSearchService: QuickSearchService = {
  openQuickSearch: async () => {
    const docId = await useUIStore.getState().pickNote();
    return docId ? { docId } : null;
  },
};

export const coveQuickSearchExtension: ExtensionType = QuickSearchExtension(coveQuickSearchService);
