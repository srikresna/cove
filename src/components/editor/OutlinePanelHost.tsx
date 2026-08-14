import { OutlinePanel } from "@blocksuite/affine/fragments/outline";
import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useRef } from "react";

export const OutlinePanelHost: React.FC<{ editor: EditorHost | null }> = ({ editor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor) return;
    const panel = new OutlinePanel() as OutlinePanel & HTMLElement;
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
