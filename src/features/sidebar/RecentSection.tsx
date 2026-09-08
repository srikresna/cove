import type React from "react";
import { useMemo } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNotes } from "../../hooks/useNotes";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { CollapsibleSection } from "./CollapsibleSection";
import { NoteRow } from "./NoteRow";

const RECENT_LIMIT = 5;

export const RecentSection: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNotes();
  const activeNoteId = useNoteUiStore((s) => s.activeNoteId);
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);

  const recent = useMemo(
    () =>
      notes
        .filter((n) => n.workspaceId === activeWorkspaceId && !n.isTemplate)
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, RECENT_LIMIT),
    [notes, activeWorkspaceId],
  );

  if (recent.length === 0) return null;

  return (
    <CollapsibleSection storageKey="cove-recent-open" label={MESSAGES.RECENT_HEADER}>
      {recent.map((note) => (
        <NoteRow
          key={note.id}
          note={note}
          isActive={note.id === activeNoteId}
          onSelect={setActiveNoteId}
        />
      ))}
    </CollapsibleSection>
  );
};
