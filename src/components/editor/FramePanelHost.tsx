import { FramePanel } from "@blocksuite/affine/fragments/frame-panel";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";

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
