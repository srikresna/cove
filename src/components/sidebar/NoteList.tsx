import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useMemo, useRef } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import type { Note } from "../../domain/note/Note";
import { useNoteStore } from "../../store/useNoteStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
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

  const handleTogglePin = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      togglePinNote(id);
    },
    [togglePinNote],
  );

  const handleToggleFavorite = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      toggleFavoriteNote(id);
    },
    [toggleFavoriteNote],
  );

  const handleDelete = useCallback(
    (id: string, e: React.MouseEvent) => {
      e.stopPropagation();
      requestDeleteNote(id);
    },
    [requestDeleteNote],
  );

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
        <span className="text-[10px] font-bold uppercase tracking-wider text-marker-orange">
          {MESSAGES.NOTES_HEADER} ({workspaceNotes.length})
        </span>
        <button
          type="button"
          aria-label={MESSAGES.CREATE_NEW_NOTE}
          onClick={handleCreate}
          className="p-1 rounded-[8px] bg-cream-paper border border-charcoal text-charcoal shadow-paper-lift hover:scale-105 transition-transform outline-none"
        >
          <Plus className="w-3.5 h-3.5 text-marker-orange" aria-hidden="true" />
        </button>
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
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 py-1">
                    {item.title}
                  </div>
                ) : (
                  <NoteItem
                    note={item.note}
                    isActive={item.note.id === activeNoteId}
                    onSelect={handleSelect}
                    onTogglePin={handleTogglePin}
                    onToggleFavorite={handleToggleFavorite}
                    onDelete={handleDelete}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
