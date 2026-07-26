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
import { BlockSuiteSurface } from "./BlockSuiteSurface";

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
      <div className="flex h-full w-full flex-col">
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

        <div className="flex min-h-0 w-full flex-1">
          <div className="relative h-full min-w-0 flex-1">
            {mode === "edgeless" ? (
              <BlockSuiteSurface note={note} mode="edgeless" />
            ) : (
              <div ref={scrollRef} className="h-full w-full overflow-y-auto">
                <EditorHeader note={note} isFullWidth={isFullWidth} />

                <div
                  className={cn(
                    "flex min-h-[500px] w-full flex-col pb-24",
                    !isFullWidth && "mx-auto max-w-3xl",
                  )}
                >
                  <BlockSuiteSurface note={note} mode="page" />
                </div>
              </div>
            )}
          </div>

          {isRightBarOpen && mode === "page" && (
            <EditorRightBar note={note} scrollRef={scrollRef} onClose={toggleRightBar} />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BlockSuiteNoteEditor;
