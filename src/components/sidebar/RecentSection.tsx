import type React from "react";
import { useMemo } from "react";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { CollapsibleSection } from "./CollapsibleSection";
import { NoteRow } from "./NoteRow";

const RECENT_LIMIT = 5;

/** A short, compact list of the most recently touched notes. */
export const RecentSection: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNoteStore((s) => s.notes);
  const activeNoteId = useNoteStore((s) => s.activeNoteId);
  const setActiveNoteId = useNoteStore((s) => s.setActiveNoteId);

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
