import {
  type LinkPreviewProvider,
  LinkPreviewServiceIdentifier,
  NotificationExtension,
  type NotificationService,
  QuickSearchExtension,
  type QuickSearchService,
} from "@blocksuite/affine/shared/services";
import type { ExtensionType } from "@blocksuite/affine/store";
import { invoke } from "@tauri-apps/api/core";

interface CoveUiPort {
  toast(message: string): void;
  confirm(options: {
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<boolean>;
  prompt(options: {
    title: string;
    message: string;
    autofill?: string;
    placeholder?: string;
    confirmText?: string;
    cancelText?: string;
  }): Promise<string | null>;
  notify(options: {
    accent: "error" | "warning" | "success" | "info";
    title: string;
    message?: string;
  }): void;
  pickNote(): Promise<string | null>;
}

let ui: CoveUiPort | null = null;

export function provideCoveUi(port: CoveUiPort): void {
  ui = port;
}

const coveNotificationService: NotificationService = {
  toast: (message) => ui?.toast(message),
  confirm: (options) =>
    ui
      ? ui.confirm({
          title: String(options.title ?? ""),
          message: String(options.message ?? ""),
          confirmText: options.confirmText ? String(options.confirmText) : undefined,
          cancelText: options.cancelText ? String(options.cancelText) : undefined,
        })
      : Promise.resolve(false),
  prompt: (options) =>
    ui
      ? ui.prompt({
          title: String(options.title ?? ""),
          message: String(options.message ?? ""),
          autofill: options.autofill,
          placeholder: options.placeholder,
          confirmText: options.confirmText ? String(options.confirmText) : undefined,
          cancelText: options.cancelText ? String(options.cancelText) : undefined,
        })
      : Promise.resolve(null),
  notify: (options) =>
    ui?.notify({
      accent:
        options.accent === "error" || options.accent === "warning" || options.accent === "success"
          ? options.accent
          : "info",
      title: String(options.title ?? ""),
      message: options.message ? String(options.message) : undefined,
    }),

  notifyWithUndoAction: (options) => coveNotificationService.notify(options),
};

export const coveNotificationExtension: ExtensionType =
  NotificationExtension(coveNotificationService);

const coveQuickSearchService: QuickSearchService = {
  openQuickSearch: async () => {
    const docId = (await ui?.pickNote()) ?? null;
    return docId ? { docId } : null;
  },
};

export const coveQuickSearchExtension: ExtensionType = QuickSearchExtension(coveQuickSearchService);

type PreviewResult = Awaited<ReturnType<LinkPreviewProvider["query"]>>;

const LINK_PREVIEW_CACHE_MAX = 50;
const linkPreviewCache = new Map<string, PreviewResult>();
const linkPreviewPending = new Map<string, Promise<PreviewResult>>();

function cachePreview(url: string, result: PreviewResult): void {
  linkPreviewCache.delete(url);
  linkPreviewCache.set(url, result);
  if (linkPreviewCache.size > LINK_PREVIEW_CACHE_MAX) {
    const oldest = linkPreviewCache.keys().next().value;
    if (oldest !== undefined) linkPreviewCache.delete(oldest);
  }
}

export const coveLinkPreviewService: LinkPreviewProvider = {
  endpoint: "native",
  setEndpoint: () => {},
  query: (url) => {
    const cached = linkPreviewCache.get(url);
    if (cached) {
      linkPreviewCache.delete(url);
      linkPreviewCache.set(url, cached);
      return Promise.resolve(cached);
    }
    const inflight = linkPreviewPending.get(url);
    if (inflight) return inflight;
    const promise = invoke<{
      title?: string | null;
      description?: string | null;
      icon?: string | null;
      image?: string | null;
    } | null>("fetch_link_preview", { url })
      .then((data) => {
        const result: PreviewResult = data ?? {};
        if (Object.keys(result).length > 0) cachePreview(url, result);
        return result;
      })
      .catch(() => ({}) as PreviewResult)
      .finally(() => {
        linkPreviewPending.delete(url);
      });
    linkPreviewPending.set(url, promise);
    return promise;
  },
};

export const coveLinkPreviewExtension: ExtensionType = {
  setup: (di) => {
    di.override(LinkPreviewServiceIdentifier, coveLinkPreviewService);
  },
};
