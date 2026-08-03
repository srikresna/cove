import type { PeekOptions, PeekViewService } from "@blocksuite/affine/components/peek";
import { create } from "zustand";

/**
 * Bridge between BlockSuite's @Peekable controller and Cove's React modal.
 *
 * BlockSuite only defines the {@link PeekViewService} contract — the host app
 * supplies the implementation. We resolve the peek target to a normalized
 * request, stash it in a zustand store, and resolve peek()'s returned promise
 * when the modal closes. Lives under services/ so the editor service can import
 * the PeekViewService without coupling to the React component tree.
 */

/** Normalized request the modal renders from. */
export interface PeekRequest {
  docId: string;
  mode: "edgeless" | "page";
  /** Serialized `[x,y,w,h]` bound of the referenced frame/element. */
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
    // Resolving fulfills the promise BlockSuite's PeekableController awaits.
    get().resolve?.();
    set({ request: null, resolve: null });
  },
}));

/**
 * Duck-type the BlockSuite peek target into a normalized {@link PeekRequest}.
 * Mirrors AFFiNE's `resolvePeekInfoFromPeekTarget` for the two branches Cove
 * cares about: surface-ref (frame/mindmap) and direct page-ref.
 */
function resolvePeekTarget(args: {
  target?: HTMLElement;
  docId?: string;
  blockIds?: string[];
  elementIds?: string[];
}): PeekRequest | null {
  const { target, docId, blockIds, elementIds } = args;

  // Element form: a @Peekable surface-ref block (a frame/mindmap embedded in a
  // page note). Double-click / shift-click calls peek({ target }). The block's
  // `referenceModel` points at the edgeless element it mirrors.
  if (target && "model" in target) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const model = (target as any).model;
    if (model?.flavour === "affine:surface-ref") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const ref = (target as any).referenceModel;
      const refDocId = ref && "store" in ref ? ref.store.id : ref?.surface?.store?.id;
      if (refDocId && ref?.xywh) {
        return { docId: refDocId, mode: "edgeless", xywh: ref.xywh };
      }
    }
  }

  // Page-ref form: direct { docId, blockIds, elementIds } (footnotes /
  // databases / linked docs). Peek as edgeless so embedded elements render.
  if (docId) {
    return { docId, mode: "edgeless", blockIds, elementIds };
  }
  return null;
}

/** Union of both peek() overload arg shapes (Cove ignores the Lit template). */
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

/** Stable identity for a peek target, used to dedupe concurrent peek() calls. */
function peekKey(req: PeekRequest): string {
  return `${req.docId}:${req.mode}:${req.xywh ?? ""}:${(req.elementIds ?? []).join(",")}`;
}

// Tracks the in-flight peek so a repeated peek() for the SAME target reuses the
// already-open modal instead of remounting a second edgeless editor. BlockSuite's
// @Peekable controller can fire peek() twice for a single gesture; remounting a
// second editor on the same doc while the first's surface renderer is still
// attached causes a re-render storm that blocks the main thread (spinner hangs
// forever). Deduping is essential.
let inflight: { key: string; promise: Promise<void> } | null = null;

/**
 * The PeekViewService BlockSuite's @Peekable controller calls. Opens the modal
 * and returns a promise that resolves when the modal closes.
 */
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
    // Same target already peeking → reuse its promise. Avoids a second editor
    // mount on the same doc (which hangs).
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
