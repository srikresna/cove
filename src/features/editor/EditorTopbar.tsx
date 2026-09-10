import {
  ArrowRightLeft,
  Copy,
  FileText,
  Maximize2,
  Minimize2,
  MoreHorizontal,
  PanelRight,
  Pin,
  Shapes,
  Star,
  Trash2,
} from "lucide-react";
import type React from "react";
import { Button } from "../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Tooltip, TooltipContent, TooltipTrigger } from "../../components/ui/tooltip";
import { MESSAGES } from "../../constants/messages";
import type { DocMode, Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { noteActions } from "../../store/noteActions";
import { SaveStatusBadge } from "./SaveStatusBadge";
import { SegmentedIconGroup } from "./SegmentedIconGroup";

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
  onToggleRightBar: (viaKeyboard: boolean) => void;
  openToggleRef?: React.Ref<HTMLButtonElement>;
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

const DocModeSwitch: React.FC<{
  docMode: DocMode;
  onToggle: () => void;
  className?: string;
}> = ({ docMode, onToggle, className }) => (
  <SegmentedIconGroup
    aria-label={MESSAGES.DOC_MODE}
    className={className}
    items={[
      { value: "page", label: MESSAGES.DOC_MODE_PAGE_SEGMENT, icon: FileText },
      { value: "edgeless", label: MESSAGES.DOC_MODE_EDGELESS_SEGMENT, icon: Shapes },
    ]}
    value={docMode}
    onChange={(next) => {
      if (next !== docMode) onToggle();
    }}
  />
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
  openToggleRef,
}) => {
  const trashNote = noteActions.trashNote;
  const duplicateNote = noteActions.duplicateNote;
  const togglePinNote = noteActions.togglePinNote;
  const toggleFavoriteNote = noteActions.toggleFavoriteNote;

  const formattedDate = new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(note.updatedAt);

  const renderOverflowMenu = (includeFavorite: boolean) => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="iconSm"
          aria-label={MESSAGES.TOPBAR_MORE}
          className="shrink-0 text-muted-foreground"
        >
          <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {includeFavorite && (
          <DropdownMenuItem onSelect={() => toggleFavoriteNote(note.id)}>
            <Star className={cn(note.isFavorite && "text-warm")} aria-hidden="true" />
            <span>{note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}</span>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onSelect={onToggleFullWidth}>
          <ArrowRightLeft aria-hidden="true" />
          <span>{isFullWidth ? MESSAGES.STANDARD_WIDTH : MESSAGES.WIDE_WIDTH}</span>
        </DropdownMenuItem>
        <DropdownMenuItem onSelect={() => duplicateNote(note.id)}>
          <Copy aria-hidden="true" />
          <span>{MESSAGES.DUPLICATE_NOTE}</span>
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
  );

  return (
    <div className="flex h-10 flex-shrink-0 items-center justify-between border-b bg-card px-3">
      <div className="flex min-w-0 items-center gap-x-3 overflow-hidden whitespace-nowrap font-mono text-[11px] leading-4 text-muted-foreground">
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
        {note.isTemplate && (
          <span className="flex h-6 shrink-0 items-center rounded bg-primary/10 px-2 text-xs font-medium text-primary">
            {MESSAGES.TEMPLATE_BADGE}
          </span>
        )}
        <SaveStatusBadge />
      </div>

      <div className="flex items-center gap-0.5">
        {onToggleDocMode && docMode && (
          <DocModeSwitch docMode={docMode} onToggle={onToggleDocMode} />
        )}

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

        {renderOverflowMenu(false)}

        {!isRightBarOpen && (
          <>
            <span aria-hidden="true" className="mx-1 h-4 w-px bg-border" />
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  ref={openToggleRef}
                  variant="ghost"
                  size="iconSm"
                  aria-label={MESSAGES.RIGHTBAR_OPEN}
                  onClick={(e) => onToggleRightBar(e.detail === 0)}
                  className="text-muted-foreground"
                >
                  <PanelRight className="h-4 w-4" aria-hidden="true" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">{MESSAGES.RIGHTBAR_OPEN}</TooltipContent>
            </Tooltip>
          </>
        )}
      </div>
    </div>
  );
};
