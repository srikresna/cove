import { OutlinePanel } from "@blocksuite/affine/fragments/outline";
import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useRef } from "react";

/**
 * Mounts BlockSuite's native {@link OutlinePanel} (the same component AFFiNE's
 * sidebar uses) behind a React ref. It renders its own header — "Table of
 * Contents" + a Settings icon ("Preview Settings" → show type icon) and a Sort
 * icon ("Visibility and sort") — and computes the heading outline live from the
 * editor's store. Re-mounts when the editor host changes (note/mode switch).
 *
 * The affine-outline-* custom elements are registered automatically by
 * OutlineViewExtension when the editor's view extensions build — no manual
 * effects() call needed (doing so double-registers and throws).
 */
export const OutlinePanelHost: React.FC<{ editor: EditorHost | null }> = ({ editor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor) return;
    const panel = new OutlinePanel();
    panel.editor = editor;
    panel.fitPadding = [20, 20, 20, 20];
    container.append(panel);
    return () => {
      panel.remove();
    };
  }, [editor]);

  return <div ref={containerRef} className="cove-outline-host" />;
};

export default OutlinePanelHost;
