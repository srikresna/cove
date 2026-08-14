import {
  ArrowRightLeft,
  Copy,
  Maximize2,
  Minimize2,
  PanelRight,
  PanelRightClose,
  Pin,
  Shapes,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { MESSAGES } from "../../constants/messages";
import type { DocMode } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { useNoteStore } from "../../store/useNoteStore";
import type { Note } from "../../types";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { SaveStatusBadge } from "./SaveStatusBadge";

interface EditorTopbarProps {
  note: Note;
  wordCount: number;
  characterCount: number;
  isFullWidth: boolean;
  isFullscreen: boolean;
  isRightBarOpen: boolean;
  docMode?: DocMode;
  onToggleDocMode?: () => void;
  onToggleFullWidth: () => void;
  onToggleFullscreen: () => void;
  onToggleRightBar: () => void;
}

const IconAction: React.FC<{
  label: string;
  onClick: () => void;
  className?: string;
  children: React.ReactNode;
}> = ({ label, onClick, className, children }) => (
  <Tooltip>
    <TooltipTrigger asChild>
      <Button
        variant="ghost"
        size="iconSm"
        aria-label={label}
        onClick={onClick}
        className={cn("text-muted-foreground", className)}
      >
        {children}
      </Button>
    </TooltipTrigger>
    <TooltipContent side="bottom">{label}</TooltipContent>
  </Tooltip>
);

export const EditorTopbar: React.FC<EditorTopbarProps> = ({
  note,
  wordCount,
  characterCount,
  isFullWidth,
  isFullscreen,
  isRightBarOpen,
  docMode,
  onToggleDocMode,
  onToggleFullWidth,
  onToggleFullscreen,
  onToggleRightBar,
}) => {
  const trashNote = useNoteStore((s) => s.trashNote);
  const duplicateNote = useNoteStore((s) => s.duplicateNote);
  const togglePinNote = useNoteStore((s) => s.togglePinNote);
  const toggleFavoriteNote = useNoteStore((s) => s.toggleFavoriteNote);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(note.updatedAt);

  return (
    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b bg-card px-3">
      <div className="flex min-w-0 items-center gap-x-3 overflow-hidden whitespace-nowrap font-mono text-[11px] text-muted-foreground">
        <span>
          {wordCount} {MESSAGES.META_WORDS}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {characterCount} {MESSAGES.META_CHARACTERS}
        </span>
        <span aria-hidden="true">·</span>
        <span>
          {MESSAGES.META_UPDATED_PREFIX} {formattedDate}
        </span>
        <SaveStatusBadge />
      </div>

      <div className="flex items-center gap-0.5">
        {onToggleDocMode && (
          <>
            <IconAction
              label={docMode === "edgeless" ? MESSAGES.DOC_MODE_PAGE : MESSAGES.DOC_MODE_CANVAS}
              onClick={onToggleDocMode}
              className={cn(docMode === "edgeless" && "text-primary")}
            >
              <Shapes className="h-4 w-4" aria-hidden="true" />
            </IconAction>
            <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
          </>
        )}
        <IconAction
          label={isFullWidth ? MESSAGES.STANDARD_WIDTH : MESSAGES.WIDE_WIDTH}
          onClick={onToggleFullWidth}
        >
          <ArrowRightLeft className="h-4 w-4" aria-hidden="true" />
        </IconAction>
        <IconAction
          label={isFullscreen ? MESSAGES.EXIT_FULL_WINDOW : MESSAGES.FULL_WINDOW}
          onClick={onToggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" aria-hidden="true" />
          ) : (
            <Maximize2 className="h-4 w-4" aria-hidden="true" />
          )}
        </IconAction>

        <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />

        <IconAction
          label={note.isPinned ? MESSAGES.UNPIN_NOTE : MESSAGES.PIN_NOTE}
          onClick={() => togglePinNote(note.id)}
          className={cn(note.isPinned && "text-primary")}
        >
          <Pin className="h-4 w-4" aria-hidden="true" />
        </IconAction>
        <IconAction
          label={note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
          onClick={() => toggleFavoriteNote(note.id)}
          className={cn(note.isFavorite && "text-warm")}
        >
          <Star className="h-4 w-4" aria-hidden="true" />
        </IconAction>
        <IconAction label={MESSAGES.DUPLICATE_NOTE} onClick={() => duplicateNote(note.id)}>
          <Copy className="h-4 w-4" aria-hidden="true" />
        </IconAction>
        <IconAction
          label={MESSAGES.MOVE_TO_TRASH}
          onClick={() => trashNote(note.id)}
          className="hover:text-destructive"
        >
          <Trash2 className="h-4 w-4" aria-hidden="true" />
        </IconAction>

        <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />

        <IconAction
          label={isRightBarOpen ? MESSAGES.RIGHTBAR_CLOSE : MESSAGES.RIGHTBAR_OPEN}
          onClick={onToggleRightBar}
          className={cn(isRightBarOpen && "text-foreground")}
        >
          {isRightBarOpen ? (
            <PanelRightClose className="h-4 w-4" aria-hidden="true" />
          ) : (
            <PanelRight className="h-4 w-4" aria-hidden="true" />
          )}
        </IconAction>
      </div>
    </div>
  );
};
