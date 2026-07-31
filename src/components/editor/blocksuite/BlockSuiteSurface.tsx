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

/**
 * Mounts the BlockSuite editor using the `affine-editor-container` web component
 * — the exact same element the AFFiNE playground uses. The container handles
 * viewport CSS (container queries for drag handle), data-theme from ThemeProvider,
 * the 3-layer DOM structure (viewport → inner container → host), mode switching,
 * and the full Lit lifecycle. This replaces the previous manual BlockStdScope +
 * imperative DOM approach which was missing critical setup.
 */
export const BlockSuiteSurface: React.FC<BlockSuiteSurfaceProps> = ({ note, mode }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteId = note.id;
  const initialContent = useRef(note.content);
  initialContent.current = note.content;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const doc = openNoteDoc(noteId, initialContent.current);

    // Create the editor container — registered globally by engine.ts.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = document.createElement("affine-editor-container") as any;
    editor.doc = doc.getStore();
    editor.pageSpecs = [...getViewManager().get("page")];
    editor.edgelessSpecs = [...getViewManager().get("edgeless")];
    editor.mode = mode;
    editor.autofocus = true;
    container.append(editor);

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
      if (timer) clearTimeout(timer);
      if (pending) flush();
      editor.remove();
    };
  }, [noteId, mode]);

  return <div ref={containerRef} className="h-full min-h-full flex-1" />;
};

export default BlockSuiteSurface;
