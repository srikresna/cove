import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import {
  CommunityCanvasTextFonts,
  type DocModeProvider,
  DocModeProvider as DocModeProviderToken,
  EditorSettingExtension,
  FontConfigExtension,
  GeneralSettingSchema,
} from "@blocksuite/affine/shared/services";
import type { ExtensionType } from "@blocksuite/affine/store";
import type { DocMode } from "@blocksuite/affine/model";
import type React from "react";
import { useEffect, useRef } from "react";
import { signal } from "@preact/signals-core";
import { Subject } from "rxjs";
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

// Per-doc RxJS subjects for DocModeProvider.onPrimaryModeChange.
const modeSubjects = new Map<string, Subject<DocMode>>();
function getModeSubject(docId: string): Subject<DocMode> {
  let s = modeSubjects.get(docId);
  if (!s) {
    s = new Subject<DocMode>();
    modeSubjects.set(docId, s);
  }
  return s;
}

/**
 * Builds common service extensions matching the AFFiNE playground setup.
 * DocModeProvider is CRITICAL: without it, `widget.mode` is undefined, and the
 * drag handle's `_canEditing` check always fails (mode !== 'page').
 */
function buildCommonExtensions(): ExtensionType[] {
  // DocModeProvider instance (NOT a factory — di.override expects the instance).
  const docModeService: DocModeProvider = {
    getPrimaryMode: () => "page" as DocMode,
    setPrimaryMode: (docId: string, mode: DocMode) => {
      getModeSubject(docId).next(mode);
    },
    getPrimaryMode$: () => signal("page" as DocMode),
    onPrimaryModeChange: (docId: string) => getModeSubject(docId),
  };

  return [
    FontConfigExtension(CommunityCanvasTextFonts),
    EditorSettingExtension({
      setting$: signal({ ...GeneralSettingSchema.default }),
    }),
    {
      name: "cove-services",
      setup: (di: { override: (token: unknown, value: unknown) => void }) => {
        di.override(DocModeProviderToken, docModeService);
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
    const common = buildCommonExtensions();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editor = document.createElement("affine-editor-container") as any;
    editor.doc = doc.getStore();
    editor.pageSpecs = [...getViewManager().get("page"), ...common];
    editor.edgelessSpecs = [...getViewManager().get("edgeless"), ...common];
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
