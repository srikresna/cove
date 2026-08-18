import { motion } from "framer-motion";
import { Copy, FileText, MoreHorizontal, Pin, Star, Trash2 } from "lucide-react";
import React from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
}

const updatedTimeFormatter = new Intl.DateTimeFormat("en-US", {
  hour: "2-digit",
  minute: "2-digit",
});

const MenuEntries: React.FC<{
  note: Note;
  onTogglePin: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  onDuplicate: (id: string) => void;
  onDelete: (id: string) => void;
  Item: typeof DropdownMenuItem | typeof ContextMenuItem;
  Separator: typeof DropdownMenuSeparator | typeof ContextMenuSeparator;
}> = ({ note, onTogglePin, onToggleFavorite, onDuplicate, onDelete, Item, Separator }) => (
  <>
    <Item onSelect={() => onTogglePin(note.id)}>
      <Pin className={cn(note.isPinned && "text-primary")} aria-hidden="true" />
      <span>{note.isPinned ? MESSAGES.UNPIN_NOTE : MESSAGES.PIN_NOTE}</span>
    </Item>
    <Item onSelect={() => onToggleFavorite(note.id)}>
      <Star className={cn(note.isFavorite && "text-warm")} aria-hidden="true" />
      <span>{note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}</span>
    </Item>
    <Item onSelect={() => onDuplicate(note.id)}>
      <Copy aria-hidden="true" />
      <span>{MESSAGES.DUPLICATE_NOTE}</span>
    </Item>
    <Separator />
    <Item onSelect={() => onDelete(note.id)} className="text-destructive focus:text-destructive">
      <Trash2 aria-hidden="true" />
      <span>{MESSAGES.MOVE_TO_TRASH}</span>
    </Item>
  </>
);

export const NoteItem: React.FC<NoteItemProps> = React.memo(
  ({ note, isActive, onSelect, onTogglePin, onToggleFavorite, onDuplicate, onDelete }) => {
    const menuHandlers = { note, onTogglePin, onToggleFavorite, onDuplicate, onDelete };
    return (
      <ContextMenu>
        <ContextMenuTrigger asChild>
          <motion.div
            layout
            role="button"
            tabIndex={0}
            aria-label={`Note: ${note.title || MESSAGES.UNTITLED_NOTE}`}
            onClick={() => onSelect(note.id)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(note.id);
              }
            }}
            className={cn(
              "group relative flex w-full cursor-pointer items-center justify-between rounded-md border px-2.5 py-2 text-left transition-colors outline-none focus-visible:ring-2 focus-visible:ring-ring",
              isActive
                ? "border-border bg-card shadow-sm"
                : "border-transparent hover:bg-accent/50",
            )}
          >
            <div className="flex min-w-0 items-center gap-2.5 overflow-hidden">
              <span
                className="flex h-[22px] w-[22px] flex-shrink-0 items-center justify-center text-lg"
                aria-hidden="true"
              >
                {note.icon || <FileText className="h-4 w-4 text-muted-foreground" />}
              </span>
              <div className="min-w-0 truncate">
                <div className="truncate text-[13px] font-medium text-foreground">
                  {note.title || MESSAGES.UNTITLED_NOTE}
                </div>
                <div className="truncate font-mono text-[10px] text-muted-foreground">
                  {note.updatedAt ? updatedTimeFormatter.format(note.updatedAt) : "Just now"}
                </div>
              </div>
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  aria-label={`Note options: ${note.title || MESSAGES.UNTITLED_NOTE}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-shrink-0 rounded-sm p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-accent hover:text-foreground focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring group-hover:opacity-100 data-[state=open]:opacity-100"
                >
                  <MoreHorizontal className="h-4 w-4" aria-hidden="true" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" onClick={(e) => e.stopPropagation()}>
                <MenuEntries
                  {...menuHandlers}
                  Item={DropdownMenuItem}
                  Separator={DropdownMenuSeparator}
                />
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        </ContextMenuTrigger>
        <ContextMenuContent onClick={(e) => e.stopPropagation()}>
          <MenuEntries {...menuHandlers} Item={ContextMenuItem} Separator={ContextMenuSeparator} />
        </ContextMenuContent>
      </ContextMenu>
    );
  },
);
