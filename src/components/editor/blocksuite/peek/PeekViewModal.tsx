import { Bound } from "@blocksuite/affine/global/gfx";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import { Check, Copy, Expand, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { blockSuiteEditorService, noteService } from "../../../../di/container";
import type { DocPeekRequest } from "../../../../services/blocksuite/peekViewService";
import { usePeekViewStore } from "../../../../services/blocksuite/peekViewService";
import { packBlockSuiteContent } from "../../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../../store/useNoteStore";
import { useNotificationStore } from "../../../../store/useNotificationStore";
import { useWorkspaceStore } from "../../../../store/useWorkspaceStore";
import { buildCommonExtensions } from "../BlockSuiteSurface";
import { createEditorContainer, type TestAffineEditorContainer } from "../editorContainer";
import { toReactNode } from "./LitTemplate";
import { PeekDocView } from "./PeekDocView";
import { PeekModalFrame } from "./PeekModalFrame";

const SAVE_DEBOUNCE_MS = 800;

export const PeekViewModal: React.FC = () => {
  const request = usePeekViewStore((s) => s.request);
  const close = usePeekViewStore((s) => s.close);
  const open = request !== null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const note = useNoteStore((s) =>
    request?.type === "doc" ? s.notes.find((n) => n.id === request.docId) : undefined,
  );
  const peekMode = request?.type === "doc" ? (request.mode ?? note?.docMode ?? "page") : null;
  const isEdgelessPeek = request?.type === "doc" && peekMode === "edgeless";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.stopPropagation();
        close();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => {
    if (!open) return;

    setLoading(Boolean(isEdgelessPeek));
    setError(false);
    if (!isEdgelessPeek) return;

    let disposed = false;
    let cleanup: (() => void) | null = null;
    let waitRaf = 0;
    let waitTries = 0;

    const mountEditor = (container: HTMLDivElement, docRequest: DocPeekRequest): (() => void) => {
      const store = blockSuiteEditorService.getDocStoreForPeek(docRequest.docId);
      if (!store) {
        const empty = document.createElement("div");
        empty.style.cssText = "padding:2rem;color:hsl(var(--muted-foreground));font-size:.875rem";
        empty.textContent = "Referenced note is not loaded in this session.";
        container.replaceChildren(empty);
        setLoading(false);
        return () => undefined;
      }

      let editor: TestAffineEditorContainer | null = null;
      let raf = 0;
      let safetyTimer = 0;
      let tries = 0;
      let revealed = false;
      let saveTimer: ReturnType<typeof setTimeout> | null = null;
      let savePending = false;
      let lastSavedSnapshot: string | null = null;
      let unregisterFlusher: (() => void) | null = null;
      let finalFlush: () => void = () => {};
      let detachSaveListener: () => void = () => {};

      try {
        editor = createEditorContainer();
        editor.doc = store;
        const common = buildCommonExtensions("edgeless");
        editor.pageSpecs = [...blockSuiteEditorService.getViewSpecs("page"), ...common];
        editor.edgelessSpecs = [...blockSuiteEditorService.getViewSpecs("edgeless"), ...common];
        editor.mode = "edgeless";
        editor.autofocus = false;

        const encodeAndSave = () => {
          if (!blockSuiteEditorService.isWorkspaceAlive()) return;
          const snapshot = packBlockSuiteContent(encodeDocSnapshot(store.spaceDoc));
          if (snapshot === lastSavedSnapshot) return;
          void useNoteStore
            .getState()
            .updateNote(docRequest.docId, { content: snapshot })
            .then(
              () => {
                lastSavedSnapshot = snapshot;
              },
              () => {},
            );
        };
        const flush = () => {
          const doEncode = () => {
            savePending = false;
            encodeAndSave();
          };
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(doEncode, { timeout: 3000 });
          } else {
            setTimeout(doEncode, 0);
          }
        };
        const onUpdate = () => {
          savePending = true;
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = setTimeout(flush, SAVE_DEBOUNCE_MS);
        };
        store.spaceDoc.on("update", onUpdate);
        finalFlush = () => {
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
          }
          if (savePending) {
            savePending = false;
            encodeAndSave();
          }
        };
        detachSaveListener = () => {
          try {
            store.spaceDoc.off("update", onUpdate);
          } catch {}
        };
        unregisterFlusher = blockSuiteEditorService.registerPendingFlusher(finalFlush);

        editor.style.position = "absolute";
        editor.style.inset = "0";
        editor.style.opacity = "0";
        container.append(editor);

        const reveal = () => {
          if (disposed || revealed || !editor) return;
          revealed = true;
          editor.style.opacity = "1";
          setLoading(false);
        };

        let fitDone = false;
        const fitViewport = (): boolean => {
          if (!editor || fitDone) return fitDone;
          try {
            const gfx = editor.std?.get?.(GfxControllerIdentifier);
            const viewport = gfx?.viewport;
            if (!viewport) return false;
            viewport.onResize();
            if (docRequest.xywh) {
              viewport.setViewportByBound(
                Bound.deserialize(docRequest.xywh),
                [60, 20, 20, 20],
                false,
              );
            } else {
              gfx.fitToScreen({ smooth: false });
            }
            fitDone = true;
            return true;
          } catch {
            return false;
          }
        };

        const poll = () => {
          if (disposed || revealed) return;
          raf = requestAnimationFrame(waitForCanvas);
        };
        const waitForCanvas = () => {
          if (disposed || revealed) return;
          if (fitViewport() || ++tries > 600) {
            raf = requestAnimationFrame(checkCanvas);
            return;
          }
          raf = requestAnimationFrame(waitForCanvas);
        };
        const checkCanvas = () => {
          if (disposed || revealed || !editor) return;
          const canvas = editor.querySelector("canvas");
          if (canvas && canvas.width > 0 && canvas.height > 0) {
            reveal();
            return;
          }
          if (++tries > 600) {
            reveal();
            return;
          }
          raf = requestAnimationFrame(checkCanvas);
        };
        void editor.updateComplete.finally(poll);
        safetyTimer = window.setTimeout(reveal, 6000);
      } catch (err) {
        console.error("[cove-peek] mount failed", err);
        setError(true);
        setLoading(false);
      }

      return () => {
        disposed = true;
        clearTimeout(safetyTimer);
        cancelAnimationFrame(raf);
        finalFlush();
        detachSaveListener();
        unregisterFlusher?.();
        editor?.remove();
      };
    };

    const waitForContainer = () => {
      if (disposed) return;
      const container = containerRef.current;
      const current = request;
      if (container && current?.type === "doc") {
        cleanup = mountEditor(container, current);
        return;
      }
      if (++waitTries > 120) {
        setLoading(false);
        return;
      }
      waitRaf = requestAnimationFrame(waitForContainer);
    };

    let loadFailed = false;
    const docRequest = request?.type === "doc" ? request : null;
    if (!docRequest) return;
    noteService
      .getNote(docRequest.docId)
      .then((n) => {
        if (disposed) return;
        blockSuiteEditorService.openNoteDoc(docRequest.docId, n?.content ?? "");
      })
      .catch(() => {
        loadFailed = true;
      })
      .finally(() => {
        if (disposed) return;
        if (loadFailed) {
          setError(true);
          setLoading(false);
          return;
        }
        waitRaf = requestAnimationFrame(waitForContainer);
      });

    return () => {
      disposed = true;
      cancelAnimationFrame(waitRaf);
      cleanup?.();
    };
  }, [open, isEdgelessPeek, request]);

  const handleOpenInFull = async () => {
    if (request?.type !== "doc") return;
    const docId = request.docId;

    const hasRecord = () => useNoteStore.getState().notes.some((n) => n.id === docId);
    if (!hasRecord()) {
      const wsId = useWorkspaceStore.getState().activeWorkspaceId;
      if (!wsId) return;
      for (let i = 0; i < 20 && !hasRecord(); i++) {
        await new Promise((r) => setTimeout(r, 100));
        if (i > 0 && i % 5 === 0) {
          await useNoteStore.getState().refreshNotesInPlace(wsId);
        }
      }
      if (!hasRecord()) {
        useNotificationStore.getState().pushToast({
          kind: "warning",
          title: "Still registering this note",
          description: "Try again in a moment.",
        });
        return;
      }
    }

    useNoteStore.getState().setActiveNoteId(docId);
    close();
  };

  const handleDocUnavailable = useCallback(() => setError(true), []);
  const handleDocReady = useCallback(() => setLoading(false), []);

  const handleCopyLink = async () => {
    if (request?.type !== "doc") return;
    try {
      await navigator.clipboard.writeText(request.docId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  const isDocPeek = request?.type === "doc";

  return (
    <PeekModalFrame
      open={open}
      onClose={close}
      error={error}
      loading={loading && isDocPeek}
      loadingLabel="Preparing peek view…"
      controls={
        <>
          <ControlButton label="Close peek view" onClick={close}>
            <X className="h-4 w-4" aria-hidden="true" />
          </ControlButton>
          {isDocPeek && (
            <>
              <ControlButton label="Open in full" onClick={() => void handleOpenInFull()}>
                <Expand className="h-4 w-4" aria-hidden="true" />
              </ControlButton>
              <ControlButton label={copied ? "Link copied" : "Copy link"} onClick={handleCopyLink}>
                {copied ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Copy className="h-4 w-4" aria-hidden="true" />
                )}
              </ControlButton>
            </>
          )}
        </>
      }
    >
      {request?.type === "template" ? (
        <div className="relative h-full w-full" data-peek-content>
          {toReactNode(request.template)}
        </div>
      ) : peekMode === "page" && request?.type === "doc" ? (
        <PeekDocView
          key={request.docId}
          request={request}
          note={note}
          onUnavailable={handleDocUnavailable}
          onReady={handleDocReady}
        />
      ) : (
        <div className="relative h-full w-full" ref={containerRef} data-peek-content />
      )}
    </PeekModalFrame>
  );
};

const ControlButton: React.FC<{
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}> = ({ label, onClick, children }) => (
  <button
    type="button"
    onClick={onClick}
    aria-label={label}
    title={label}
    className="flex h-8 w-8 items-center justify-center rounded-lg bg-card text-muted-foreground shadow-sm ring-1 ring-border transition-colors hover:bg-accent hover:text-foreground"
  >
    {children}
  </button>
);

export default PeekViewModal;
