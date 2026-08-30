import { Bound } from "@blocksuite/affine/global/gfx";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import { Check, Copy, Expand, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { blockSuiteEditorService, noteService } from "../../../../di/container";
import { useNotes } from "../../../../hooks/useNotes";
import type { DocPeekRequest } from "../../../../services/blocksuite/peekViewService";
import { packBlockSuiteContent } from "../../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../../services/editor/yjsCodec";
import { Logger } from "../../../../services/Logger";
import { noteActions } from "../../../../store/noteActions";
import { useNoteUiStore } from "../../../../store/useNoteUiStore";
import { useNotificationStore } from "../../../../store/useNotificationStore";
import { usePeekViewStore } from "../../../../store/usePeekViewStore";
import { useWorkspaceStore } from "../../../../store/useWorkspaceStore";
import { buildCommonExtensions } from "../BlockSuiteSurface";
import { createEditorContainer, type TestAffineEditorContainer } from "../editorContainer";
import { toReactNode } from "./LitTemplate";
import { PeekDocView } from "./PeekDocView";
import { PeekModalFrame } from "./PeekModalFrame";

const SAVE_DEBOUNCE_MS = 800;
const PEEK_CANVAS_MAX_TRIES = 600;
const PEEK_REVEAL_TIMEOUT_MS = 6000;
const PEEK_CONTAINER_MAX_TRIES = 120;
const COPIED_RESET_MS = 1500;
const PEEK_VIEWPORT_PADDING: [number, number, number, number] = [60, 20, 20, 20];

interface EdgelessPeekCallbacks {
  onRevealed: () => void;
  onFailed: () => void;
}

function mountEdgelessPeek(
  container: HTMLDivElement,
  docRequest: DocPeekRequest,
  callbacks: EdgelessPeekCallbacks,
): () => void {
  const store = blockSuiteEditorService.getDocStoreForPeek(docRequest.docId);
  if (!store) {
    const empty = document.createElement("div");
    empty.style.cssText = "padding:2rem;color:hsl(var(--muted-foreground));font-size:.875rem";
    empty.textContent = "Referenced note is not loaded in this session.";
    container.replaceChildren(empty);
    callbacks.onRevealed();
    return () => undefined;
  }

  let disposed = false;
  let editor: TestAffineEditorContainer | null = null;
  let raf = 0;
  let safetyTimer = 0;
  let fitTries = 0;
  let canvasTries = 0;
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
      void noteActions.updateNote(docRequest.docId, { content: snapshot }).then(
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
      callbacks.onRevealed();
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
            PEEK_VIEWPORT_PADDING,
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
      if (fitViewport() || ++fitTries > PEEK_CANVAS_MAX_TRIES) {
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
      if (++canvasTries > PEEK_CANVAS_MAX_TRIES) {
        reveal();
        return;
      }
      raf = requestAnimationFrame(checkCanvas);
    };
    void editor.updateComplete.finally(poll).catch(() => {
      if (!disposed && !revealed) reveal();
    });
    safetyTimer = window.setTimeout(reveal, PEEK_REVEAL_TIMEOUT_MS);
  } catch (err) {
    Logger.error("[cove-peek] mount failed", err);
    callbacks.onFailed();
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
}

async function openPeekDoc(docId: string): Promise<boolean> {
  try {
    const n = await noteService.getNote(docId);
    blockSuiteEditorService.openNoteDoc(docId, n?.content ?? "");
    return true;
  } catch {
    return false;
  }
}

async function waitForNoteRecord(docId: string): Promise<boolean | null> {
  const hasRecord = () => noteActions.currentNotes().some((n) => n.id === docId);
  if (hasRecord()) return true;
  const wsId = useWorkspaceStore.getState().activeWorkspaceId;
  if (!wsId) return null;
  for (let i = 0; i < 20 && !hasRecord(); i++) {
    await new Promise((r) => setTimeout(r, 100));
    if (i > 0 && i % 5 === 0) {
      await noteActions.refreshNotesInPlace(wsId);
    }
  }
  return hasRecord();
}

export const PeekViewModal: React.FC = () => {
  const request = usePeekViewStore((s) => s.request);
  const close = usePeekViewStore((s) => s.close);
  const open = request !== null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  const notes = useNotes();
  const note = request?.type === "doc" ? notes.find((n) => n.id === request.docId) : undefined;
  const peekMode = request?.type === "doc" ? (request.mode ?? note?.docMode ?? "page") : null;
  const isEdgelessPeek = request?.type === "doc" && peekMode === "edgeless";

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        const peekContent = document.querySelector(".peek-modal-content");
        if (peekContent?.querySelector('[data-state="open"]')) return;
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

    const callbacks: EdgelessPeekCallbacks = {
      onRevealed: () => setLoading(false),
      onFailed: () => {
        setError(true);
        setLoading(false);
      },
    };

    const waitForContainer = () => {
      if (disposed) return;
      const container = containerRef.current;
      const current = request;
      if (container && current?.type === "doc") {
        cleanup = mountEdgelessPeek(container, current, callbacks);
        return;
      }
      if (++waitTries > PEEK_CONTAINER_MAX_TRIES) {
        callbacks.onFailed();
        return;
      }
      waitRaf = requestAnimationFrame(waitForContainer);
    };

    const docRequest = request?.type === "doc" ? request : null;
    if (!docRequest) return;
    void openPeekDoc(docRequest.docId).then((ok) => {
      if (disposed) return;
      if (!ok) {
        callbacks.onFailed();
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

    const ready = await waitForNoteRecord(docId);
    if (ready === false) {
      useNotificationStore.getState().pushToast({
        kind: "warning",
        title: "Still registering this note",
        description: "Try again in a moment.",
      });
      return;
    }

    useNoteUiStore.getState().setActiveNoteId(docId);
    close();
  };

  const handleDocUnavailable = useCallback(() => setError(true), []);
  const handleDocReady = useCallback(() => setLoading(false), []);

  const handleCopyLink = async () => {
    if (request?.type !== "doc") return;
    try {
      await navigator.clipboard.writeText(request.docId);
      setCopied(true);
      setTimeout(() => setCopied(false), COPIED_RESET_MS);
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
        <div className="relative h-full w-full">{toReactNode(request.template)}</div>
      ) : peekMode === "page" && request?.type === "doc" ? (
        <PeekDocView
          key={request.docId}
          request={request}
          note={note}
          onUnavailable={handleDocUnavailable}
          onReady={handleDocReady}
        />
      ) : (
        <div className="relative h-full w-full" ref={containerRef} />
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
