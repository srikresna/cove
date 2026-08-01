import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import type React from "react";
import { useEffect, useRef } from "react";
import type { DocMode } from "../../../domain/note/Note";
import { packBlockSuiteContent } from "../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import type { Note } from "../../../types";
import { getViewManager, openNoteDoc } from "./engine";

const SAVE_DEBOUNCE_MS = 800;

interface BlockSuiteSurfaceProps {
  note: Note;
  mode: DocMode;
}

export const BlockSuiteSurface: React.FC<BlockSuiteSurfaceProps> = ({ note, mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteId = note.id;
  const initialContent = useRef(note.content);
  initialContent.current = note.content;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const doc = openNoteDoc(noteId, initialContent.current);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = document.createElement("affine-editor-container") as any;
    editor.doc = doc.getStore();
    editor.pageSpecs = [...getViewManager().get("page")];
    editor.edgelessSpecs = [...getViewManager().get("edgeless")];
    editor.mode = mode;
    editor.autofocus = true;
    container.append(editor);

    // DIAGNOSTIC: check drag handle widget + inner container + pointer events.
    requestAnimationFrame(() => {
      const handle = editor.querySelector("affine-drag-handle-widget");
      const pageRoot = editor.querySelector("affine-page-root");
      // Check inner container (the actual visible handle, display:none until pointermove)
      const innerDivs = handle?.querySelectorAll?.("div");
      const innerInfo = innerDivs?.[0]
        ? {
            display: getComputedStyle(innerDivs[0] as Element).display,
            width: getComputedStyle(innerDivs[0] as Element).width,
            height: getComputedStyle(innerDivs[0] as Element).height,
          }
        : "no inner divs";
      // biome-ignore lint/suspicious/noConsole: diagnostic
      console.log("[drag-handle-diag]", {
        handleExists: !!handle,
        pageRootExists: !!pageRoot,
        innerContainer: innerInfo,
        rect: handle?.getBoundingClientRect?.(),
      });
    });

    // DIAGNOSTIC: verify pointer events reach the editor area
    const onPointerMove = (e: PointerEvent) => {
      // biome-ignore lint/suspicious/noConsole: diagnostic
      console.log("[pointer-diag] pointermove reached container at", e.clientX, e.clientY);
      container.removeEventListener("pointermove", onPointerMove);
    };
    container.addEventListener("pointermove", onPointerMove);

    // Debounced save on doc update.
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;
    const flush = () => {
      pending = false;
      void useNoteStore
        .getState()
        .updateNote(noteId, { content: packBlockSuiteContent(encodeDocSnapshot(doc.spaceDoc)) });
    };
    const onUpdate = () => {
      pending = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, SAVE_DEBOUNCE_MS);
    };
    doc.spaceDoc.on("update", onUpdate);

    return () => {
      doc.spaceDoc.off("update", onUpdate);
      container.removeEventListener("pointermove", onPointerMove);
      if (timer) clearTimeout(timer);
      if (pending) flush();
      editor.remove();
    };
  }, [noteId, mode]);

  return <div ref={containerRef} className="h-full min-h-full flex-1" />;
};

export default BlockSuiteSurface;
