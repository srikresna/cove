import { Pin, Star } from "lucide-react";
import type React from "react";
import { useMemo } from "react";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { CollapsibleSection } from "./CollapsibleSection";
import { NoteRow } from "./NoteRow";

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

/**
 * The sidebar's Favorites accordion; Pinned notes live here as a labelled
 * sub-group since both are per-note flags.
 */
export const FavoritesSection: React.FC = () => {
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

  return (
    <CollapsibleSection
      storageKey="cove-library-open"
      label={MESSAGES.LIBRARY_FAVORITES}
      count={pinned.length + favorites.length}
    >
      <Group
        icon={<Pin className="h-3 w-3" aria-hidden="true" />}
        label={MESSAGES.LIBRARY_PINNED}
        notes={pinned}
        activeNoteId={activeNoteId}
        onSelect={setActiveNoteId}
      />
      {/* The favorites sub-label is redundant unless pinned notes sit above. */}
      {pinned.length > 0 ? (
        <Group
          icon={<Star className="h-3 w-3" aria-hidden="true" />}
          label={MESSAGES.LIBRARY_FAVORITES}
          notes={favorites}
          activeNoteId={activeNoteId}
          onSelect={setActiveNoteId}
        />
      ) : (
        favorites.map((note) => (
          <NoteRow
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={setActiveNoteId}
          />
        ))
      )}
    </CollapsibleSection>
  );
};
