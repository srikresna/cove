import { Bound } from "@blocksuite/affine/global/gfx";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import type { TestAffineEditorContainer } from "@blocksuite/integration-test";
import { Check, Copy, Expand, Loader2, X } from "lucide-react";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { useNoteStore } from "../../../../store/useNoteStore";
import { blockSuiteEditorService } from "../../../../di/container";
import { Dialog, DialogContent, DialogTitle } from "../../../ui/dialog";
import { buildCommonExtensions } from "../BlockSuiteSurface";
import { usePeekViewStore } from "../../../../services/blocksuite/peekViewService";

/**
 * Globally-mounted modal that renders a frame/mindmap (or any @Peekable
 * surface-ref) in an edgeless editor — the Cove equivalent of AFFiNE's
 * doc-peek-view. Mirrors AFFiNE's pattern: reuse the already-loaded doc store,
 * defer the heavy editor mount until after the open animation, then fit the
 * viewport to the referenced frame. A generic loading skeleton (spinner +
 * "Loading" + description) is shown until the canvas paints — matching
 * AFFiNE's PageDetailLoading rather than a blank-white modal.
 */
export const PeekViewModal: React.FC = () => {
  const request = usePeekViewStore((s) => s.request);
  const close = usePeekViewStore((s) => s.close);
  const open = request !== null;
  const containerRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!request) return;
    setLoading(true);

    let disposed = false;
    let cleanup: (() => void) | null = null;
    let waitRaf = 0;
    let waitTries = 0;

    // The editor mount, extracted so it can run as soon as the container DOM
    // node is available. Radix mounts DialogContent in a portal asynchronously,
    // so containerRef.current may be null on the first effect run.
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

    // Wrap the heavy mount in try/catch so a thrown error surfaces instead of
    // silently aborting (which would leave the spinner forever).
    try {
    editor = document.createElement("affine-editor-container") as TestAffineEditorContainer;
    editor.doc = store;
    editor.edgelessSpecs = [
      ...blockSuiteEditorService.getViewManager().get("edgeless"),
      ...buildCommonExtensions("edgeless"),
    ];
    editor.mode = "edgeless";
    editor.autofocus = false;
    // Pin the host to the wrapper so the height:100% chain resolves
    // (modal 85vh → wrapper inset-0 → host inset-0 → viewport 100%).
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
    const fit = (): boolean => {
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
    // updateComplete may reject if the Lit render throws; use finally so the
    // poll starts regardless. Once the viewport is ready, fit it, then poll
    // until the surface block's renderer has created its <canvas> with
    // non-zero dimensions (the canvas is created asynchronously by the
    // SurfaceBlockComponent — revealing before it exists shows a blank modal).
    // Safety-capped at ~6s.
    const poll = () => {
      if (disposed || revealed) return;
      raf = requestAnimationFrame(waitForCanvas);
    };
    const waitForCanvas = () => {
      if (disposed || revealed) return;
      if (fit() || ++tries > 600) {
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
        reveal(); // safety fallback (~6s)
        return;
      }
      raf = requestAnimationFrame(checkCanvas);
    };
    if (editor) void editor.updateComplete.finally(poll);
    safetyTimer = window.setTimeout(reveal, 6000);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[cove-peek] mount failed", err);
      setLoading(false);
    }

    return () => {
      disposed = true;
      clearTimeout(safetyTimer);
      cancelAnimationFrame(raf);
      editor?.remove();
    };
    }; // end mountEditor

    // Wait for the container DOM node (Radix portal may not have mounted it on
    // the first effect run), then mount. Caps at ~2s before giving up.
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
    // Switch the main editor for this note to edgeless mode, then close the
    // peek — mirroring AFFiNE's "open doc" peek control.
    void useNoteStore.getState().updateNote(request.docId, { docMode: "edgeless" });
    close();
  };

  const handleCopyLink = async () => {
    if (!request) return;
    try {
      await navigator.clipboard.writeText(request.docId);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // Clipboard may be unavailable; ignore silently.
    }
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
        {/*
          absolute inset-0 (not h-full) gives the editor a definite height.
          DialogContent's base class is display:grid, under which an h-full
          child resolves to 0 height. The dialog's fixed positioning establishes
          the containing block for this absolute child.
        */}
        <div ref={containerRef} className="absolute inset-0" />
        {loading && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-card">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
            <div className="text-sm font-medium text-muted-foreground">Loading</div>
            <div className="text-xs text-muted-foreground/70">Preparing peek view…</div>
          </div>
        )}
        {/* Peek controls — vertical cluster top-right, mirroring AFFiNE's
            DocPeekViewControls (close / open / copy-link). Positioned INSIDE
            the modal box (DialogContent is overflow-hidden, so an outside
            -right offset would be clipped and invisible). */}
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
