import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import { useNoteStore } from "../../store/useNoteStore";
import { useTagStore } from "../../store/useTagStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import { NoteItem } from "./NoteItem";

export const NoteList: React.FC = () => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    createNote,
    trashNote,
    duplicateNote,
    togglePinNote,
    toggleFavoriteNote,
  } = useNoteStore(
    useShallow((s) => ({
      notes: s.notes,
      activeNoteId: s.activeNoteId,
      setActiveNoteId: s.setActiveNoteId,
      createNote: s.createNote,
      trashNote: s.trashNote,
      duplicateNote: s.duplicateNote,
      togglePinNote: s.togglePinNote,
      toggleFavoriteNote: s.toggleFavoriteNote,
    })),
  );

  const taggedNoteIds = useTagStore((s) => s.taggedNoteIds);

  const workspaceNotes = useMemo(
    () =>
      notes.filter(
        (n) =>
          n.workspaceId === activeWorkspaceId &&
          (taggedNoteIds === null || taggedNoteIds.has(n.id)),
      ),
    [notes, activeWorkspaceId, taggedNoteIds],
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: workspaceNotes.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 54,
    overscan: 5,
  });

  const handleSelect = useCallback(
    (id: string) => {
      setActiveNoteId(id);
    },
    [setActiveNoteId],
  );

  const handleTogglePin = useCallback((id: string) => togglePinNote(id), [togglePinNote]);

  const handleToggleFavorite = useCallback(
    (id: string) => toggleFavoriteNote(id),
    [toggleFavoriteNote],
  );

  const handleDelete = useCallback((id: string) => trashNote(id), [trashNote]);

  const handleDuplicate = useCallback((id: string) => duplicateNote(id), [duplicateNote]);

  const handleCreate = useCallback(() => {
    if (!activeWorkspaceId) return;
    createNote(activeWorkspaceId, MESSAGES.UNTITLED_NOTE);
  }, [createNote, activeWorkspaceId]);

  return (
    <div className="space-y-3 h-full flex flex-col">
      <div className="flex items-center justify-between px-1">
        <span className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
          {MESSAGES.NOTES_HEADER} <span className="font-mono">({workspaceNotes.length})</span>
        </span>
        <Button
          variant="secondary"
          size="iconSm"
          aria-label={MESSAGES.CREATE_NEW_NOTE}
          onClick={handleCreate}
        >
          <Plus className="w-4 h-4" aria-hidden="true" />
        </Button>
      </div>

      <div ref={parentRef} className="flex-1 overflow-y-auto relative space-y-1 pr-1">
        <div
          style={{
            height: `${virtualizer.getTotalSize()}px`,
            width: "100%",
            position: "relative",
          }}
        >
          {virtualizer.getVirtualItems().map((virtualRow) => {
            const note = workspaceNotes[virtualRow.index];
            if (!note) return null;

            return (
              <div
                key={virtualRow.key}
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: `${virtualRow.size}px`,
                  transform: `translateY(${virtualRow.start}px)`,
                }}
              >
                <NoteItem
                  note={note}
                  isActive={note.id === activeNoteId}
                  onSelect={handleSelect}
                  onTogglePin={handleTogglePin}
                  onToggleFavorite={handleToggleFavorite}
                  onDuplicate={handleDuplicate}
                  onDelete={handleDelete}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
