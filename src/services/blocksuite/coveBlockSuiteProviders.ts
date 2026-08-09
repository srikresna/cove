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

/**
 * Maps BlockSuite's NotificationService contract onto Cove's toast + modal
 * layers. confirm/prompt use a real modal (BlockSuiteDialogs), not native
 * alerts. Blocks call this via `std.get(NotificationProvider)` — e.g. the
 * "create linked doc" title prompt and undo toasts.
 */
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
  // Undo-action wiring is deferred; surface the notification for now.
  notifyWithUndoAction: (options) => coveNotificationService.notify(options),
};

/** ExtensionType that registers the notification service in every editor. */
export const coveNotificationExtension: ExtensionType =
  NotificationExtension(coveNotificationService);

/**
 * Maps BlockSuite's QuickSearchService contract onto Cove's QuickSearchModal,
 * run in picker mode so a chosen doc id is returned (used by the @-popover
 * "link to doc" and bookmark quick-search flows).
 */
export const coveQuickSearchService: QuickSearchService = {
  openQuickSearch: async () => {
    const docId = await useUIStore.getState().pickNote();
    return docId ? { docId } : null;
  },
};

/** ExtensionType that registers the quick-search service in every editor. */
export const coveQuickSearchExtension: ExtensionType = QuickSearchExtension(coveQuickSearchService);
