import type { EditorHost } from "@blocksuite/std";
import type React from "react";
import { useMemo, useRef, useState } from "react";
import { cn } from "../../../lib/utils";
import { Logger } from "../../../services/Logger";
import { useNoteStore } from "../../../store/useNoteStore";
import type { Note } from "../../../types";
import { countWordsAndChars } from "../../../utils/plainText";
import { TooltipProvider } from "../../ui/tooltip";
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
  const updateNote = useNoteStore((s) => s.updateNote);
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isRightBarOpen, setRightBarOpen] = useState(
    () => localStorage.getItem(RIGHTBAR_KEY) === "true",
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const [editorHost, setEditorHost] = useState<EditorHost | null>(null);
  const mode = note.docMode ?? "page";
  const { wordCount, characterCount } = useMemo(
    () => countWordsAndChars(note.content),
    [note.content],
  );

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        Logger.error("requestFullscreen error", err);
      });
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch((err) => {
        Logger.error("exitFullscreen error", err);
      });
      setIsFullscreen(false);
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
        {/* Left column: topbar + editor. The right bar sits beside the topbar
            (full height), matching AFFiNE's sidebar layout — not below it. */}
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
            onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
            onToggleFullscreen={toggleFullscreen}
            onToggleRightBar={toggleRightBar}
          />

          <div className="relative h-full min-h-0 min-w-0 flex-1">
            {mode === "edgeless" ? (
              <EditorErrorBoundary resetKey={`${note.id}:edgeless`}>
                <BlockSuiteSurface note={note} mode="edgeless" onEditorReady={setEditorHost} />
              </EditorErrorBoundary>
            ) : (
              <div ref={scrollRef} className="h-full w-full overflow-y-auto">
                <EditorHeader note={note} isFullWidth={isFullWidth} />

                <div
                  className={cn(
                    "flex min-h-[500px] w-full flex-col pb-24",
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
