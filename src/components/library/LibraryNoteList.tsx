import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import { noteService, propertyService, tagService } from "../../di/container";
import type { FilterableNote } from "../../domain/filters/evaluateFilters";
import { type GroupBy, groupNotes, type NoteGroup } from "../../domain/library/grouping";
import {
  isStackEligibleDef,
  type LibrarySort,
  selectNotesForView,
} from "../../domain/library/query";
import type { Note } from "../../domain/note/Note";
import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import { useJournalValuesByNote } from "../../hooks/useJournalValuesByNote";
import { cn } from "../../lib/utils";
import { listCache, writeCachedTagIds } from "../../services/library/libraryListCache";
import { useNoteStore } from "../../store/useNoteStore";
import { useNotificationStore } from "../../store/useNotificationStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { NoteItem } from "../sidebar/NoteItem";
import { isGroupByDef, type LibraryDisplayPrefs } from "./DisplayMenu";
import { NoteCard } from "./NoteCard";
import { SelectionToolbar } from "./SelectionToolbar";

export type { LibrarySort } from "../../domain/library/query";
export type LibraryViewMode = "list" | "grid" | "masonry";

type GroupItem =
  | { kind: "header"; key: string; label: string; count: number; dotColor?: string }
  | { kind: "note"; note: Note; group: string | null };

interface LibraryNoteListProps {
  sort: LibrarySort;
  viewMode: LibraryViewMode;
  prefs: LibraryDisplayPrefs;
  defs: PropertyDefinition[];
}

/**
 * The all-docs list: tag pre-filter + saved-view rules + sort, then three
 * view modes — virtualized list (group headers as virtual rows) or CSS
 * grid/masonry cards — with optional grouping.
 */
export const LibraryNoteList: React.FC<LibraryNoteListProps> = ({
  sort,
  viewMode,
  prefs,
  defs,
}) => {
  const activeWorkspaceId = useWorkspaceStore((s) => s.activeWorkspaceId);
  const {
    notes,
    activeNoteId,
    setActiveNoteId,
    trashNote,
    duplicateNote,
    togglePinNote,
    toggleFavoriteNote,
  } = useNoteStore(
    useShallow((s) => ({
      notes: s.notes,
      activeNoteId: s.activeNoteId,
      setActiveNoteId: s.setActiveNoteId,
      trashNote: s.trashNote,
      duplicateNote: s.duplicateNote,
      togglePinNote: s.togglePinNote,
      toggleFavoriteNote: s.toggleFavoriteNote,
    })),
  );

  // Property stacks under each note title.
  const cached = activeWorkspaceId ? listCache.get(activeWorkspaceId) : undefined;
  const [stackDefs, setStackDefs] = useState<PropertyDefinition[]>(cached?.stackDefs ?? []);
  const [stackValues, setStackValues] = useState<Map<string, Map<string, PropertyValue>> | null>(
    cached?.stackValues ?? null,
  );
  const propertyVersion = usePropertyStore((s) => s.version);

  // biome-ignore lint/correctness/useExhaustiveDependencies: propertyVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    let alive = true;
    propertyService
      .listDefinitions()
      .then(async (allDefs) => {
        // Stack-eligible custom properties with values load one pass per def.
        const eligible = allDefs.filter(isStackEligibleDef);
        if (!alive) return;
        setStackDefs(eligible);
        if (eligible.length === 0) {
          setStackValues(null);
          // Write the empty state through to the cache too, or a deleted
          // last definition replays ghost stack rows on every remount.
          if (activeWorkspaceId) {
            const prev = listCache.get(activeWorkspaceId);
            listCache.set(activeWorkspaceId, {
              stackDefs: [],
              stackValues: null,
              filterable: prev?.filterable ?? null,
              knownEmptyIds: prev?.knownEmptyIds ?? new Set<string>(),
              tagIdsByNote: prev?.tagIdsByNote ?? null,
            });
          }
          return;
        }
        const perDef = await Promise.all(
          eligible.map(async (def) => ({
            propertyId: def.id,
            values: await propertyService.valuesForDefinitionAllNotes(def.id),
          })),
        );
        if (!alive) return;
        const byNote = new Map<string, Map<string, PropertyValue>>();
        for (const { propertyId, values } of perDef) {
          for (const [noteId, value] of values) {
            let row = byNote.get(noteId);
            if (!row) {
              row = new Map();
              byNote.set(noteId, row);
            }
            row.set(propertyId, value);
          }
        }
        setStackValues(byNote);
        if (activeWorkspaceId) {
          const prev = listCache.get(activeWorkspaceId);
          listCache.set(activeWorkspaceId, {
            stackDefs: eligible,
            stackValues: byNote,
            filterable: prev?.filterable ?? null,
            knownEmptyIds: prev?.knownEmptyIds ?? new Set<string>(),
            tagIdsByNote: prev?.tagIdsByNote ?? null,
          });
        }
      })
      .catch(() => {
        if (alive) {
          setStackDefs([]);
          setStackValues(null);
        }
      });
    return () => {
      alive = false;
    };
  }, [propertyVersion]);

  const taggedNoteIds = useTagStore((s) => s.taggedNoteIds);
  const tagVersion = useTagStore((s) => s.version);
  const allTags = useTagStore((s) => s.tags);

  const draftRules = useViewStore((s) => s.draftRules);
  const viewVersion = useViewStore((s) => s.version);
  const activeViewId = useViewStore((s) => s.activeViewId);
  const allViews = useViewStore((s) => s.views);

  // Filter inputs (property values + journal dates) reload when rules exist.
  const [filterable, setFilterable] = useState<Map<string, FilterableNote> | null>(
    cached?.filterable ?? null,
  );
  const rulesActive = draftRules.length > 0;

  // Tag ids per note feed the tags filter rule, group-by-tags AND the tag
  // chips on rows/cards — loaded unconditionally while the Library is
  // mounted (the SWR cache makes repeats cheap).
  const needsTagIds = true;
  const [tagIdsByNote, setTagIdsByNote] = useState<Map<string, string[]> | null>(
    cached?.tagIdsByNote ?? null,
  );

  // biome-ignore lint/correctness/useExhaustiveDependencies: viewVersion/propertyVersion/tagVersion are intentional refresh signals, not body inputs
  useEffect(() => {
    if (!rulesActive) {
      setFilterable(null);
      return;
    }
    let alive = true;
    Promise.all([
      propertyService.valuesForDefinitionAllNotes("system:journal"),
      propertyService.listDefinitions().then((allDefs) =>
        Promise.all(
          allDefs.map(async (def) => ({
            propertyId: def.id,
            values: await propertyService.valuesForDefinitionAllNotes(def.id),
          })),
        ),
      ),
      // Per-tag note ids feed the tags filter rule (tags live in note_tags,
      // not note_properties, so they need their own bulk load).
      tagService
        .listTags(activeWorkspaceId ?? "")
        .then((wsTags) =>
          Promise.all(
            wsTags.map(async (tag) => ({
              tagId: tag.id,
              noteIds: await tagService.notesForTag(tag.id),
            })),
          ),
        )
        .catch(() => [] as Array<{ tagId: string; noteIds: string[] }>),
    ])
      .then(([journalValues, perDef, tagLists]) => {
        if (!alive) return;
        const idsByNote = new Map<string, string[]>();
        for (const { tagId, noteIds } of tagLists) {
          for (const noteId of noteIds) {
            const ids = idsByNote.get(noteId) ?? [];
            ids.push(tagId);
            idsByNote.set(noteId, ids);
          }
        }
        setTagIdsByNote(idsByNote);
        if (activeWorkspaceId) writeCachedTagIds(activeWorkspaceId, idsByNote);
        const map = new Map<string, FilterableNote>();
        for (const note of notes) {
          if (note.workspaceId !== activeWorkspaceId) continue;
          const journal = journalValues.get(note.id);
          map.set(note.id, {
            note,
            propertyValues: new Map(),
            tagIds: idsByNote.get(note.id) ?? [],
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
        if (activeWorkspaceId) {
          const prev = listCache.get(activeWorkspaceId);
          listCache.set(activeWorkspaceId, {
            stackDefs: prev?.stackDefs ?? [],
            stackValues: prev?.stackValues ?? null,
            filterable: map,
            // The fresh map has real entries for every live note, so the
            // just-created markers have served their purpose.
            knownEmptyIds: prev?.knownEmptyIds ?? new Set<string>(),
            tagIdsByNote: prev?.tagIdsByNote ?? null,
          });
        }
      })
      .catch(() => {
        if (alive) setFilterable(null);
      });
    return () => {
      alive = false;
    };
  }, [rulesActive, notes, activeWorkspaceId, viewVersion, propertyVersion, tagVersion]);

  // Standalone tag-id load for group-by-tags without any rules active.
  // biome-ignore lint/correctness/useExhaustiveDependencies: tagVersion is an intentional refresh signal, not a body input
  useEffect(() => {
    if (!needsTagIds || rulesActive) return;
    let alive = true;
    tagService
      .listTags(activeWorkspaceId ?? "")
      .then((wsTags) =>
        Promise.all(
          wsTags.map(async (tag) => ({
            tagId: tag.id,
            noteIds: await tagService.notesForTag(tag.id),
          })),
        ),
      )
      .then((tagLists) => {
        if (!alive) return;
        const idsByNote = new Map<string, string[]>();
        for (const { tagId, noteIds } of tagLists) {
          for (const noteId of noteIds) {
            const ids = idsByNote.get(noteId) ?? [];
            ids.push(tagId);
            idsByNote.set(noteId, ids);
          }
        }
        setTagIdsByNote(idsByNote);
        if (activeWorkspaceId) writeCachedTagIds(activeWorkspaceId, idsByNote);
      })
      .catch(() => {
        if (alive) setTagIdsByNote(null);
      });
    return () => {
      alive = false;
    };
  }, [needsTagIds, rulesActive, activeWorkspaceId, tagVersion, notes]);

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
        knownEmptyIds: activeWorkspaceId
          ? listCache.get(activeWorkspaceId)?.knownEmptyIds
          : undefined,
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

  // ---- Grouping -----------------------------------------------------------

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
      // Ungrouped: bare ids are unique.
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
        // The group qualifier keeps virtualizer keys unique when a note appears
        // under several groups (tag grouping) — duplicate sibling keys would
        // corrupt React reconciliation and the shared measurement cache.
        for (const note of group.notes) items.push({ kind: "note", note, group: group.key });
      }
    }
    return items;
  }, [groups, workspaceNotes, collapsedGroups]);

  // ---- Shared row handlers + stack rows -----------------------------------

  /** Tag chips per note (name+color), gated by the Tags display toggle. */
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

  // ---- Multi-select --------------------------------------------------------

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const anchorIdRef = useRef<string | null>(null);
  const selectMode = selectedIds.size > 0;

  // Escape exits selection mode.
  useEffect(() => {
    if (!selectMode) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedIds(new Set());
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectMode]);

  /** Flat visible order for shift-range selection. */
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
  }, [selectedIds, trashNote]);

  const handleSelect = useCallback(
    (id: string, event?: { ctrlKey: boolean; metaKey: boolean; shiftKey: boolean }) => {
      handleRowClick(id, event);
    },
    [handleRowClick],
  );
  const handleTogglePin = useCallback((id: string) => togglePinNote(id), [togglePinNote]);

  // Manual reorder (custom sort): the service computes the fractional gap;
  // a refresh pulls the new keys into the store.
  const handleReorder = useCallback(
    (id: string, targetId: string, position: "before" | "after") => {
      noteService
        .reorderNote(id, targetId, position)
        .then(() => {
          if (activeWorkspaceId) {
            return useNoteStore.getState().refreshNotesInPlace(activeWorkspaceId);
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
  const handleToggleFavorite = useCallback(
    (id: string) => toggleFavoriteNote(id),
    [toggleFavoriteNote],
  );
  const handleDelete = useCallback((id: string) => trashNote(id), [trashNote]);
  const handleDuplicate = useCallback((id: string) => duplicateNote(id), [duplicateNote]);

  // ---- List mode (virtualized, group headers as virtual rows) -------------

  const parentRef = useRef<HTMLDivElement>(null);

  // Keyed by note id, not index — notes re-sort under unchanged indexes;
  // grouped notes carry their group key so multi-group entries stay unique.
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
    // 54px covers a bare row; headers are 28; real heights come from
    // measureElement (stack rows grow past the estimate).
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
        onTogglePin={handleTogglePin}
        onToggleFavorite={handleToggleFavorite}
        onDuplicate={handleDuplicate}
        onDelete={handleDelete}
        stackRows={stackRowsOf(note.id)}
        tagChips={tagChipsOf(note.id)}
        showIcon={prefs.showIcon}
      />
    ),
    [
      activeNoteId,
      handleSelect,
      handleTogglePin,
      handleToggleFavorite,
      handleDuplicate,
      handleDelete,
      stackRowsOf,
      tagChipsOf,
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
        <span className="truncate">{item.label}</span>
        <span className="shrink-0 font-mono text-xs text-muted-foreground/70">{item.count}</span>
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
                      // No inline height: the row must stay content-sized so
                      // measureElement observes real heights; pinning
                      // virtualRow.size would freeze measurement at the estimate.
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

  // ---- Grid / masonry modes ------------------------------------------------

  const cardLayout = (groupNotes: Note[]) =>
    viewMode === "grid" ? (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-6">
        {groupNotes.map((note) => (
          <NoteCard
            key={note.id}
            note={note}
            isActive={note.id === activeNoteId}
            onSelect={handleSelect}
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            stackRows={stackRowsOf(note.id)}
            tagChips={tagChipsOf(note.id)}
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
            onTogglePin={handleTogglePin}
            onToggleFavorite={handleToggleFavorite}
            onDuplicate={handleDuplicate}
            onDelete={handleDelete}
            stackRows={stackRowsOf(note.id)}
            tagChips={tagChipsOf(note.id)}
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
