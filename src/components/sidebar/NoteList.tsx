import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus, X } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import { propertyService } from "../../di/container";
import type { FilterableNote } from "../../services/filters/evaluateFilters";
import { evaluateFilters } from "../../services/filters/evaluateFilters";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { Button } from "../ui/button";
import { FilterBar } from "./FilterBar";
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
  const activeTagId = useTagStore((s) => s.activeTagId);
  const tags = useTagStore((s) => s.tags);
  const setTagFilter = useTagStore((s) => s.setTagFilter);
  const activeTag = tags.find((t) => t.id === activeTagId);

  const draftRules = useViewStore((s) => s.draftRules);
  const viewVersion = useViewStore((s) => s.version);
  const propertyVersion = usePropertyStore((s) => s.version);

  // Filter inputs (property values + journal dates) reload when rules exist.
  const [filterable, setFilterable] = useState<Map<string, FilterableNote> | null>(null);
  const rulesActive = draftRules.length > 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: viewVersion/propertyVersion are intentional refresh signals, not body inputs
  useEffect(() => {
    if (!rulesActive) {
      setFilterable(null);
      return;
    }
    let alive = true;
    Promise.all([
      propertyService.valuesForDefinitionAllNotes("system:journal"),
      propertyService.listDefinitions().then((defs) =>
        Promise.all(
          defs.map(async (def) => ({
            propertyId: def.id,
            values: await propertyService.valuesForDefinitionAllNotes(def.id),
          })),
        ),
      ),
    ])
      .then(([journalValues, perDef]) => {
        if (!alive) return;
        const map = new Map<string, FilterableNote>();
        for (const note of notes) {
          if (note.workspaceId !== activeWorkspaceId) continue;
          const journal = journalValues.get(note.id);
          map.set(note.id, {
            note,
            propertyValues: new Map(),
            tagIds: [],
            journalTimestamp:
              journal?.type === "date" ? (journal as { timestamp: number }).timestamp : null,
          });
        }
        for (const { propertyId, values } of perDef) {
          for (const [noteId, value] of values) {
            map.get(noteId)?.propertyValues.set(propertyId, value);
          }
        }
        setFilterable(map);
      })
      .catch(() => {
        if (alive) setFilterable(null);
      });
    return () => {
      alive = false;
    };
  }, [rulesActive, notes, activeWorkspaceId, viewVersion, propertyVersion]);

  const workspaceNotes = useMemo(() => {
    const base = notes.filter(
      (n) =>
        n.workspaceId === activeWorkspaceId && (taggedNoteIds === null || taggedNoteIds.has(n.id)),
    );
    if (!rulesActive || !filterable) return base;
    const items = base
      .map((n) => filterable.get(n.id))
      .filter((i): i is FilterableNote => i != null);
    return evaluateFilters(items, draftRules).map((i) => i.note);
  }, [notes, activeWorkspaceId, taggedNoteIds, rulesActive, filterable, draftRules]);

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

      {activeTag && (
        <div className="flex items-center justify-between gap-1 rounded-md border bg-card px-2 py-1">
          <span className="flex min-w-0 items-center gap-1.5 text-xs text-foreground">
            <span
              aria-hidden="true"
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: activeTag.color }}
            />
            <span className="truncate">{activeTag.name}</span>
          </span>
          <button
            type="button"
            aria-label={MESSAGES.TAG_FILTER_CLEAR}
            onClick={() => void setTagFilter(null)}
            className="shrink-0 rounded p-0.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="h-3 w-3" aria-hidden="true" />
          </button>
        </div>
      )}

      <FilterBar />

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
