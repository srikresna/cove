import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import { BlockStdScope } from "@blocksuite/affine/std";
import type React from "react";
import { useEffect, useRef } from "react";
import { packBlockSuiteContent } from "../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import type { Note } from "../../../types";
import { getViewManager, openNoteDoc } from "./engine";

const SAVE_DEBOUNCE_MS = 800;

export const BlockSuiteSurface: React.FC<{ note: Note }> = ({ note }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteId = note.id;
  const initialContent = useRef(note.content);
  initialContent.current = note.content;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const doc = openNoteDoc(noteId, initialContent.current);
    const host = new BlockStdScope({
      store: doc.getStore(),
      extensions: getViewManager().get("page"),
    }).render();

    // RootViewExtension resolves scrolling against this ancestor class.
    const viewport = document.createElement("div");
    viewport.className = "affine-page-viewport";
    viewport.style.height = "100%";
    viewport.append(host);
    container.append(viewport);

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
      viewport.remove();
    };
  }, [noteId]);

  return <div ref={containerRef} className="min-h-full flex-1" />;
};

export default BlockSuiteSurface;
