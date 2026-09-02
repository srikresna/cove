import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { countWordsAndChars } from "@/services/editor/plainText";
import { TooltipProvider } from "../../../components/ui/tooltip";
import type { Note } from "../../../domain/note/Note";
import { cn } from "../../../lib/utils";
import { Logger } from "../../../services/Logger";
import { noteActions } from "../../../store/noteActions";
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
  // Page width is a persisted per-doc property.
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
    // The vendored kanban board scrolls its column strip horizontally but
    // never maps the vertical wheel to it — with a plain desktop mouse an
    // overflowing board is unscrollable. Capture runs before the board's own
    // wheel handler (which stops propagation) and converts deltaY to
    // scrollLeft only when the pointer is over a strip that can consume it.
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || e.metaKey) return; // pinch-zoom / app zoom
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const target = e.target instanceof Element ? e.target : null;
      const strip = target?.closest("affine-data-view-kanban-group")?.parentElement;
      if (!strip || strip.scrollWidth <= strip.clientWidth) return;
      // Only swallow the event while the strip can actually move — at either
      // end the doc must keep scrolling vertically.
      const next = strip.scrollLeft + e.deltaY;
      if (next < 0 || next > strip.scrollWidth - strip.clientWidth) return;
      strip.scrollLeft = next;
      e.preventDefault();
    };
    scroller.addEventListener("wheel", onWheel, { capture: true, passive: false });
    return () => scroller.removeEventListener("wheel", onWheel, { capture: true });
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

  const toggleRightBar = () => {
    setRightBarOpen((open) => {
      localStorage.setItem(RIGHTBAR_KEY, String(!open));
      return !open;
    });
  };

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

                <OutlineViewerHost editor={editorHost} />
              </div>
            )}
          </div>
        </div>

        <EditorRightBar
          note={note}
          scrollRef={scrollRef}
          onClose={toggleRightBar}
          editorHost={editorHost}
          open={isRightBarOpen}
        />
      </div>
    </TooltipProvider>
  );
};

export default BlockSuiteNoteEditor;
