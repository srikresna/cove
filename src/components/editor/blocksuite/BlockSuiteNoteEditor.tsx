import type React from "react";
import { useState } from "react";
import { cn } from "../../../lib/utils";
import { Logger } from "../../../services/Logger";
import type { Note } from "../../../types";
import { TooltipProvider } from "../../ui/tooltip";
import { EditorHeader } from "../EditorHeader";
import { EditorTopbar } from "../EditorTopbar";
import { BlockSuiteSurface } from "./BlockSuiteSurface";

interface BlockSuiteNoteEditorProps {
  note: Note;
}

export const BlockSuiteNoteEditor: React.FC<BlockSuiteNoteEditorProps> = ({ note }) => {
  const [isFullWidth, setIsFullWidth] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

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

  return (
    <TooltipProvider delayDuration={300}>
      <div className="flex h-full w-full flex-col">
        <EditorTopbar
          note={note}
          wordCount={0}
          characterCount={0}
          isFullWidth={isFullWidth}
          isFullscreen={isFullscreen}
          isRightBarOpen={false}
          onToggleFullWidth={() => setIsFullWidth(!isFullWidth)}
          onToggleFullscreen={toggleFullscreen}
          onToggleRightBar={() => {}}
        />

        <div className="flex min-h-0 w-full flex-1">
          <div className="relative h-full min-w-0 flex-1">
            <div className="h-full w-full overflow-y-auto">
              <EditorHeader note={note} isFullWidth={isFullWidth} />

              <div
                className={cn(
                  "flex min-h-[500px] w-full flex-col pb-24",
                  !isFullWidth && "mx-auto max-w-3xl",
                )}
              >
                <BlockSuiteSurface note={note} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default BlockSuiteNoteEditor;
