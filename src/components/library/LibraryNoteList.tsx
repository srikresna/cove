import { useVirtualizer } from "@tanstack/react-virtual";
import { Plus } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import { propertyService, tagService } from "../../di/container";
import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import type { FilterableNote } from "../../services/filters/evaluateFilters";
import { evaluateFilters } from "../../services/filters/evaluateFilters";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { NoteItem } from "../sidebar/NoteItem";
import { Button } from "../ui/button";

export type LibrarySort =
  | "updated-desc"
  | "updated-asc"
  | "created-desc"
  | "created-asc"
  | "title-asc"
  | "title-desc";

/**
 * Stale-while-revalidate cache for the bulk-loaded filter/stack inputs.
 * The old sidebar NoteList stayed mounted forever, so its maps persisted
 * across note opens; as a page, this list unmounts on every note open, and
 * rebuilding the maps per mount would flash the UNFILTERED list (rules not
 * applied) before the async loads land. The cache restores the old
 * semantics: mount with the last-known maps for this workspace, revalidate
 * in the background (the version signals still gate freshness).
 */
const listCache = new Map<
  string,
  {
    stackDefs: PropertyDefinition[];
    stackValues: Map<string, Map<string, PropertyValue>> | null;
    filterable: Map<string, FilterableNote> | null;
  }
>();

const compareBy = (sort: LibrarySort) => {
  switch (sort) {
    case "updated-asc":
      return (a: { updatedAt: number }, b: { updatedAt: number }) => a.updatedAt - b.updatedAt;
    case "created-desc":
      return (a: { createdAt: number }, b: { createdAt: number }) => b.createdAt - a.createdAt;
    case "created-asc":
      return (a: { createdAt: number }, b: { createdAt: number }) => a.createdAt - b.createdAt;
    case "title-asc":
      return (a: { title: string }, b: { title: string }) =>
        (a.title || "").localeCompare(b.title || "");
    case "title-desc":
      return (a: { title: string }, b: { title: string }) =>
        (b.title || "").localeCompare(a.title || "");
    default:
      return (a: { updatedAt: number }, b: { updatedAt: number }) => b.updatedAt - a.updatedAt;
  }
};

/**
 * The all-docs list (AFFI NE Explorer equivalent), migrated from the old
 * sidebar NoteList: tag pre-filter + saved-view rules + sort, property
 * stack rows, and the id-keyed dynamic-measurement virtualizer. The
 * component's outer container IS the scroll element — the page keeps its
 * header fixed, like AFFI NE's all-docs page.
 */
export const LibraryNoteList: React.FC<{ sort: LibrarySort }> = ({ sort }) => {
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

  // Property stacks under each note title (AFFI NE docs-view stack rows).
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
      .then(async (defs) => {
        // Stack-eligible custom properties with values load one pass per def.
        const eligible = defs.filter(
          (d) =>
            d.show !== "always-hide" &&
            !d.id.startsWith("system:") &&
            [
              "text",
              "number",
              "date",
              "select",
              "status",
              "multiSelect",
              "checkbox",
              "person",
              "url",
            ].includes(d.type),
        );
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
          listCache.set(activeWorkspaceId, {
            stackDefs: eligible,
            stackValues: byNote,
            filterable: listCache.get(activeWorkspaceId)?.filterable ?? null,
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

  const draftRules = useViewStore((s) => s.draftRules);
  const viewVersion = useViewStore((s) => s.version);

  // Filter inputs (property values + journal dates) reload when rules exist.
  const [filterable, setFilterable] = useState<Map<string, FilterableNote> | null>(
    cached?.filterable ?? null,
  );
  const rulesActive = draftRules.length > 0;

  // biome-ignore lint/correctness/useExhaustiveDependencies: viewVersion/propertyVersion/tagVersion are intentional refresh signals, not body inputs
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
        const tagIdsByNote = new Map<string, string[]>();
        for (const { tagId, noteIds } of tagLists) {
          for (const noteId of noteIds) {
            const ids = tagIdsByNote.get(noteId) ?? [];
            ids.push(tagId);
            tagIdsByNote.set(noteId, ids);
          }
        }
        const map = new Map<string, FilterableNote>();
        for (const note of notes) {
          if (note.workspaceId !== activeWorkspaceId) continue;
          const journal = journalValues.get(note.id);
          map.set(note.id, {
            note,
            propertyValues: new Map(),
            tagIds: tagIdsByNote.get(note.id) ?? [],
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

  const workspaceNotes = useMemo(() => {
    const base = notes.filter(
      (n) =>
        n.workspaceId === activeWorkspaceId && (taggedNoteIds === null || taggedNoteIds.has(n.id)),
    );
    const filtered =
      !rulesActive || !filterable
        ? base
        : evaluateFilters(
            // The cached filterable map may hold stale note objects and may
            // not know notes created since the last visit — always evaluate
            // with the LIVE note, and treat unknown notes as having empty
            // property/tag inputs (true for a just-created note) instead of
            // dropping them from the filtered view.
            base.map((n) => ({
              ...(filterable.get(n.id) ?? {
                note: n,
                propertyValues: new Map(),
                tagIds: [],
                journalTimestamp: null,
              }),
              note: n,
            })),
            draftRules,
          ).map((i) => i.note);
    return [...filtered].sort(compareBy(sort));
  }, [notes, activeWorkspaceId, taggedNoteIds, rulesActive, filterable, draftRules, sort]);

  const stackRowsOf = useCallback(
    (noteId: string): Array<{ def: PropertyDefinition; value: PropertyValue }> => {
      const row = stackValues?.get(noteId);
      if (!row) return [];
      return stackDefs
        .map((def) => {
          const value = row.get(def.id);
          return value ? { def, value } : null;
        })
        .filter((r): r is { def: PropertyDefinition; value: PropertyValue } => r !== null);
    },
    [stackDefs, stackValues],
  );

  const parentRef = useRef<HTMLDivElement>(null);

  // Keyed by note id, not index: notes re-sort under unchanged indexes
  // (journal opens, creates, trash), and an index-keyed measurement cache
  // would stamp each row with the previous occupant's height for a frame —
  // plus stale total sizes for rows outside the window.
  const getItemKey = useCallback(
    (index: number) => workspaceNotes[index]?.id ?? index,
    [workspaceNotes],
  );

  const virtualizer = useVirtualizer({
    count: workspaceNotes.length,
    getScrollElement: () => parentRef.current,
    getItemKey,
    // 54px covers a bare row; property stack rows below the title grow the
    // row, so real heights come from measureElement on each rendered row.
    estimateSize: () => 54,
    measureElement: (element) => element.getBoundingClientRect().height,
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
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mx-auto w-full max-w-4xl px-6">
        <div className="flex items-center justify-between pb-2">
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
      </div>

      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
        <div className="mx-auto w-full max-w-4xl px-6 pb-16">
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
                const note = workspaceNotes[virtualRow.index];
                if (!note) return null;

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
                      // No inline height: the row must be content-sized so
                      // measureElement can observe real heights (stack rows grow
                      // past the 54px estimate); pinning it to virtualRow.size
                      // would freeze measurement at the estimate forever.
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
                      stackRows={stackRowsOf(note.id)}
                    />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
