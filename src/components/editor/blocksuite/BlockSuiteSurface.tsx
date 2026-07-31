import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import { BlockStdScope } from "@blocksuite/affine/std";
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
    const host = new BlockStdScope({
      store: doc.getStore(),
      extensions: getViewManager().get(mode),
    }).render();

    // RootViewExtension resolves scrolling/viewport against this ancestor class.
    const viewport = document.createElement("div");
    viewport.className = mode === "edgeless" ? "affine-edgeless-viewport" : "affine-page-viewport";
    viewport.style.height = "100%";
    // BlockSuite theme CSS resolves via [data-theme]; the viewport needs its own
    // for scoped variable resolution.
    viewport.dataset.theme = document.documentElement.dataset.theme ?? "light";
    if (mode === "edgeless") {
      // Edgeless needs a positioned, clipped inner container for hit-testing
      // and panning — the host must not be a direct child of the viewport.
      viewport.style.position = "relative";
      const inner = document.createElement("div");
      inner.style.position = "relative";
      inner.style.overflow = "clip";
      inner.style.height = "100%";
      inner.append(host);
      viewport.append(inner);
    } else {
      viewport.append(host);
    }
    container.append(viewport);

    // Activate the event dispatcher — it starts inactive and only activates on
    // pointerenter if no outside element holds focus (the title input often
    // does). Focusing the host ensures drag/click interactions work immediately.
    requestAnimationFrame(() => {
      host.focus();
    });

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
  }, [noteId, mode]);

  return <div ref={containerRef} className="h-full min-h-full flex-1" />;
};

export default BlockSuiteSurface;
