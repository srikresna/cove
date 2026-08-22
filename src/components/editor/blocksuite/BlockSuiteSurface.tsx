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

import { effect, signal } from "@preact/signals-core";
import type React from "react";
import { useEffect, useRef } from "react";
import { blockSuiteEditorService } from "../../../di/container";
import type { DocMode as CoveDocMode } from "../../../domain/note/Note";
import {
  coveNotificationExtension,
  coveQuickSearchExtension,
} from "../../../services/blocksuite/coveBlockSuiteProviders";
import { registerEdgelessTemplates } from "../../../services/blocksuite/edgelessTemplates";
import { consumePresentation } from "../../../services/blocksuite/presentationIntent";
import { packBlockSuiteContent } from "../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../services/editor/yjsCodec";
import { Logger } from "../../../services/Logger";
import { useNoteStore } from "../../../store/useNoteStore";
import { useUIStore } from "../../../store/useUIStore";
import { useWorkspaceStore } from "../../../store/useWorkspaceStore";
import type { Note } from "../../../types";
import type { TestAffineEditorContainer } from "./editorContainer";

const SAVE_DEBOUNCE_MS = 800;
const EDITOR_READY_MAX_TRIES = 200;

interface BlockSuiteSurfaceProps {
  note: Note;
  mode: CoveDocMode;

  onEditorReady?: (host: EditorHost | null) => void;
}

const defaultEditorSetting = Object.fromEntries(
  Object.entries(GeneralSettingSchema.shape).map(([key, schema]) => [
    key,
    (schema as { parse: (value: unknown) => unknown }).parse(undefined),
  ]),
) as DeepPartial<EditorSetting>;

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

    EditorSettingExtension({
      setting$: signal(defaultEditorSetting) as unknown as EditorSettingService["setting$"],
    }),
  ];
}

export const BlockSuiteSurface: React.FC<BlockSuiteSurfaceProps> = ({
  note,
  mode,
  onEditorReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const noteId = note.id;
  const initialContent = useRef(note.content);
  initialContent.current = note.content;
  // Per-doc edgeless theme (AFFI NE edgelessColorTheme): 'system' follows the
  // app theme; explicit light/dark overrides it. Keying the effect on the
  // resolved value remounts the editor only when the theme actually changes.
  const isDarkMode = useUIStore((s) => s.isDarkMode);
  const edgelessDark =
    note.edgelessTheme === "dark" || (note.edgelessTheme !== "light" && isDarkMode);

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
    editor.pageSpecs = [
      ...pageSpecs,
      ...common,
      coveNotificationExtension,
      coveQuickSearchExtension,
    ];
    editor.edgelessSpecs = [
      ...edgelessSpecs,
      ...common,
      coveNotificationExtension,
      coveQuickSearchExtension,
    ];
    editor.mode = mode;
    editor.autofocus = true;
    editor.style.colorScheme = edgelessDark ? "dark" : "light";

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

        const ready = mode === "edgeless" ? Boolean(gfx?.tool) : Boolean(editor.host?.std);
        if (ready) {
          disableBrokenAutoComplete();
          editor.style.pointerEvents = "";
          onEditorReady?.(editor.host ?? null);

          if (gfx?.tool && !stopPresentationWatch) {
            const gfxTool = gfx.tool;
            stopPresentationWatch = effect(() => {
              const presenting = gfxTool.currentToolName$.value === "frameNavigator";
              editor.style.position = presenting ? "fixed" : "";
              editor.style.inset = presenting ? "0" : "";
              editor.style.zIndex = presenting ? "99999" : "";
              editor.style.background = presenting ? "#000" : "";
            });

            if (consumePresentation(noteId)) {
              void import("@blocksuite/affine/blocks/frame").then(({ PresentTool }) => {
                try {
                  gfxTool.setTool(PresentTool, { mode: "fit" });
                } catch {}
              });
            }
          }
          return;
        }
      } catch {}
      if (++readyTries < EDITOR_READY_MAX_TRIES) {
        readyFrame = requestAnimationFrame(enableWhenReady);
        return;
      }
      disableBrokenAutoComplete();
      editor.style.pointerEvents = "";
      onEditorReady?.(editor.host ?? null);
      Logger.warn(
        `BlockSuiteSurface: editor not ready after ${EDITOR_READY_MAX_TRIES} frames; enabling anyway`,
      );
    };
    void editor.updateComplete.then(enableWhenReady);

    const refSlots = editor.std?.get?.(RefNodeSlotsProvider);
    const navSub = refSlots?.docLinkClicked?.subscribe?.(
      ({ pageId: targetId }: { pageId: string }) => {
        const noteStore = useNoteStore.getState();
        const wsStore = useWorkspaceStore.getState();

        const allNotes = noteStore.notes;
        const targetNote = allNotes.find((n) => n.id === targetId);
        if (targetNote && targetNote.workspaceId !== wsStore.activeWorkspaceId) {
          wsStore.setActiveWorkspace(targetNote.workspaceId);
        }
        noteStore.setActiveNoteId(targetId);
      },
    );

    let timer: ReturnType<typeof setTimeout> | null = null;
    let pending = false;
    let lastSavedSnapshot: string | null = null;

    const encodeAndSave = () => {
      if (!blockSuiteEditorService.isWorkspaceAlive()) return;
      const snapshot = packBlockSuiteContent(encodeDocSnapshot(doc.spaceDoc));
      if (snapshot === lastSavedSnapshot) return;

      void useNoteStore
        .getState()
        .updateNote(noteId, { content: snapshot })
        .then(
          () => {
            lastSavedSnapshot = snapshot;
          },
          () => {},
        );
    };
    const flush = () => {
      const doEncode = () => {
        pending = false;
        encodeAndSave();
      };

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

    const unregisterFlusher = blockSuiteEditorService.registerPendingFlusher(() => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      if (pending) {
        pending = false;
        encodeAndSave();
      }
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(readyFrame);
      widgetObserver.disconnect();
      stopPresentationWatch?.();
      doc.spaceDoc.off("update", onUpdate);
      navSub?.unsubscribe?.();
      unregisterFlusher();
      if (timer) clearTimeout(timer);
      if (pending) flush();
      editor.remove();
      onEditorReady?.(null);
    };
  }, [noteId, mode, edgelessDark, onEditorReady]);

  return <div ref={containerRef} className="h-full min-h-0 flex-1" />;
};

export default BlockSuiteSurface;
