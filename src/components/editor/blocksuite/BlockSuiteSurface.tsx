import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import { RefNodeSlotsProvider } from "@blocksuite/affine/inlines/reference";
import {
  type DocModeProvider,
  DocModeProvider as DocModeProviderToken,
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
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import type { Note } from "../../../types";
import { getViewManager, openNoteDoc } from "./engine";

const SAVE_DEBOUNCE_MS = 800;

interface BlockSuiteSurfaceProps {
  note: Note;
  mode: CoveDocMode;
}

/** Minimal Subject-like — avoids importing rxjs (not hoisted to top-level node_modules). */
class SimpleSubject<T> {
  private subs: Array<(value: T) => void> = [];
  subscribe(fn: (value: T) => void) {
    this.subs.push(fn);
    return { unsubscribe: () => { this.subs = this.subs.filter((s) => s !== fn); } };
  }
  next(value: T) { this.subs.forEach((fn) => fn(value)); }
  complete() { this.subs = []; }
}

const modeSubjects = new Map<string, SimpleSubject<DocMode>>();
function getModeSubject(docId: string): SimpleSubject<DocMode> {
  let s = modeSubjects.get(docId);
  if (!s) { s = new SimpleSubject<DocMode>(); modeSubjects.set(docId, s); }
  return s;
}

/**
 * ONLY DocModeProvider — FontConfig + EditorSetting removed to isolate the
 * typing-break issue. DocModeProvider provides widget.mode = 'page' which the
 * drag handle's _canEditing check requires.
 */
function buildCommonExtensions(): ExtensionType[] {
  const docModeService: DocModeProvider = {
    // Primary mode (doc-level default)
    getPrimaryMode: () => "page" as DocMode,
    setPrimaryMode: (docId: string, mode: DocMode) => getModeSubject(docId).next(mode),
    getPrimaryMode$: () => signal("page" as DocMode),
    onPrimaryModeChange: (docId: string) => getModeSubject(docId),
    // Editor mode (what the editor currently shows — used by drag handle, toolbar, blocks)
    getEditorMode: () => "page" as DocMode,
    setEditorMode: (_mode: DocMode) => {},
    getEditorMode$: () => signal("page" as DocMode),
    onEditorModeChange: () => new SimpleSubject<DocMode>(),
  };

  return [
    {
      name: "cove-doc-mode",
      setup: (di: { override: (token: unknown, value: unknown) => void }) => {
        di.override(DocModeProviderToken, () => docModeService);
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

    // Navigate to a linked note when the user clicks a @-mention reference.
    // BlockSuite fires docLinkClicked via RefNodeSlotsProvider.
    const refSlots = editor.std?.get?.(RefNodeSlotsProvider);
    const navSub = refSlots?.docLinkClicked?.subscribe?.(({ pageId: targetId }: { pageId: string }) => {
      // Find which workspace the target note belongs to and navigate there.
      const noteStore = useNoteStore.getState();
      const wsStore = useWorkspaceStore.getState();
      // Check if the note is in the current note list; if not, find its workspace.
      const allNotes = noteStore.notes;
      const targetNote = allNotes.find((n) => n.id === targetId);
      if (targetNote && targetNote.workspaceId !== wsStore.activeWorkspaceId) {
        wsStore.setActiveWorkspace(targetNote.workspaceId);
      }
      noteStore.setActiveNoteId(targetId);
    });

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
      navSub?.unsubscribe?.();
      if (timer) clearTimeout(timer);
      if (pending) flush();
      editor.remove();
    };
  }, [noteId, mode]);

  return <div ref={containerRef} className="h-full min-h-full flex-1" />;
};

export default BlockSuiteSurface;
