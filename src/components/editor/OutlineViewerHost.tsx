import { OutlineViewer } from "@blocksuite/affine/fragments/outline";
import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useRef } from "react";

export const OutlineViewerHost: React.FC<{ editor: EditorHost | null }> = ({ editor }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container || !editor) return;
    const viewer = new OutlineViewer() as OutlineViewer & HTMLElement;
    viewer.editor = editor;
    viewer.toggleOutlinePanel = null;
    container.append(viewer);
    return () => {
      viewer.remove();
    };
  }, [editor]);

  return (
    <div
      ref={containerRef}
      className="cove-outline-viewer-host absolute right-2 top-1/2 z-10 -translate-y-1/2"
    />
  );
};
