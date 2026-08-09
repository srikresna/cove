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
import type { EditorHost } from "@blocksuite/std";
import type { TestAffineEditorContainer } from "@blocksuite/integration-test";
import { effect, signal } from "@preact/signals-core";
import type React from "react";
import { useEffect, useRef } from "react";
import type { DocMode as CoveDocMode } from "../../../domain/note/Note";
import { packBlockSuiteContent } from "../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../services/editor/yjsCodec";
import { useNoteStore } from "../../../store/useNoteStore";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import { blockSuiteEditorService } from "../../../di/container";
import { coveNotificationExtension, coveQuickSearchExtension } from "../../../services/blocksuite/coveBlockSuiteProviders";
import { registerEdgelessTemplates } from "../../../services/blocksuite/edgelessTemplates";
import { consumePresentation } from "../../../services/blocksuite/presentationIntent";
import type { Note } from "../../../types";

const SAVE_DEBOUNCE_MS = 800;

interface BlockSuiteSurfaceProps {
  note: Note;
  mode: CoveDocMode;
  /** Fired with the editor host once the surface is ready, and null on unmount.
   *  Lets the parent mount host-dependent panels (e.g. the native OutlinePanel). */
  onEditorReady?: (host: EditorHost | null) => void;
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

export const BlockSuiteSurface: React.FC<BlockSuiteSurfaceProps> = ({ note, mode, onEditorReady }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteId = note.id;
  const initialContent = useRef(note.content);
  initialContent.current = note.content;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const doc = blockSuiteEditorService.openNoteDoc(noteId, initialContent.current);
    const common = buildCommonExtensions(mode);
    const pageSpecs = blockSuiteEditorService.getViewSpecs("page");
    const edgelessSpecs = blockSuiteEditorService.getViewSpecs("edgeless");
    registerEdgelessTemplates();

    const editor = document.createElement("affine-editor-container") as TestAffineEditorContainer;
    editor.doc = doc.getStore();
    editor.pageSpecs = [...pageSpecs, ...common, coveNotificationExtension, coveQuickSearchExtension];
    editor.edgelessSpecs = [...edgelessSpecs, ...common, coveNotificationExtension, coveQuickSearchExtension];
    editor.mode = mode;
    editor.autofocus = true;
    // Tool handlers assume both the surface model and renderer component exist.
    // Keep pointer input disabled during the short Lit mount window so a fast
    // click cannot create root-level frames/media before those dependencies exist.
    editor.style.pointerEvents = "none";
    container.append(editor);

    let readyFrame = 0;
    let readyTries = 0;
    let disposed = false;
    let autoCompleteApplied = false;
    let stopPresentationWatch: (() => void) | null = null;
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
        // Page root has no GfxController — page is ready once the host/std are
        // built. Edgeless readiness needs the tool controller (gfx.tool), which
        // FramePanel's presentation depends on — wait for it so onEditorReady
        // surfaces a fully-initialized edgeless host.
        const ready =
          mode === "edgeless" ? Boolean(gfx?.tool) : Boolean(editor.host?.std);
        if (ready) {
          disableBrokenAutoComplete();
          editor.style.pointerEvents = "";
          onEditorReady?.(editor.host ?? null);
          // CSS presentation "fullscreen": the browser fullscreen API is
          // gesture-blocked in Tauri and window setFullscreen is a visual
          // no-op on Windows, so instead float the editor over Cove's chrome
          // whenever the frameNavigator (presentation) tool is active.
          if (gfx?.tool && !stopPresentationWatch) {
            const gfxTool = gfx.tool;
            stopPresentationWatch = effect(() => {
              const presenting = gfxTool.currentToolName$.value === "frameNavigator";
              editor.style.position = presenting ? "fixed" : "";
              editor.style.inset = presenting ? "0" : "";
              editor.style.zIndex = presenting ? "99999" : "";
              editor.style.background = presenting ? "#000" : "";
            });
            // Honor a presentation request initiated from page mode: flip to
            // edgeless was done by the caller; here we activate PresentTool now
            // that the tool controller is ready.
            if (consumePresentation(noteId)) {
              void import("@blocksuite/affine/blocks/frame").then(({ PresentTool }) => {
                try {
                  gfxTool.setTool(PresentTool, { mode: "fit" });
                } catch {
                  // tool/controller disposed between ready and activation
                }
              });
            }
          }
          return;
        }
      } catch {
        // Lit has not created the std/host yet.
      }
      if (++readyTries < 200) readyFrame = requestAnimationFrame(enableWhenReady);
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

    // Debounced save on doc update. The encoding (encodeDocSnapshot →
    // Y.encodeStateAsUpdate) traverses the CRDT state synchronously — for large
    // edgeless docs this can freeze the main thread for 50–100ms. Deferring it
    // to an idle callback keeps animation frames (presentation, canvas drag)
    // smooth. A snapshot is only written when it actually changed since the
    // last save — many Yjs transactions fire `update` without altering the
    // serialized doc.
    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;
    let lastSavedSnapshot: string | null = null;
    const flush = () => {
      const doEncode = () => {
        pending = false;
        if (!blockSuiteEditorService.isWorkspaceAlive()) return;
        const snapshot = packBlockSuiteContent(encodeDocSnapshot(doc.spaceDoc));
        if (snapshot === lastSavedSnapshot) return;
        lastSavedSnapshot = snapshot;
        void useNoteStore.getState().updateNote(noteId, { content: snapshot });
      };
      // Defer the expensive encoding to an idle period (fallback: setTimeout
      // 0). pending stays true until encoding completes, so rapid edits during
      // the defer coalesce into one encode.
      if (typeof requestIdleCallback === "function") {
        requestIdleCallback(doEncode, { timeout: 3000 });
      } else {
        setTimeout(doEncode, 0);
      }
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
      stopPresentationWatch?.();
      doc.spaceDoc.off("update", onUpdate);
      navSub?.unsubscribe?.();
      if (timer) clearTimeout(timer);
      if (pending) flush();
      editor.remove();
      onEditorReady?.(null);
    };
  }, [noteId, mode]);

  return <div ref={containerRef} className="h-full min-h-full flex-1" />;
};

export default BlockSuiteSurface;
