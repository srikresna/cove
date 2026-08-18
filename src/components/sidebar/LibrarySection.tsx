import { ChevronDown, ChevronRight, FileText, Pin, Star } from "lucide-react";
import type React from "react";
import { useMemo, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { cn } from "../../lib/utils";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";

const OPEN_KEY = "cove-library-open";

const NoteRow: React.FC<{
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
    <span className="truncate">{note.title || MESSAGES.UNTITLED_NOTE}</span>
  </button>
);

const Group: React.FC<{
  icon: React.ReactNode;
  label: string;
  notes: Note[];
  activeNoteId: string | null;
  onSelect: (id: string) => void;
}> = ({ icon, label, notes, activeNoteId, onSelect }) => {
  if (notes.length === 0) return null;
  return (
    <div className="space-y-0.5">
      <div className="flex items-center gap-1.5 px-1 pt-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
        {icon}
        {label} <span className="font-mono">({notes.length})</span>
      </div>
      {notes.map((note) => (
        <NoteRow
          key={note.id}
          note={note}
          isActive={note.id === activeNoteId}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
};

export const LibrarySection: React.FC = () => {
  const [isOpen, setIsOpen] = useState(() => localStorage.getItem(OPEN_KEY) !== "false");
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNoteStore((s) => s.notes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );
  const pinned = useMemo(() => workspaceNotes.filter((n) => n.isPinned), [workspaceNotes]);
  const favorites = useMemo(() => workspaceNotes.filter((n) => n.isFavorite), [workspaceNotes]);

  if (pinned.length === 0 && favorites.length === 0) return null;

  const toggleOpen = () => {
    const next = !isOpen;
    setIsOpen(next);
    localStorage.setItem(OPEN_KEY, String(next));
  };

  return (
    <div className="space-y-1 pb-2">
      <button
        type="button"
        onClick={toggleOpen}
        aria-expanded={isOpen}
        className="flex w-full items-center gap-1 rounded px-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {isOpen ? (
          <ChevronDown className="h-3 w-3" aria-hidden="true" />
        ) : (
          <ChevronRight className="h-3 w-3" aria-hidden="true" />
        )}
        {MESSAGES.LIBRARY_HEADER}
      </button>

      {isOpen && (
        <div className="space-y-1.5">
          <Group
            icon={<Pin className="h-3 w-3" aria-hidden="true" />}
            label={MESSAGES.LIBRARY_PINNED}
            notes={pinned}
            activeNoteId={activeNoteId}
            onSelect={setActiveNoteId}
          />
          <Group
            icon={<Star className="h-3 w-3" aria-hidden="true" />}
            label={MESSAGES.LIBRARY_FAVORITES}
            notes={favorites}
            activeNoteId={activeNoteId}
            onSelect={setActiveNoteId}
          />
        </div>
      )}
    </div>
  );
};
