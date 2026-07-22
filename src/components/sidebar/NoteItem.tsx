import { motion } from "framer-motion";
import { Pin, Star, Trash2 } from "lucide-react";
import React from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";

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
        className={`w-full group flex items-center justify-between p-2.5 rounded-[12px] transition-all cursor-pointer text-left outline-none border-[1.5px] ${
          isActive
            ? "bg-cream-paper border-charcoal shadow-card-subtle scale-[1.01]"
            : "border-transparent hover:bg-dew-drop text-cocoa-ink"
        }`}
      >
        <div className="flex items-center gap-3 overflow-hidden min-w-0">
          <span className="text-xl flex-shrink-0" aria-hidden="true">
            {note.icon || "📝"}
          </span>
          <div className="truncate min-w-0">
            <div className="text-xs font-bold text-cocoa-ink truncate">
              {note.title || MESSAGES.UNTITLED_NOTE}
            </div>
            <div className="text-[10px] font-medium text-slate-400 truncate">
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
            className={`p-1 rounded text-slate-400 hover:text-marker-orange outline-none ${
              note.isPinned ? "text-marker-orange" : ""
            }`}
          >
            <Pin className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={note.isFavorite ? MESSAGES.UNFAVORITE_NOTE : MESSAGES.FAVORITE_NOTE}
            onClick={(e) => onToggleFavorite(note.id, e)}
            className={`p-1 rounded text-slate-400 hover:text-marker-orange outline-none ${
              note.isFavorite ? "text-marker-orange" : ""
            }`}
          >
            <Star className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            aria-label={MESSAGES.DELETE_NOTE}
            onClick={(e) => onDelete(note.id, e)}
            className="p-1 rounded text-slate-400 hover:text-red-600 outline-none"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </motion.button>
    );
  },
);
