import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { blockSuiteEditorService, noteService } from "../../../../di/container";
import type { Note } from "../../../../domain/note/Note";
import type { DocPeekRequest } from "../../../../services/blocksuite/peekViewService";
import { packBlockSuiteContent } from "../../../../services/editor/contentFormat";
import { encodeDocSnapshot } from "../../../../services/editor/yjsCodec";
import { Logger } from "../../../../services/Logger";
import { useNoteStore } from "../../../../store/useNoteStore";
import { TooltipProvider } from "../../../ui/tooltip";
import { NoteHeaderBody } from "../../EditorHeader";
import { buildCommonExtensions } from "../BlockSuiteSurface";
import type { TestAffineEditorContainer } from "../editorContainer";

const SAVE_DEBOUNCE_MS = 800;

interface PeekDocViewProps {
  request: DocPeekRequest;
  note: Note | undefined;
  onUnavailable: () => void;
  onReady: () => void;
}

export const PeekDocView: React.FC<PeekDocViewProps> = ({
  request,
  note,
  onUnavailable,
  onReady,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const uploadCoverImage = useNoteStore((s) => s.uploadCoverImage);
  const removeCoverImage = useNoteStore((s) => s.removeCoverImage);
  const [coverImage, setCoverImage] = useState<string | null>(null);

  const handleUnavailable = useCallback(() => onUnavailable(), [onUnavailable]);
  const handleReady = useCallback(() => onReady(), [onReady]);

  useEffect(() => {
    let cancelled = false;
    noteService
      .getCoverImage(request.docId)
      .then((cover) => {
        if (!cancelled) setCoverImage(cover);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [request.docId]);

  useEffect(() => {
    let disposed = false;
    let editor: TestAffineEditorContainer | null = null;
    let rootWatch: (() => void) | null = null;
    let saveTimer: ReturnType<typeof setTimeout> | null = null;
    let savePending = false;
    let lastSavedSnapshot: string | null = null;
    let unregisterFlusher: (() => void) | null = null;
    let detachSaveListener: (() => void) | null = null;
    let finalFlush: (() => void) | null = null;

    const mount = (container: HTMLDivElement) => {
      const store = blockSuiteEditorService.getDocStoreForPeek(request.docId);
      if (!store) {
        handleUnavailable();
        return;
      }

      try {
        editor = document.createElement("affine-editor-container") as TestAffineEditorContainer;
        editor.doc = store;
        const common = buildCommonExtensions("page");
        editor.pageSpecs = [...blockSuiteEditorService.getViewSpecs("page"), ...common];
        editor.mode = "page";

        editor.autofocus = true;

        const encodeAndSave = () => {
          if (!blockSuiteEditorService.isWorkspaceAlive()) return;
          const snapshot = packBlockSuiteContent(encodeDocSnapshot(store.spaceDoc));
          if (snapshot === lastSavedSnapshot) return;
          void useNoteStore
            .getState()
            .updateNote(request.docId, { content: snapshot })
            .then(
              () => {
                lastSavedSnapshot = snapshot;
              },
              () => {},
            );
        };
        const flush = () => {
          const doEncode = () => {
            savePending = false;
            encodeAndSave();
          };
          if (typeof requestIdleCallback === "function") {
            requestIdleCallback(doEncode, { timeout: 3000 });
          } else {
            setTimeout(doEncode, 0);
          }
        };
        const onUpdate = () => {
          savePending = true;
          if (saveTimer) clearTimeout(saveTimer);
          saveTimer = setTimeout(flush, SAVE_DEBOUNCE_MS);
        };
        store.spaceDoc.on("update", onUpdate);
        detachSaveListener = () => {
          try {
            store.spaceDoc.off("update", onUpdate);
          } catch {}
        };
        finalFlush = () => {
          if (saveTimer) {
            clearTimeout(saveTimer);
            saveTimer = null;
          }
          if (savePending) {
            savePending = false;
            encodeAndSave();
          }
        };
        unregisterFlusher = blockSuiteEditorService.registerPendingFlusher(finalFlush);

        const appendEditor = () => {
          if (disposed) return;
          container.append(editor as TestAffineEditorContainer);
        };
        if (store.root) {
          appendEditor();
        } else {
          const sub = store.slots.rootAdded.subscribe(appendEditor);
          rootWatch = () => sub.unsubscribe();
        }

        void editor.updateComplete.then(() => {
          if (disposed) return;
          handleReady();

          requestAnimationFrame(() => {
            if (disposed) return;
            try {
              (editor as TestAffineEditorContainer | null)?.host?.focus({ preventScroll: true });
              const host = (editor as TestAffineEditorContainer | null)?.host;
              const paragraph = host?.querySelector("affine-note affine-paragraph rich-text") as
                | (HTMLElement & { inlineEditor?: { focusEnd: () => void } })
                | null;
              paragraph?.inlineEditor?.focusEnd();
            } catch {}
          });
        });
      } catch (err) {
        Logger.error("[cove-peek] doc view mount failed", err);
        handleUnavailable();
      }
    };

    let loadFailed = false;
    noteService
      .getNote(request.docId)
      .then((n) => {
        if (disposed) return;
        blockSuiteEditorService.openNoteDoc(request.docId, n?.content ?? "");
      })
      .catch(() => {
        loadFailed = true;
      })
      .finally(() => {
        if (disposed) return;
        if (loadFailed) {
          handleUnavailable();
          return;
        }
        const container = containerRef.current;
        if (!container) {
          handleUnavailable();
          return;
        }
        mount(container);
      });

    return () => {
      disposed = true;
      rootWatch?.();
      finalFlush?.();
      detachSaveListener?.();
      unregisterFlusher?.();
      editor?.remove();
    };
  }, [request.docId, handleUnavailable, handleReady]);

  const notePending = !note;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="peek-doc-scroll">
        {notePending ? (
          <div className="flex h-full items-center justify-center p-8 text-sm text-muted-foreground">
            Registering note…
          </div>
        ) : (
          <NoteHeaderBody
            note={note}
            coverImage={coverImage}
            isFullWidth={false}
            uploadCoverImage={uploadCoverImage}
            removeCoverImage={removeCoverImage}
            backlinkDefaultOpenRef={
              request.databaseId && request.databaseRowId
                ? { databaseId: request.databaseId, databaseRowId: request.databaseRowId }
                : null
            }
          />
        )}

        {/* editor body — doc-title is hidden (the header above owns the title).
            Same centered column as the header content so the text aligns. */}
        <div className="relative mx-auto min-h-0 w-full max-w-3xl flex-1">
          <div ref={containerRef} className="peek-doc-editor-host" />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default PeekDocView;
