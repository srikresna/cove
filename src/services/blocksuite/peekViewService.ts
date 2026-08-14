import type { PeekOptions, PeekViewService } from "@blocksuite/affine/components/peek";
import { create } from "zustand";

export interface PeekRequest {
  docId: string;
  mode: "edgeless" | "page";

  xywh?: string;
  blockIds?: string[];
  elementIds?: string[];
}

interface PeekViewState {
  request: PeekRequest | null;
  resolve: (() => void) | null;
  open: (request: PeekRequest, resolve: () => void) => void;
  close: () => void;
}

export const usePeekViewStore = create<PeekViewState>((set, get) => ({
  request: null,
  resolve: null,
  open: (request, resolve) => set({ request, resolve }),
  close: () => {
    get().resolve?.();
    set({ request: null, resolve: null });
  },
}));

function resolvePeekTarget(args: {
  target?: HTMLElement;
  docId?: string;
  blockIds?: string[];
  elementIds?: string[];
}): PeekRequest | null {
  const { target, docId, blockIds, elementIds } = args;

  if (target && "model" in target) {
    // biome-ignore lint/suspicious/noExplicitAny: BlockSuite duck-typing
    const model = (target as any).model;
    if (model?.flavour === "affine:surface-ref") {
      // biome-ignore lint/suspicious/noExplicitAny: BlockSuite duck-typing
      const ref = (target as any).referenceModel;
      const refDocId = ref && "store" in ref ? ref.store.id : ref?.surface?.store?.id;
      if (refDocId && ref?.xywh) {
        return { docId: refDocId, mode: "edgeless", xywh: ref.xywh };
      }
    }
  }

  if (docId) {
    return { docId, mode: "edgeless", blockIds, elementIds };
  }
  return null;
}

type PeekArg = {
  target?: HTMLElement;
  template?: unknown;
  docId?: string;
  blockIds?: string[];
  elementIds?: string[];
  databaseId?: string;
  databaseDocId?: string;
  databaseRowId?: string;
};

function peekKey(req: PeekRequest): string {
  return `${req.docId}:${req.mode}:${req.xywh ?? ""}:${(req.elementIds ?? []).join(",")}`;
}

let inflight: { key: string; promise: Promise<void> } | null = null;

export const covePeekViewService: PeekViewService = {
  peek: ((arg: PeekArg, _options?: PeekOptions): Promise<void> => {
    void _options;
    const request = resolvePeekTarget({
      target: arg.target,
      docId: arg.docId,
      blockIds: arg.blockIds,
      elementIds: arg.elementIds,
    });
    if (!request) return Promise.resolve();
    const key = peekKey(request);

    if (inflight && inflight.key === key) {
      return inflight.promise;
    }
    const promise = new Promise<void>((resolve) => {
      usePeekViewStore.getState().open(request, resolve);
    });
    inflight = { key, promise };
    promise.finally(() => {
      if (inflight?.promise === promise) inflight = null;
    });
    return promise;
  }) as PeekViewService["peek"],
};
