import {
  ArrowRightLeft,
  CalendarCheck,
  Copy,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PanelRight,
  PanelRightClose,
  Pin,
  Shapes,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { useEffect, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { journalService } from "../../di/container";
import type { DocMode } from "../../domain/note/Note";
import { useElementWidth } from "../../hooks/useElementWidth";
import { useOpenJournal } from "../../hooks/useOpenJournal";
import { cn } from "../../lib/utils";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import type { Note } from "../../types";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../ui/tooltip";
import { WeekDatePicker } from "../ui/WeekDatePicker";
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
  const propertyVersion = usePropertyStore((s) => s.version);
  const openJournal = useOpenJournal();
  const [journalDate, setJournalDate] = useState<number | null>(null);
  // Journal affordances hide as the header narrows: Today under 300px,
  // TemplateMark under 400px.
  const [headerRef, headerWidth] = useElementWidth<HTMLDivElement>();

  // A journal note's topbar swaps the meta strip for a week calendar
  // navigated by the note's journal date.
  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    let alive = true;
    journalService
      .journalDateOf(note.id)
      .then((ts) => {
        if (alive) setJournalDate(ts);
      })
      .catch(() => {
        if (alive) setJournalDate(null);
      });
    return () => {
      alive = false;
    };
  }, [note.id, propertyVersion]);

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(note.updatedAt);

  return (
    <div
      ref={headerRef}
      className="flex h-10 flex-shrink-0 items-center justify-between border-b bg-card px-3"
    >
      {journalDate != null ? (
        <div className="flex min-w-0 flex-1 items-center gap-3 overflow-hidden">
          {onToggleDocMode && (
            <IconAction
              label={docMode === "edgeless" ? MESSAGES.DOC_MODE_PAGE : MESSAGES.DOC_MODE_CANVAS}
              onClick={onToggleDocMode}
              className={cn(docMode === "edgeless" && "text-primary")}
            >
              <Shapes className="h-4 w-4" aria-hidden="true" />
            </IconAction>
          )}
          <div className="flex min-w-[100px] flex-1 items-center justify-center">
            <WeekDatePicker
              value={journalDate}
              onChange={openJournal}
              className="min-w-0 max-w-[800px]"
            />
          </div>
          {note.isTemplate && headerWidth >= 400 && (
            <span className="flex h-6 shrink-0 items-center rounded bg-primary/10 px-2 text-xs font-medium text-primary">
              {MESSAGES.TEMPLATE_BADGE}
            </span>
          )}
          {(headerWidth === 0 || headerWidth >= 300) && (
            <Button
              variant="secondary"
              size="sm"
              aria-label={MESSAGES.JOURNAL_TODAY}
              onClick={() => openJournal(Date.now())}
              className="h-8 shrink-0 px-2 text-xs font-medium"
            >
              <CalendarCheck className="h-3.5 w-3.5" aria-hidden="true" />
              {MESSAGES.JOURNAL_TODAY}
            </Button>
          )}
          <SaveStatusBadge />
          <span aria-hidden="true" className="h-5 w-px shrink-0 bg-border" />
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="iconSm"
                aria-label="Journal options"
                className="shrink-0 text-muted-foreground"
              >
                <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onSelect={() => toggleFavoriteNote(note.id)}>
                <Star className={cn(note.isFavorite && "text-warm")} aria-hidden="true" />
                <span>{note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onToggleFullWidth}>
                <ArrowRightLeft aria-hidden="true" />
                <span>{isFullWidth ? MESSAGES.STANDARD_WIDTH : MESSAGES.WIDE_WIDTH}</span>
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={onToggleFullscreen}>
                {isFullscreen ? <Minimize2 aria-hidden="true" /> : <Maximize2 aria-hidden="true" />}
                <span>{isFullscreen ? MESSAGES.EXIT_FULL_WINDOW : MESSAGES.FULL_WINDOW}</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                onSelect={() => trashNote(note.id)}
              >
                <Trash2 aria-hidden="true" />
                <span>{MESSAGES.MOVE_TO_TRASH}</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ) : (
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
      )}

      <div className="flex items-center gap-0.5">
        {/* Journal mode owns its actions in the left cluster — only the
            right-bar toggle stays here. */}
        {journalDate == null && (
          <>
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
          </>
        )}

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
