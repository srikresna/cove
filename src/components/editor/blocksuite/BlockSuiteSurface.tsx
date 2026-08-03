import "@toeverything/theme/style.css";
import "@toeverything/theme/fonts.css";
import { RefNodeSlotsProvider } from "@blocksuite/affine/inlines/reference";
import type { DocMode } from "@blocksuite/affine/model";
import {
  DocModeExtension,
  type DocModeProvider,
  type EditorSetting,
  EditorSettingExtension,
  type EditorSettingService,
  GeneralSettingSchema,
} from "@blocksuite/affine/shared/services";
import { GfxControllerIdentifier } from "@blocksuite/affine/std/gfx";
import type { ExtensionType } from "@blocksuite/affine/store";
import type { DeepPartial } from "@blocksuite/global/utils";
import type { TestAffineEditorContainer } from "@blocksuite/integration-test";
import { signal } from "@preact/signals-core";
import type React from "react";
import { useEffect, useRef } from "react";
import type { DocMode as CoveDocMode } from "../../../domain/note/Note";
import { packBlockSuiteContent } from "../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import { blockSuiteEditorService } from "../../../di/container";
import { registerEdgelessTemplates } from "../../../services/blocksuite/edgelessTemplates";
import type { Note } from "../../../types";

const SAVE_DEBOUNCE_MS = 800;

interface BlockSuiteSurfaceProps {
  note: Note;
  mode: CoveDocMode;
}

/**
 * Default editor settings — mirrors the playground's mockEditorSetting: parse
 * each GeneralSettingSchema field with undefined so zod applies its .default().
 * Required because the drag-handle PreviewHelper (std.get(EditorSettingProvider))
 * and edgeless rendering read this provider; without it the drag preview throws
 * ServiceNotFoundError mid-drag (blocks never land) and the peek edgeless canvas
 * renders blank.
 */
const defaultEditorSetting = Object.fromEntries(
  Object.entries(GeneralSettingSchema.shape).map(([key, schema]) => [
    key,
    (schema as { parse: (value: unknown) => unknown }).parse(undefined),
  ]),
) as DeepPartial<EditorSetting>;

/**
 * Shared extensions mounted on every editor (the main surface and the peek-view
 * modal). DocModeProvider is the critical one for edgeless: getEditorMode() MUST
 * reflect the real mode — the edgeless selection toolbar bails when it returns
 * 'page' (toolbar.ts:516), and dozens of edgeless paths key off
 * getEditorMode() === 'edgeless'. Hardcoding 'page' corrupts all of edgeless.
 * EditorSettingExtension supplies the provider the drag-preview PreviewHelper and
 * edgeless rendering depend on. Exported so PeekViewModal reuses the same wiring.
 */
export function buildCommonExtensions(mode: DocMode): ExtensionType[] {
  let editorMode = mode;
  let primaryMode = mode;

  const docModeService: DocModeProvider = {
    getPrimaryMode: () => primaryMode,
    setPrimaryMode: (nextMode: DocMode) => {
      primaryMode = nextMode;
    },
    togglePrimaryMode: () => {
      primaryMode = primaryMode === "page" ? "edgeless" : "page";
      return primaryMode;
    },
    // Cove remounts the editor when its React mode changes. BlockSuite still
    // needs the current imperative value for all edgeless tool guards.
    getEditorMode: () => editorMode,
    setEditorMode: (m: DocMode) => {
      editorMode = m;
    },
    onPrimaryModeChange: (() => ({
      unsubscribe: () => undefined,
    })) as unknown as DocModeProvider["onPrimaryModeChange"],
  };

  return [
    DocModeExtension(docModeService),
    // Cast through unknown: Cove and AFFiNE each ship @preact/signals-core, so
    // tsc sees two branded (BRAND_SYMBOL) Signal types that don't overlap. At
    // runtime signals are duck-compatible — DocModeProvider above already relies
    // on Cove's signal() and works. `unknown` bridges the type-level divergence.
    EditorSettingExtension({
      setting$: signal(defaultEditorSetting) as unknown as EditorSettingService["setting$"],
    }),
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

    const doc = blockSuiteEditorService.openNoteDoc(noteId, initialContent.current);
    const common = buildCommonExtensions(mode);
    const viewManager = blockSuiteEditorService.getViewManager();
    const pageSpecs = viewManager.get("page");
    const edgelessSpecs = viewManager.get("edgeless");
    registerEdgelessTemplates();

    const editor = document.createElement("affine-editor-container") as TestAffineEditorContainer;
    editor.doc = doc.getStore();
    editor.pageSpecs = [...pageSpecs, ...common];
    editor.edgelessSpecs = [...edgelessSpecs, ...common];
    editor.mode = mode;
    editor.autofocus = true;
    // Tool handlers assume both the surface model and renderer component exist.
    // Keep pointer input disabled during the short Lit mount window so a fast
    // click cannot create root-level frames/media before those dependencies exist.
    editor.style.pointerEvents = "none";
    container.append(editor);
    const mountT0 = performance.now();

    let readyFrame = 0;
    let readyTries = 0;
    let disposed = false;
    let autoCompleteApplied = false;
    const disableBrokenAutoComplete = () => {
      if (autoCompleteApplied) return;
      const selectedRect = editor.querySelector("edgeless-selected-rect");
      if (selectedRect) {
        (selectedRect as HTMLElement & { autoCompleteOff: boolean }).autoCompleteOff = true;
        autoCompleteApplied = true;
        widgetObserver.disconnect();
      }
    };
    const widgetObserver = new MutationObserver(disableBrokenAutoComplete);
    widgetObserver.observe(editor, { childList: true, subtree: true });

    const enableWhenReady = () => {
      if (disposed) return;
      try {
        const gfx = editor.std?.get?.(GfxControllerIdentifier);
        if (gfx?.surface && gfx.surfaceComponent) {
          disableBrokenAutoComplete();
          editor.style.pointerEvents = "";
          // eslint-disable-next-line no-console
          console.log(
            "[cove-mount]",
            mode,
            "ready in",
            `${(performance.now() - mountT0).toFixed(0)}ms`,
          );
          return;
        }
      } catch {
        // Lit has not created the std/host yet.
      }
      if (++readyTries < 120) readyFrame = requestAnimationFrame(enableWhenReady);
    };
    void editor.updateComplete.then(enableWhenReady);

    // Navigate to a linked note when the user clicks a @-mention reference.
    // BlockSuite fires docLinkClicked via RefNodeSlotsProvider.
    const refSlots = editor.std?.get?.(RefNodeSlotsProvider);
    const navSub = refSlots?.docLinkClicked?.subscribe?.(
      ({ pageId: targetId }: { pageId: string }) => {
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
      },
    );

    // Debounced save on doc update. A content snapshot is only written when it
    // actually changed since the last successful save — many Yjs transactions
    // (e.g. captureSync checkpoints, empty transacts) can fire `update` without
    // altering the serialized doc, so re-encoding then no-op-writing would be
    // wasted work on large edgeless docs.
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;
    let lastSavedSnapshot: string | null = null;
    const flush = () => {
      pending = false;
      // A vault lock disposes the workspace and every Y.Doc with it. Encoding a
      // disposed doc throws / corrupts the snapshot, so abort the save entirely.
      if (!blockSuiteEditorService.isWorkspaceAlive()) return;
      const snapshot = packBlockSuiteContent(encodeDocSnapshot(doc.spaceDoc));
      if (snapshot === lastSavedSnapshot) return;
      lastSavedSnapshot = snapshot;
      void useNoteStore.getState().updateNote(noteId, { content: snapshot });
    };
    const onUpdate = () => {
      pending = true;
      if (timer) clearTimeout(timer);
      timer = setTimeout(flush, SAVE_DEBOUNCE_MS);
    };
    doc.spaceDoc.on("update", onUpdate);

    return () => {
      disposed = true;
      cancelAnimationFrame(readyFrame);
      widgetObserver.disconnect();
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
