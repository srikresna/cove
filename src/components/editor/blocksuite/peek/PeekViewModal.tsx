import { Bound } from "@blocksuite/affine/global/gfx";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import type { TestAffineEditorContainer as _TEC } from "@blocksuite/integration-test";

type TestAffineEditorContainer = _TEC & HTMLElement & { updateComplete: Promise<boolean> };

import { AlertTriangle, Check, Copy, Expand, Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { blockSuiteEditorService } from "../../../../di/container";
import { usePeekViewStore } from "../../../../services/blocksuite/peekViewService";
import { useNoteStore } from "../../../../store/useNoteStore";
import { Dialog, DialogContent, DialogTitle } from "../../../ui/dialog";
import { buildCommonExtensions } from "../BlockSuiteSurface";

export const PeekViewModal: React.FC = () => {
  const request = usePeekViewStore((s) => s.request);
  const close = usePeekViewStore((s) => s.close);
  const open = request !== null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!request) return;
    setLoading(true);
    setError(false);

    let disposed = false;
    let cleanup: (() => void) | null = null;
    let waitRaf = 0;
    let waitTries = 0;

    const mountEditor = (container: HTMLDivElement): (() => void) => {
      const store = blockSuiteEditorService.getDocStoreForPeek(request.docId);
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

      try {
        editor = document.createElement("affine-editor-container") as TestAffineEditorContainer;
        editor.doc = store;
        editor.edgelessSpecs = [
          ...blockSuiteEditorService.getViewSpecs("edgeless"),
          ...buildCommonExtensions("edgeless"),
        ];
        editor.mode = "edgeless";
        editor.autofocus = false;

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
            if (request.xywh) {
              viewport.setViewportByBound(Bound.deserialize(request.xywh), [60, 20, 20, 20], false);
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
        if (editor) void editor.updateComplete.finally(poll);
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
        editor?.remove();
      };
    };

    const waitForContainer = () => {
      if (disposed) return;
      const container = containerRef.current;
      if (container) {
        cleanup = mountEditor(container);
        return;
      }
      if (++waitTries > 120) {
        setLoading(false);
        return;
      }
      waitRaf = requestAnimationFrame(waitForContainer);
    };
    waitRaf = requestAnimationFrame(waitForContainer);

    return () => {
      disposed = true;
      cancelAnimationFrame(waitRaf);
      cleanup?.();
    };
  }, [request]);

  const handleOpenInFull = () => {
    if (!request) return;

    const ns = useNoteStore.getState();
    ns.setActiveNoteId(request.docId);
    void ns.updateNote(request.docId, { docMode: "edgeless" });
    close();
  };

  const handleCopyLink = async () => {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(request.docId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        if (!next) close();
      }}
    >
      <DialogContent
        className="h-[85vh] w-[90vw] max-w-[1400px] gap-0 overflow-hidden p-0"
        hideClose
      >
        <DialogTitle className="sr-only">Peek view</DialogTitle>
        {}
        <div ref={containerRef} className="absolute inset-0" />
        {error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card p-8 text-center">
            <AlertTriangle className="h-8 w-8 text-muted-foreground" aria-hidden="true" />
            <div className="text-sm font-medium text-muted-foreground">
              Could not open this frame
            </div>
            <div className="text-xs text-muted-foreground/70">
              The editor hit an unexpected error. Try reopening the note.
            </div>
            <button
              type="button"
              onClick={close}
              className="mt-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Close
            </button>
          </div>
        )}
        {loading && !error && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            <div className="text-sm font-medium text-muted-foreground">Loading</div>
            <div className="text-xs text-muted-foreground/70">Preparing peek view…</div>
          </div>
        )}
        {}
        <div className="absolute right-3 top-3 z-30 flex flex-col gap-1.5">
          <ControlButton label="Close peek view" onClick={close}>
            <X className="h-4 w-4" aria-hidden="true" />
          </ControlButton>
          <ControlButton label="Open in full" onClick={handleOpenInFull}>
            <Expand className="h-4 w-4" aria-hidden="true" />
          </ControlButton>
          <ControlButton label={copied ? "Link copied" : "Copy link"} onClick={handleCopyLink}>
            {copied ? (
              <Check className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4" aria-hidden="true" />
            )}
          </ControlButton>
        </div>
      </DialogContent>
    </Dialog>
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
