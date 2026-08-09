import { FramePanel } from "@blocksuite/affine/fragments/frame-panel";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";

/**
 * Mounts BlockSuite's native {@link FramePanel} (frame thumbnails + reorder).
 *
 * FramePanel's body/preview render thumbnails via the surface renderer
 * (`gfx.surfaceComponent.renderer`), which exists in BOTH page and edgeless
 * modes — so thumbnails show in page mode too. Its native presentation button
 * works in edgeless (gfx.tool is available). In page mode that button would
 * crash (`gfx.tool` is undefined), so we intercept its click at the capture
 * phase and route it through Cove's own page-mode presentation flow instead
 * (switch to edgeless + present via intent) — no Cove button, the native one is
 * the single trigger.
 */
export const FramePanelHost: React.FC<{
  editor: EditorHost | null;
  mode?: string;
  onStartPresentation?: () => void;
}> = ({ editor, mode, onStartPresentation }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hasRenderer, setHasRenderer] = useState(false);
  const [isEdgeless, setIsEdgeless] = useState(false);

  useEffect(() => {
    void mode;
    let gfx: unknown;
    try {
      gfx = editor?.std?.get?.(GfxControllerIdentifier);
    } catch {
      gfx = undefined;
    }
    // biome-ignore lint/suspicious/noExplicitAny: BlockSuite internal type
    setHasRenderer(Boolean((gfx as any)?.surfaceComponent));
    // biome-ignore lint/suspicious/noExplicitAny: BlockSuite internal type
    setIsEdgeless(Boolean((gfx as any)?.tool));
  }, [editor, mode]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor || !hasRenderer) return;
    const panel = new FramePanel() as FramePanel & HTMLElement;
    panel.host = editor;
    panel.fitPadding = [50, 380, 50, 50];
    container.append(panel);
    return () => {
      panel.remove();
    };
  }, [editor, hasRenderer]);

  // The native presentation button lives inside <affine-frame-panel-header>'s
  // SHADOW root, so an external capture listener can't reach it (clicks are
  // retargeted to the header host). In any mode where gfx.tool is NOT yet
  // available (page mode, or the edgeless transition window where the renderer
  // is mounted but the tool controller isn't), that button would crash
  // (`_gfx.tool.setTool`). Reach into the shadow root and intercept the click
  // there — a MutationObserver catches the button the instant it appears,
  // regardless of how slowly the header renders.
  useEffect(() => {
    const container = containerRef.current;
    if (!container || isEdgeless || !onStartPresentation) return;
    const onClick = (e: Event) => {
      e.stopImmediatePropagation();
      e.stopPropagation();
      e.preventDefault();
      onStartPresentation();
    };
    // biome-ignore lint/suspicious/noExplicitAny: BlockSuite internal type
    let button: any = null;
    const tryAttach = () => {
      // biome-ignore lint/suspicious/noExplicitAny: BlockSuite internal type
      const header = container.querySelector("affine-frame-panel-header") as any;
      const found = header?.shadowRoot?.querySelector(".presentation-button") ?? null;
      if (found && found !== button) {
        button?.removeEventListener("click", onClick, true);
        found.addEventListener("click", onClick, true);
        button = found;
      }
    };
    tryAttach();
    const observer = new MutationObserver(tryAttach);
    observer.observe(container, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      button?.removeEventListener("click", onClick, true);
    };
  }, [isEdgeless, onStartPresentation]);

  if (!hasRenderer) {
    return (
      <p className="px-2 py-6 text-center text-xs leading-relaxed text-muted-foreground">
        {MESSAGES.FRAME_PANEL_PAGE_HINT}
      </p>
    );
  }

  return <div ref={containerRef} className="cove-frame-host h-full" />;
};
