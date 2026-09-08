import { useQuery } from "@tanstack/react-query";
import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MESSAGES } from "../../constants/messages";
import { noteService } from "../../di/container";
import { type GroupBy, groupNotes, type NoteGroup } from "../../domain/library/grouping";
import { type LibrarySort, selectNotesForView } from "../../domain/library/query";
import type { Note } from "../../domain/note/Note";
import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import { useJournalValuesByNote } from "../../hooks/useJournalValuesByNote";
import { useNotes } from "../../hooks/useNotes";
import { cn } from "../../lib/utils";
import { extractParagraphs } from "../../services/editor/plainText";
import { noteActions } from "../../store/noteActions";
import {
  fetchLibraryInputs,
  fetchLibraryStacks,
  libraryInputsKey,
  libraryStacksKey,
} from "../../store/queryClient";
import { useNoteUiStore } from "../../store/useNoteUiStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { NoteItem } from "../sidebar/NoteItem";
import { isGroupByDef, type LibraryDisplayPrefs } from "./DisplayMenu";
import { NoteCard } from "./NoteCard";
import { SelectionToolbar } from "./SelectionToolbar";

export type { LibrarySort } from "../../domain/library/query";
export type LibraryViewMode = "list" | "grid" | "masonry";

const PREVIEW_MAX_CHARS = 200;
const previewTextOf = (note: Note, show: boolean): string | null => {
  if (!show) return null;
  const paragraphs = extractParagraphs(note.content);
  if (paragraphs.length === 0) return null;
  const text = paragraphs.slice(0, 2).join(" ").trim();
  if (!text) return null;
  return text.length > PREVIEW_MAX_CHARS ? `${text.slice(0, PREVIEW_MAX_CHARS).trimEnd()}…` : text;
};

type GroupItem =
  | { kind: "header"; key: string; label: string; count: number; dotColor?: string }
  | { kind: "note"; note: Note; group: string | null };

interface LibraryNoteListProps {
  sort: LibrarySort;
  viewMode: LibraryViewMode;
  prefs: LibraryDisplayPrefs;
  defs: PropertyDefinition[];
}

export const LibraryNoteList: React.FC<LibraryNoteListProps> = ({
  sort,
  viewMode,
  prefs,
  defs,
}) => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const notes = useNotes();
  const activeNoteId = useNoteUiStore((s) => s.activeNoteId);
  const setActiveNoteId = useNoteUiStore((s) => s.setActiveNoteId);
  const { duplicateNote, toggleFavoriteNote, togglePinNote, trashNote } = noteActions;

  const { data: stacksData } = useQuery({
    queryKey: libraryStacksKey,
    queryFn: fetchLibraryStacks,
  });
  const stackDefs = stacksData?.stackDefs ?? [];
  const stackValues = stacksData?.stackValues ?? null;

  const taggedNoteIds = useTagStore((s) => s.taggedNoteIds);
  const allTags = useTagStore((s) => s.tags);

  const draftRules = useViewStore((s) => s.draftRules);
  const activeViewId = useViewStore((s) => s.activeViewId);
  const allViews = useViewStore((s) => s.views);

  const { data: inputsData } = useQuery({
    queryKey: libraryInputsKey(activeWorkspaceId ?? ""),
    queryFn: () => fetchLibraryInputs(activeWorkspaceId ?? ""),
    enabled: activeWorkspaceId != null,
    placeholderData: (previous) => previous,
  });
  const filterable = inputsData?.filterable ?? null;
  const tagIdsByNote = inputsData?.tagIdsByNote ?? null;
  const rulesActive = draftRules.length > 0;

  const journalByNoteId = useJournalValuesByNote();

  const workspaceNotes = useMemo(() => {
    const base = notes.filter(
      (n) =>
        n.workspaceId === activeWorkspaceId && (taggedNoteIds === null || taggedNoteIds.has(n.id)),
    );
    return selectNotesForView(
      {
        notes: base,
        rules: draftRules,
        filterable,
        allowNoteIds: allViews.find((v) => v.id === activeViewId)?.allowNoteIds ?? [],
      },
      sort,
    );
  }, [
    notes,
    activeWorkspaceId,
    taggedNoteIds,
    filterable,
    draftRules,
    sort,
    allViews,
    activeViewId,
  ]);

  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const toggleGroup = useCallback((key: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const groups: NoteGroup[] | null = useMemo(() => {
    if (prefs.groupBy === "none") return null;
    const groupBy: GroupBy = isGroupByDef(prefs.groupBy)
      ? { defId: prefs.groupBy.defId }
      : prefs.groupBy;
    return groupNotes({
      groupBy,
      notes: workspaceNotes,
      allTags,
      tagIdsByNote,
      journalByNoteId,
      stackValues,
      stackDefs,
      defs,
    });
  }, [
    prefs.groupBy,
    workspaceNotes,
    tagIdsByNote,
    allTags,
    journalByNoteId,
    stackValues,
    stackDefs,
    defs,
  ]);

  const visibleItems = useMemo<GroupItem[]>(() => {
    if (!groups) {
      return workspaceNotes.map((note) => ({ kind: "note", note, group: null }) as GroupItem);
    }
    const items: GroupItem[] = [];
    for (const group of groups) {
      items.push({
        kind: "header",
        key: group.key,
        label: group.label,
        count: group.notes.length,
        dotColor: group.dotColor,
      });
      if (!collapsedGroups.has(group.key)) {
        for (const note of group.notes) items.push({ kind: "note", note, group: group.key });
      }
    }
    return items;
  }, [groups, workspaceNotes, collapsedGroups]);

  const tagChipsOf = useCallback(
    (noteId: string): Array<{ name: string; color: string }> => {
      if (prefs.hiddenProps.includes("tags")) return [];
      const ids = tagIdsByNote?.get(noteId);
      if (!ids || ids.length === 0) return [];
      return ids
        .map((id) => allTags.find((tag) => tag.id === id))
        .filter((tag): tag is NonNullable<typeof tag> => tag != null)
        .map((tag) => ({ name: tag.name, color: tag.color }));
    },
    [prefs.hiddenProps, tagIdsByNote, allTags],
  );

  const stackRowsOf = useCallback(
    (noteId: string): Array<{ def: PropertyDefinition; value: PropertyValue }> => {
      if (!prefs.showBody) return [];
      const row = stackValues?.get(noteId);
      if (!row) return [];
      return stackDefs
        .filter((def) => !prefs.hiddenProps.includes(def.id))
        .map((def) => {
          const value = row.get(def.id);
          return value ? { def, value } : null;
        })
        .filter((r): r is { def: PropertyDefinition; value: PropertyValue } => r !== null);
    },
    [stackDefs, stackValues, prefs.showBody, prefs.hiddenProps],
  );

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const anchorIdRef = useRef<string | null>(null);
  const selectMode = selectedIds.size > 0;

  useEffect(() => {
    if (!selectMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIds(new Set());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectMode]);

  const orderedNoteIds = useMemo(
    () => visibleItems.flatMap((item): string[] => (item.kind === "note" ? [item.note.id] : [])),
    [visibleItems],
  );

  const toggleSelected = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleRowClick = useCallback(
    (id: string, event?: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
      const rangeClick = event?.shiftKey ?? false;
      const toggleClick = event?.ctrlKey || event?.metaKey || false;
      if (toggleClick) {
        anchorIdRef.current = id;
        toggleSelected(id);
        return;
      }
      if (rangeClick && anchorIdRef.current !== null) {
        const from = orderedNoteIds.indexOf(anchorIdRef.current);
        const to = orderedNoteIds.indexOf(id);
        if (from !== -1 && to !== -1) {
          const [lo, hi] = from < to ? [from, to] : [to, from];
          setSelectedIds(new Set(orderedNoteIds.slice(lo, hi + 1)));
          return;
        }
      }
      anchorIdRef.current = id;
      if (selectedIds.size > 0) {
        toggleSelected(id);
        return;
      }
      setActiveNoteId(id);
    },
    [orderedNoteIds, selectedIds.size, setActiveNoteId, toggleSelected],
  );

  const handleBulkTrash = useCallback(() => {
    const ids = [...selectedIds];
    setSelectedIds(new Set());
    for (const id of ids) void trashNote(id);
    useNotificationStore.getState().pushToast({
      kind: "info",
      title: MESSAGES.LIBRARY_MOVED_N.replace("{n}", String(ids.length)),
    });
  }, [selectedIds]);

  const handleSelect = useCallback(
    (id: string, event?: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
      handleRowClick(id, event);
    },
    [handleRowClick],
  );
  const handleReorder = useCallback(
    (id: string, targetId: string, position: "before" | "after") => {
      noteService
        .reorderNote(id, targetId, position)
        .then(() => {
          if (activeWorkspaceId) {
            return noteActions.refreshNotesInPlace(activeWorkspaceId);
          }
        })
        .catch(() => {
          useNotificationStore.getState().pushToast({
            kind: "error",
            title: MESSAGES.SOMETHING_WENT_WRONG,
          });
        });
    },
    [activeWorkspaceId],
  );

  const parentRef = useRef<HTMLDivElement>(null);

  const getItemKey = useCallback(
    (index: number) => {
      const item = visibleItems[index];
      if (!item) return index;
      if (item.kind === "header") return `header:${item.key}`;
      return item.group !== null ? `${item.group}:${item.note.id}` : item.note.id;
    },
    [visibleItems],
  );

  const virtualizer = useVirtualizer({
    count: visibleItems.length,
    getScrollElement: () => parentRef.current,
    getItemKey,
    estimateSize: (index) => (visibleItems[index]?.kind === "header" ? 28 : 54),
    measureElement: (element) => element.getBoundingClientRect().height,
    overscan: 5,
  });

  const dragHandlesVisible = viewMode === "list" && sort === "custom";
  const renderNote = useCallback(
    (note: Note) => (
      <NoteItem
        note={note}
        isActive={note.id === activeNoteId}
        isSelected={selectedIds.has(note.id)}
        selectionMode={selectMode}
        showDragHandle={dragHandlesVisible}
        onReorder={dragHandlesVisible ? handleReorder : undefined}
        onSelect={handleSelect}
        onTogglePin={togglePinNote}
        onToggleFavorite={toggleFavoriteNote}
        onDuplicate={duplicateNote}
        onDelete={trashNote}
        stackRows={stackRowsOf(note.id)}
        tagChips={tagChipsOf(note.id)}
        previewText={previewTextOf(note, prefs.showBody)}
        showIcon={prefs.showIcon}
      />
    ),
    [
      activeNoteId,
      handleSelect,
      stackRowsOf,
      tagChipsOf,
      prefs.showBody,
      selectedIds,
      selectMode,
      dragHandlesVisible,
      handleReorder,
      prefs.showIcon,
    ],
  );

  const renderGroupHeader = useCallback(
    (item: Extract<GroupItem, { kind: "header" }>, onClick: () => void) => (
      <button
        type="button"
        onClick={onClick}
        aria-expanded={!collapsedGroups.has(item.key)}
        className="flex h-7 w-full items-center gap-1 rounded-md px-1 text-left text-[15px] leading-6 text-muted-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <ChevronRight
          className={cn(
            "h-4 w-4 shrink-0 transition-transform",
            !collapsedGroups.has(item.key) && "rotate-90",
          )}
          aria-hidden="true"
        />
        {item.dotColor && (
          <span
            aria-hidden="true"
            className="h-2 w-2 shrink-0 rounded-full"
            style={{ backgroundColor: item.dotColor }}
          />
        )}
        <span className="truncate leading-6">{item.label}</span>
        <span className="shrink-0 font-mono text-xs leading-4 text-muted-foreground/70">
          {item.count}
        </span>
      </button>
    ),
    [collapsedGroups],
  );

  if (viewMode === "list") {
    return (
      <div ref={parentRef} className="relative min-h-0 flex-1 overflow-y-auto">
        {selectMode && (
          <SelectionToolbar
            count={selectedIds.size}
            onBulkTrash={handleBulkTrash}
            onClear={() => setSelectedIds(new Set())}
          />
        )}
        <div className="mx-auto w-full max-w-4xl px-6 pb-16 pt-2">
          {workspaceNotes.length === 0 && (rulesActive || taggedNoteIds !== null) ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              {MESSAGES.LIBRARY_EMPTY_FILTERED}
            </p>
          ) : (
            <div
              style={{
                height: `${virtualizer.getTotalSize()}px`,
                width: "100%",
                position: "relative",
              }}
            >
              {virtualizer.getVirtualItems().map((virtualRow) => {
                const item = visibleItems[virtualRow.index];
                if (!item) return null;

                return (
                  <div
                    key={virtualRow.key}
                    data-index={virtualRow.index}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {item.kind === "header"
                      ? renderGroupHeader(item, () => toggleGroup(item.key))
                      : renderNote(item.note)}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    );
  }

  const cardLayout = (groupNotes: Note[]) =>
    viewMode === "grid" ? (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
        {groupNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={handleSelect}
            onTogglePin={togglePinNote}
            onToggleFavorite={toggleFavoriteNote}
            onDuplicate={duplicateNote}
            onDelete={trashNote}
            stackRows={stackRowsOf(note.id)}
            tagChips={tagChipsOf(note.id)}
            previewText={previewTextOf(note, prefs.showBody)}
            variant="grid"
          />
        ))}
      </div>
    ) : (
      <div className="gap-6 [column-width:220px] [column-fill:balance]">
        {groupNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={handleSelect}
            onTogglePin={togglePinNote}
            onToggleFavorite={toggleFavoriteNote}
            onDuplicate={duplicateNote}
            onDelete={trashNote}
            stackRows={stackRowsOf(note.id)}
            tagChips={tagChipsOf(note.id)}
            previewText={previewTextOf(note, prefs.showBody)}
            variant="masonry"
          />
        ))}
      </div>
    );

  return (
    <div className="relative min-h-0 flex-1 overflow-y-auto">
      {selectMode && (
        <SelectionToolbar
          count={selectedIds.size}
          onBulkTrash={handleBulkTrash}
          onClear={() => setSelectedIds(new Set())}
        />
      )}
      <div className="mx-auto w-full max-w-5xl px-6 pb-16 pt-4">
        {workspaceNotes.length === 0 && (rulesActive || taggedNoteIds !== null) ? (
          <p className="py-10 text-center text-sm text-muted-foreground">
            {MESSAGES.LIBRARY_EMPTY_FILTERED}
          </p>
        ) : groups ? (
          <div className="space-y-6">
            {groups.map((group) => (
              <section key={group.key}>
                <div className="sticky top-0 z-[1] -mx-1 bg-background/95 px-1 pb-1 pt-2 backdrop-blur-sm">
                  {renderGroupHeader(
                    {
                      kind: "header",
                      key: group.key,
                      label: group.label,
                      count: group.notes.length,
                      dotColor: group.dotColor,
                    },
                    () => toggleGroup(group.key),
                  )}
                </div>
                {!collapsedGroups.has(group.key) && cardLayout(group.notes)}
              </section>
            ))}
          </div>
        ) : (
          cardLayout(workspaceNotes)
        )}
      </div>
    </div>
  );
};
