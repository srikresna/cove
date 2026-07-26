import { motion } from "framer-motion";
import { Pin, Star, Trash2 } from "lucide-react";
import React from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onTogglePin: (id: string, e: React.MouseEvent) => void;
  onToggleFavorite: (id: string, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const NoteItem: React.FC<NoteItemProps> = React.memo(
  ({ note, isActive, onSelect, onTogglePin, onToggleFavorite, onDelete }) => {
    return (
      <motion.button
        type="button"
        layout
        aria-label={`Note: ${note.title || MESSAGES.UNTITLED_NOTE}`}
        onClick={() => onSelect(note.id)}
        className={cn(
          "group relative flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left transition-colors outline-none",
          isActive ? "bg-accent" : "hover:bg-accent/60",
        )}
      >
        {isActive && (
          <span
            aria-hidden="true"
            className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary"
          />
        )}
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            {note.icon || "📝"}
          </span>
          <div className="truncate min-w-0">
            <div className="truncate text-[13px] font-medium text-foreground">
              {note.title || MESSAGES.UNTITLED_NOTE}
            </div>
            <div className="truncate font-mono text-[10px] text-muted-foreground">
              {note.updatedAt
                ? new Intl.DateTimeFormat("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  }).format(note.updatedAt)
                : "Just now"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            type="button"
            aria-label={note.isPinned ? MESSAGES.UNPIN_NOTE : MESSAGES.PIN_NOTE}
            onClick={(e) => onTogglePin(note.id, e)}
            className={cn(
              "rounded-sm p-1 text-muted-foreground transition-colors hover:text-primary focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              note.isPinned && "text-primary",
            )}
          >
            <Pin className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
            onClick={(e) => onToggleFavorite(note.id, e)}
            className={cn(
              "rounded-sm p-1 text-muted-foreground transition-colors hover:text-warm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
              note.isFavorite && "text-warm",
            )}
          >
            <Star className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={MESSAGES.DELETE_NOTE}
            onClick={(e) => onDelete(note.id, e)}
            className="rounded-sm p-1 text-muted-foreground transition-colors hover:text-destructive focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.button>
    );
  },
);
