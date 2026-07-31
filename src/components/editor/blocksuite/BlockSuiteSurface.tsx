import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import { ThemeProvider } from "@blocksuite/affine/shared/services";
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

/**
 * Mounts the BlockSuite editor, mirroring the structure of the AFFiNE playground's
 * TestAffineEditorContainer exactly:
 *
 *   <div class="affine-page-viewport" data-theme="...">
 *     <div class="page-editor playground-page-editor-container">
 *       host (BlockStdScope.render())
 *     </div>
 *   </div>
 *
 * The 3-layer structure + CSS container-queries + data-theme from ThemeProvider
 * are load-bearing for widgets (drag handle, slash menu, edgeless interaction).
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
    const scope = new BlockStdScope({
      store: doc.getStore(),
      extensions: getViewManager().get(mode),
    });
    const host = scope.render();

    // Read theme from BlockSuite's ThemeProvider (NOT Cove's dark mode — BlockSuite
    // has its own theme service that feeds [data-theme]).
    let theme = "light";
    try {
      const themeService = scope.get(ThemeProvider);
      theme = mode === "page" ? themeService.app$.value : themeService.edgeless$.value;
    } catch {
      // ThemeProvider might not be available immediately.
    }

    // --- Match TestAffineEditorContainer.render() structure exactly ---
    const viewport = document.createElement("div");
    viewport.className = mode === "edgeless" ? "affine-edgeless-viewport" : "affine-page-viewport";
    viewport.dataset.theme = theme;

    // Inner editor container — the class name is load-bearing for widget CSS.
    const inner = document.createElement("div");
    inner.className =
      mode === "edgeless"
        ? "edgeless-editor-container"
        : "page-editor playground-page-editor-container";
    inner.append(host);
    viewport.append(inner);
    container.append(viewport);

    // Focus the editor for interaction (the event dispatcher starts inactive).
    requestAnimationFrame(() => {
      host.focus();
    });

    // --- Debounced save on doc update ---
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
