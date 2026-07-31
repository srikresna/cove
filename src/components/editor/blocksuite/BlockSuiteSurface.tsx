import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import {
  CommunityCanvasTextFonts,
  DocModeProvider,
  EditorSettingExtension,
  FeatureFlagService,
  FontConfigExtension,
} from "@blocksuite/affine/shared/services";
import type { ExtensionType } from "@blocksuite/affine/store";
import type { DocMode } from "@blocksuite/affine/model";
import type React from "react";
import { useEffect, useRef } from "react";
import { signal } from "@preact/signals-core";
import type { DocMode as CoveDocMode } from "../../../domain/note/Note";
import { packBlockSuiteContent } from "../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import type { Note } from "../../../types";
import { getViewManager, openNoteDoc } from "./engine";

const SAVE_DEBOUNCE_MS = 800;

interface BlockSuiteSurfaceProps {
  note: Note;
  mode: CoveDocMode;
}

/**
 * Builds the common service extensions the editor needs (same pattern as the
 * AFFiNE playground's getTestCommonExtensions). Without these, the drag handle,
 * doc-mode switching, and font rendering don't work.
 */
function buildCommonExtensions(mode: DocMode): ExtensionType[] {
  const modeSignal = signal<DocMode>(mode);
  return [
    FontConfigExtension(CommunityCanvasTextFonts),
    EditorSettingExtension({ setting$: signal({}) }),
    {
      name: "cove-doc-mode",
      setup: (di: { override: (token: unknown, factory: () => unknown) => void }) => {
        di.override(DocModeProvider, () => ({
          getPrimaryMode$: () => modeSignal,
          getPrimaryMode: () => modeSignal.value,
          setPrimaryMode: (_docId: string, m: DocMode) => {
            modeSignal.value = m;
          },
          onPrimaryModeChange: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
        }));
      },
    },
  ];
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
    const store = doc.getStore();

    // Enable advanced block visibility (drag handle, add-block button, etc.)
    // Without this flag, the drag handle widget stays hidden.
    try {
      store.get(FeatureFlagService).setFlag("enable_advanced_block_visibility", true);
    } catch {
      // FeatureFlagService might not be registered yet.
    }

    // Build the editor with common service extensions (same as the playground).
    const commonExtensions = buildCommonExtensions(mode as DocMode);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = document.createElement("affine-editor-container") as any;
    editor.doc = store;
    editor.pageSpecs = [...getViewManager().get("page"), ...commonExtensions];
    editor.edgelessSpecs = [...getViewManager().get("edgeless"), ...commonExtensions];
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
