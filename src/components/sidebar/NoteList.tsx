import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { useNoteStore } from "../../store/useNoteStore";
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
    requestDeleteNote,
    togglePinNote,
    toggleFavoriteNote,
  } = useNoteStore(
    useShallow((s) => ({
      notes: s.notes,
      activeNoteId: s.activeNoteId,
      setActiveNoteId: s.setActiveNoteId,
      createNote: s.createNote,
      requestDeleteNote: s.requestDeleteNote,
      togglePinNote: s.togglePinNote,
      toggleFavoriteNote: s.toggleFavoriteNote,
    })),
  );

  const workspaceNotes = useMemo(
    () => notes.filter((n) => n.workspaceId === activeWorkspaceId),
    [notes, activeWorkspaceId],
  );

  const pinnedNotes = useMemo(() => workspaceNotes.filter((n) => n.isPinned), [workspaceNotes]);
  const favoriteNotes = useMemo(
    () => workspaceNotes.filter((n) => n.isFavorite && !n.isPinned),
    [workspaceNotes],
  );
  const otherNotes = useMemo(
    () => workspaceNotes.filter((n) => !n.isPinned && !n.isFavorite),
    [workspaceNotes],
  );

  const combinedItems = useMemo(() => {
    const items: Array<{ type: "header"; title: string } | { type: "note"; note: Note }> = [];

    if (pinnedNotes.length > 0) {
      items.push({ type: "header", title: "Pinned Notes" });
      items.push(...pinnedNotes.map((note) => ({ type: "note" as const, note })));
    }

    if (favoriteNotes.length > 0) {
      items.push({ type: "header", title: "Favorite Notes" });
      items.push(...favoriteNotes.map((note) => ({ type: "note" as const, note })));
    }

    items.push({ type: "header", title: "All Notes" });
    items.push(...otherNotes.map((note) => ({ type: "note" as const, note })));

    return items;
  }, [pinnedNotes, favoriteNotes, otherNotes]);

  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: combinedItems.length,
    getScrollElement: () => parentRef.current,
    estimateSize: (index) => (combinedItems[index]?.type === "header" ? 32 : 54),
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

  const handleDelete = useCallback((id: string) => requestDeleteNote(id), [requestDeleteNote]);

  const handleCreate = useCallback(() => {
    if (!activeWorkspaceId) return;
    createNote(
      activeWorkspaceId,
      MESSAGES.UNTITLED_NOTE,
      '[{"type":"paragraph","content":[]}]',
      "📝",
    );
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
            const item = combinedItems[virtualRow.index];
            if (!item) return null;

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
                {item.type === "header" ? (
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                    {item.title}
                  </div>
                ) : (
                  <div className="ml-2 h-full border-l pl-2">
                    <NoteItem
                      note={item.note}
                      isActive={item.note.id === activeNoteId}
                      onSelect={handleSelect}
                      onTogglePin={handleTogglePin}
                      onToggleFavorite={handleToggleFavorite}
                      onDelete={handleDelete}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
