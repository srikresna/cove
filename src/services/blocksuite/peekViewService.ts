import type { PeekOptions, PeekViewService } from "@blocksuite/affine/components/peek";
import type { TemplateResult } from "lit";

export interface DocPeekRequest {
  type: "doc";
  docId: string;

  mode?: "edgeless" | "page";

  xywh?: string;
  blockIds?: string[];
  elementIds?: string[];

  databaseId?: string;
  databaseDocId?: string;
  databaseRowId?: string;
}

interface TemplatePeekRequest {
  type: "template";
  template: TemplateResult;
}

export type PeekRequest = DocPeekRequest | TemplatePeekRequest;

interface PeekSink {
  open(request: PeekRequest, resolve: () => void): void;
  close(): void;
}

let peekSink: PeekSink = {
  open: (_request, resolve) => resolve(),
  close: () => {},
};

export function providePeekSink(sink: PeekSink): void {
  peekSink = sink;
}

function resolvePeekTarget(args: {
  target?: HTMLElement;
  docId?: string;
  blockIds?: string[];
  elementIds?: string[];
  databaseId?: string;
  databaseDocId?: string;
  databaseRowId?: string;
}): DocPeekRequest | null {
  const { target, docId, blockIds, elementIds, databaseId, databaseDocId, databaseRowId } = args;

  if (target && "model" in target) {
    // biome-ignore lint/suspicious/noExplicitAny: BlockSuite duck-typing
    const model = (target as any).model;
    if (model?.flavour === "affine:surface-ref") {
      // biome-ignore lint/suspicious/noExplicitAny: BlockSuite duck-typing
      const ref = (target as any).referenceModel;
      const refDocId = ref && "store" in ref ? ref.store.id : ref?.surface?.store?.id;
      if (refDocId && ref?.xywh) {
        return { type: "doc", docId: refDocId, mode: "edgeless", xywh: ref.xywh };
      }
    }
  }

  if (docId) {
    return { type: "doc", docId, blockIds, elementIds, databaseId, databaseDocId, databaseRowId };
  }
  return null;
}

type PeekArg = {
  target?: HTMLElement;
  template?: TemplateResult;
  docId?: string;
  blockIds?: string[];
  elementIds?: string[];
  databaseId?: string;
  databaseDocId?: string;
  databaseRowId?: string;
};

let templateSeq = 0;

function peekKey(req: PeekRequest): string {
  if (req.type === "template") return `template:${++templateSeq}`;
  return `doc:${req.docId}:${req.mode ?? ""}:${req.xywh ?? ""}:${(req.blockIds ?? []).join(",")}:${(req.elementIds ?? []).join(",")}:${req.databaseId ?? ""}:${req.databaseDocId ?? ""}:${req.databaseRowId ?? ""}`;
}

let inflight: { key: string; promise: Promise<void> } | null = null;

export function dismissAllPeeks(): void {
  inflight = null;
  peekSink.close();
}

export const covePeekViewService: PeekViewService = {
  peek: ((arg: PeekArg, _options?: PeekOptions): Promise<void> => {
    void _options;
    let request: PeekRequest | null = null;

    if (arg.template) {
      request = { type: "template", template: arg.template };
    } else {
      request = resolvePeekTarget({
        target: arg.target,
        docId: arg.docId,
        blockIds: arg.blockIds,
        elementIds: arg.elementIds,
        databaseId: arg.databaseId,
        databaseDocId: arg.databaseDocId,
        databaseRowId: arg.databaseRowId,
      });
    }
    if (!request) return Promise.resolve();
    const key = peekKey(request);

    if (inflight && inflight.key === key) {
      return inflight.promise;
    }
    const promise = new Promise<void>((resolve) => {
      peekSink.open(request, resolve);
    });
    inflight = { key, promise };
    promise.finally(() => {
      if (inflight?.promise === promise) inflight = null;
    });
    return promise;
  }) as PeekViewService["peek"],
};
