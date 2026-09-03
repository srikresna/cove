import { FileText } from "lucide-react";
import type React from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";

/** Compact sidebar note row shared by Recent and Favorites. */
export const NoteRow: React.FC<{
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
}> = ({ note, isActive, onSelect }) => (
  <button
    type="button"
    onClick={() => onSelect(note.id)}
    className={cn(
      "flex w-full items-center gap-2 rounded-md border px-2.5 py-1.5 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
      isActive
        ? "border-border bg-card font-medium text-foreground shadow-sm"
        : "border-transparent text-muted-foreground hover:bg-accent/50 hover:text-foreground",
    )}
  >
    <span aria-hidden="true" className="shrink-0 text-sm">
      {note.icon || <FileText className="h-3.5 w-3.5 text-muted-foreground" />}
    </span>
    <span className="truncate leading-4">{note.title || MESSAGES.UNTITLED_NOTE}</span>
  </button>
);
