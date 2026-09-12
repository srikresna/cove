import type { EditorHost } from "@blocksuite/std";
import { readText } from "@tauri-apps/plugin-clipboard-manager";
import { ClipboardPaste } from "lucide-react";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { countWordsAndChars } from "@/services/editor/plainText";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
} from "../../../components/ui/context-menu";
import { TooltipProvider } from "../../../components/ui/tooltip";
import { MESSAGES } from "../../../constants/messages";
import type { Note } from "../../../domain/note/Note";
import { cn } from "../../../lib/utils";
import { Logger } from "../../../services/Logger";
import { noteActions } from "../../../store/noteActions";
import { notifyError } from "../../../store/notify";
import { EditorHeader } from "../EditorHeader";
import { EditorRightBar } from "../EditorRightBar";
import { EditorTopbar } from "../EditorTopbar";
import { OutlineViewerHost } from "../OutlineViewerHost";
import { BlockSuiteSurface } from "./BlockSuiteSurface";
import { EditorErrorBoundary } from "./EditorErrorBoundary";

const RIGHTBAR_KEY = "cove-rightbar-open";

interface BlockSuiteNoteEditorProps {
  note: Note;
}

export const BlockSuiteNoteEditor: React.FC<BlockSuiteNoteEditorProps> = ({ note }) => {
  const updateNote = noteActions.updateNote;
  const [isFullscreen, setIsFullscreen] = useState(() => Boolean(document.fullscreenElement));
  const [isRightBarOpen, setRightBarOpen] = useState(
    () => localStorage.getItem(RIGHTBAR_KEY) === "true",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editorHost, setEditorHost] = useState<EditorHost | null>(null);
  const mode = note.docMode ?? "page";
  const isFullWidth = (note.pageWidth ?? "standard") === "fullWidth";
  const { wordCount, characterCount } = useMemo(
    () => countWordsAndChars(note.content),
    [note.content],
  );

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("fullscreenchange", syncFullscreen);
    return () => document.removeEventListener("fullscreenchange", syncFullscreen);
  }, []);

  // biome-ignore lint/correctness/useExhaustiveDependencies: the scroll div unmounts/remounts when the doc mode flips, so the listener must re-attach — mode is load-bearing here
  useEffect(() => {
    const scroller = scrollRef.current;
    if (!scroller) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return;
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const target = e.target instanceof Element ? e.target : null;
      const strip = target?.closest("affine-data-view-kanban-group")?.parentElement;
      if (!strip || strip.scrollWidth <= strip.clientWidth) return;
      const next = strip.scrollLeft + e.deltaY;
      if (next < 0 || next > strip.scrollWidth - strip.clientWidth) return;
      strip.scrollLeft = next;
      e.preventDefault();
    };
    scroller.addEventListener("wheel", onWheel, { capture: true, passive: false });

    const CARET_MARGIN = 24;
    const onSelectionChange = () => {
      const sel = document.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.isCollapsed) return;
      const node = sel.anchorNode;
      const el = node?.nodeType === 1 ? (node as Element) : (node?.parentElement ?? null);
      if (!el || !scroller.contains(el)) return;
      requestAnimationFrame(() => {
        const rect = sel.getRangeAt(0).getBoundingClientRect();
        const view = scroller.getBoundingClientRect();
        if (rect.bottom > view.bottom - CARET_MARGIN) {
          scroller.scrollTop += rect.bottom - (view.bottom - CARET_MARGIN);
        } else if (rect.top < view.top + CARET_MARGIN) {
          scroller.scrollTop -= view.top + CARET_MARGIN - rect.top;
        }
      });
    };
    document.addEventListener("selectionchange", onSelectionChange);

    return () => {
      document.removeEventListener("selectionchange", onSelectionChange);
      scroller.removeEventListener("wheel", onWheel, { capture: true });
    };
  }, [mode]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        Logger.error("requestFullscreen error", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        Logger.error("exitFullscreen error", err);
      });
    }
  };

  const pasteFromClipboard = async () => {
    let text = "";
    try {
      text = await readText();
    } catch (err) {
      notifyError(err);
      return;
    }
    if (!text || !editorHost) return;
    editorHost.std.event.active = true;
    const data = new DataTransfer();
    data.setData("text/plain", text);
    editorHost.dispatchEvent(
      new ClipboardEvent("paste", { bubbles: true, cancelable: true, clipboardData: data }),
    );
  };

  const openToggleRef = useRef<HTMLButtonElement>(null);
  const rightBarHeaderRef = useRef<HTMLDivElement>(null);
  const toggledViaKeyboard = useRef(false);
  const prevRightBarOpenRef = useRef(isRightBarOpen);

  const toggleRightBar = (viaKeyboard: boolean) => {
    toggledViaKeyboard.current = viaKeyboard;
    setRightBarOpen((open) => {
      localStorage.setItem(RIGHTBAR_KEY, String(!open));
      return !open;
    });
  };

  useEffect(() => {
    const opened = isRightBarOpen && !prevRightBarOpenRef.current;
    const closed = !isRightBarOpen && prevRightBarOpenRef.current;
    prevRightBarOpenRef.current = isRightBarOpen;
    if (!toggledViaKeyboard.current) return;
    toggledViaKeyboard.current = false;
    if (opened) rightBarHeaderRef.current?.querySelector<HTMLElement>("button")?.focus();
    else if (closed) openToggleRef.current?.focus();
  }, [isRightBarOpen]);

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full">
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          <EditorTopbar
            note={note}
            wordCount={wordCount}
            characterCount={characterCount}
            isFullWidth={isFullWidth}
            isFullscreen={isFullscreen}
            isRightBarOpen={isRightBarOpen}
            docMode={mode}
            onToggleDocMode={() =>
              updateNote(note.id, { docMode: mode === "edgeless" ? "page" : "edgeless" })
            }
            onToggleFullWidth={() =>
              updateNote(note.id, { pageWidth: isFullWidth ? "standard" : "fullWidth" })
            }
            onToggleFullscreen={toggleFullscreen}
            onToggleRightBar={toggleRightBar}
            openToggleRef={openToggleRef}
          />

          <div className="relative h-full min-h-0 min-w-0 flex-1">
            {mode === "edgeless" ? (
              <EditorErrorBoundary resetKey={`${note.id}:edgeless`}>
                <BlockSuiteSurface note={note} mode="edgeless" onEditorReady={setEditorHost} />
              </EditorErrorBoundary>
            ) : (
              <div
                ref={scrollRef}
                className="cove-doc-scroll flex h-full w-full flex-col overflow-y-auto"
              >
                <EditorHeader note={note} isFullWidth={isFullWidth} />

                <ContextMenu>
                  <ContextMenuTrigger asChild>
                    <div
                      data-page-width={isFullWidth ? "fullWidth" : "standard"}
                      className={cn(
                        "flex min-h-0 w-full flex-1 flex-col",
                        !isFullWidth && "mx-auto max-w-3xl",
                      )}
                    >
                      <EditorErrorBoundary resetKey={`${note.id}:page`}>
                        <BlockSuiteSurface note={note} mode="page" onEditorReady={setEditorHost} />
                      </EditorErrorBoundary>
                    </div>
                  </ContextMenuTrigger>
                  <ContextMenuContent>
                    <ContextMenuItem onSelect={() => void pasteFromClipboard()}>
                      <ClipboardPaste aria-hidden="true" />
                      {MESSAGES.PASTE}
                    </ContextMenuItem>
                  </ContextMenuContent>
                </ContextMenu>
              </div>
            )}

            {mode !== "edgeless" && <OutlineViewerHost editor={editorHost} />}
          </div>
        </div>

        <EditorRightBar
          note={note}
          scrollRef={scrollRef}
          onClose={toggleRightBar}
          headerRef={rightBarHeaderRef}
          editorHost={editorHost}
          open={isRightBarOpen}
        />
      </div>
    </TooltipProvider>
  );
};

export default BlockSuiteNoteEditor;
