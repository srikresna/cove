import { useVirtualizer } from "@tanstack/react-virtual";
import { ChevronRight } from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useShallow } from "zustand/react/shallow";
import { MESSAGES } from "../../constants/messages";
import { propertyService, tagService } from "../../di/container";
import type { FilterRule } from "../../domain/filters/FilterRule";
import { isRuleComplete } from "../../domain/filters/FilterRule";
import type { Note } from "../../domain/note/Note";
import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import { useJournalValuesByNote } from "../../hooks/useJournalValuesByNote";
import { cn } from "../../lib/utils";
import type { FilterableNote } from "../../services/filters/evaluateFilters";
import { evaluateFilters } from "../../services/filters/evaluateFilters";
import { useNoteStore } from "../../store/useNoteStore";
import { usePropertyStore } from "../../store/usePropertyStore";
import { useTagStore } from "../../store/useTagStore";
import { useViewStore } from "../../store/useViewStore";
import { useWorkspaceStore } from "../../store/useWorkspaceStore";
import { NoteItem, stackValueText } from "../sidebar/NoteItem";
import { isGroupByDef, type LibraryDisplayPrefs } from "./DisplayMenu";
import { listCache, writeCachedTagIds } from "./libraryListCache";
import { NoteCard } from "./NoteCard";

export type LibrarySort =
  | "updated-desc"
  | "updated-asc"
  | "created-desc"
  | "created-asc"
  | "title-asc"
  | "title-desc";

export type LibraryViewMode = "list" | "grid" | "masonry";

/**
 * Stale-while-revalidate cache for the bulk-loaded filter/stack inputs
 * (see ./libraryListCache — kept module-level so the note store can seed
 * just-created notes into it). The old sidebar NoteList stayed mounted
 * forever, so its maps persisted across note opens; as a page, this list
 * unmounts on every note open, and rebuilding the maps per mount would
 * flash the UNFILTERED list (rules not applied) before the async loads
 * land. The cache restores the old semantics: mount with the last-known
 * maps, revalidate in the background (the version signals still gate
 * freshness).
 */

/**
 * Rules whose predicate EMPTY inputs would satisfy (is-empty everywhere,
 * tags has-none-of, journal-is-false, checkbox-is-false). For a note with
 * UNKNOWN inputs (absent from the SWR cache — could be brand-new and truly
 * empty, or could have acquired values while the page was unmounted, e.g.
 * today's journal is created WITH its journal date), fabricated emptiness
 * must not decide these predicates: such views defer unknown notes to
 * revalidation (brief omission reads as loading; admission-then-vanish
 * reads as a glitch). Views without these rules keep unknown notes visible
 * immediately — live-note-field rules (template) and positive rules decide
 * on data we actually have.
 */
function satisfiedByEmptyInputs(rule: FilterRule): boolean {
  switch (rule.kind) {
    case "text":
    case "number":
    case "date":
    case "select":
    case "multiSelect":
      return rule.op === "is-empty";
    case "tags":
      return rule.op === "is-empty" || rule.op === "has-none-of";
    case "journal":
      return rule.value === false;
    case "checkbox":
      return rule.value === false;
    default:
      return false;
  }
}

const compareBy = (sort: LibrarySort) => {
  switch (sort) {
    case "updated-asc":
      return (a: Note, b: Note) => a.updatedAt - b.updatedAt;
    case "created-desc":
      return (a: Note, b: Note) => b.createdAt - a.createdAt;
    case "created-asc":
      return (a: Note, b: Note) => a.createdAt - b.createdAt;
    case "title-asc":
      return (a: Note, b: Note) => (a.title || "").localeCompare(b.title || "");
    case "title-desc":
      return (a: Note, b: Note) => (b.title || "").localeCompare(a.title || "");
    default:
      return (a: Note, b: Note) => b.updatedAt - a.updatedAt;
  }
};

const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

const relativeDayLabel = (ts: number): string => {
  const now = new Date();
  const days = Math.floor(
    (new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime() - startOfDay(ts)) /
      86400000,
  );
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;
  return new Date(ts).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

/**
 * The all-docs list (AFFI NE Explorer equivalent): tag pre-filter +
 * saved-view rules + sort, then AFFI NE's three view modes — virtualized
 * list (group headers as virtual rows) or CSS grid/masonry card layouts —
 * with optional grouping by tags/journal/created/updated/custom property.
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
      .then(async (allDefs) => {
        // Stack-eligible custom properties with values load one pass per def.
        const eligible = allDefs.filter(
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
    // Defer cache-unknown notes only when some rule's predicate empty inputs
    // would satisfy (see satisfiedByEmptyInputs) — counting only rules the
    // evaluator actually applies. Notes the app itself just created are
    // provably empty and bypass the deferral.
    const knownEmptyIds = activeWorkspaceId
      ? listCache.get(activeWorkspaceId)?.knownEmptyIds
      : undefined;
    const deferUnknown = draftRules.filter(isRuleComplete).some(satisfiedByEmptyInputs);
    const filtered =
      !rulesActive || !filterable
        ? base
        : evaluateFilters(
            // The cached filterable map may hold stale note objects and may
            // not know notes created since the last visit — always evaluate
            // with the LIVE note. Notes absent from the cache are
            // synthesized with empty inputs ONLY in views where fabricated
            // emptiness cannot decide the outcome; views with
            // emptiness-satisfiable rules defer them to revalidation.
            base
              .filter(
                (n) => !deferUnknown || filterable.has(n.id) || (knownEmptyIds?.has(n.id) ?? false),
              )
              .map((n) => ({
                ...(filterable.get(n.id) ?? {
                  note: n,
                  propertyValues: new Map<string, PropertyValue>(),
                  tagIds: [],
                  journalTimestamp: null,
                }),
                note: n,
              })),
            draftRules,
          ).map((i) => i.note);
    return [...filtered].sort(compareBy(sort));
  }, [notes, activeWorkspaceId, taggedNoteIds, rulesActive, filterable, draftRules, sort]);

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

  const groups = useMemo(() => {
    if (prefs.groupBy === "none") return null;
    const buckets = new Map<string, { label: string; dotColor?: string; notes: Note[] }>();

    const push = (key: string, label: string, note: Note, dotColor?: string) => {
      const bucket = buckets.get(key) ?? { label, dotColor, notes: [] };
      if (dotColor && !bucket.dotColor) bucket.dotColor = dotColor;
      bucket.notes.push(note);
      buckets.set(key, bucket);
    };

    const groupByDef = isGroupByDef(prefs.groupBy) ? prefs.groupBy.defId : null;
    if (prefs.groupBy === "tags") {
      // A tagged note appears under EACH of its tags (AFFI NE semantics);
      // notes with no tags land in one Untagged bucket.
      const idsByNote = tagIdsByNote ?? new Map<string, string[]>();
      const tagged = new Set<string>();
      for (const tag of allTags) {
        for (const note of workspaceNotes) {
          if ((idsByNote.get(note.id) ?? []).includes(tag.id)) {
            tagged.add(note.id);
            push(`tag:${tag.id}`, tag.name, note, tag.color);
          }
        }
      }
      for (const note of workspaceNotes) {
        if (!tagged.has(note.id)) push("__untagged__", "Untagged", note);
      }
    } else if (prefs.groupBy === "journal") {
      for (const note of workspaceNotes) {
        const ts = journalByNoteId.get(note.id);
        if (ts == null) {
          push("__empty__", "Not journals", note);
        } else {
          const key = `d:${ts}`;
          push(key, relativeDayLabel(ts), note);
        }
      }
    } else if (prefs.groupBy === "created" || prefs.groupBy === "updated") {
      for (const note of workspaceNotes) {
        const ts = prefs.groupBy === "created" ? note.createdAt : note.updatedAt;
        // Bucket by CALENDAR DAY, not the raw timestamp — notes touched the
        // same day at different times must share one group.
        push(`d:${startOfDay(ts)}`, relativeDayLabel(ts), note);
      }
    } else if (groupByDef) {
      const def =
        stackDefs.find((d) => d.id === groupByDef) ?? defs.find((d) => d.id === groupByDef);
      if (def) {
        for (const note of workspaceNotes) {
          const value = stackValues?.get(note.id)?.get(groupByDef);
          if (!value) {
            push("p:__empty__", "Empty", note);
            continue;
          }
          const text = stackValueText(def, value);
          if (text) {
            push(`p:${text}`, text, note);
          } else if (value.type === "checkbox") {
            // An explicitly-set unchecked value is NOT empty.
            push("p:__unchecked__", "✗", note);
          } else {
            push(
              "p:__novalue__",
              def.type === "multiSelect" ? "(none selected)" : "(deleted option)",
              note,
            );
          }
        }
      } else {
        for (const note of workspaceNotes) push("__all__", "All notes", note);
      }
    }

    // Stable display order: date groups newest-first, others by label, the
    // "absent/meta" buckets (Untagged, Empty, ✗, none-selected...) last.
    const entries = [...buckets.entries()].sort((a, b) => {
      const special = (key: string) =>
        key === "__untagged__" ||
        key === "__empty__" ||
        key.endsWith("__empty__") ||
        key === "p:__unchecked__" ||
        key === "p:__novalue__";
      if (special(a[0]) !== special(b[0])) return special(a[0]) ? 1 : -1;
      if (a[0].startsWith("d:") && b[0].startsWith("d:")) {
        return Number(b[0].slice(2)) - Number(a[0].slice(2));
      }
      return a[1].label.localeCompare(b[1].label);
    });
    return entries.map(([key, bucket]) => ({
      key,
      label: bucket.label,
      dotColor: bucket.dotColor,
      notes: bucket.notes,
    }));
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
        // The group qualifier keeps virtualizer keys unique when a note
        // appears under several groups (tag grouping puts it under EACH
        // of its tags) — duplicate sibling keys would corrupt React
        // reconciliation and the shared measurement cache.
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

  // ---- List mode (virtualized, group headers as virtual rows) -------------

  const parentRef = useRef<HTMLDivElement>(null);

  // Keyed by note id (headers by their key), not index: notes re-sort under
  // unchanged indexes, and an index-keyed measurement cache would stamp each
  // row with the previous occupant's height for a frame. Grouped notes carry
  // their group key so multi-group entries stay unique siblings.
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

  const renderNote = useCallback(
    (note: Note) => (
      <NoteItem
        note={note}
        isActive={note.id === activeNoteId}
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
      <div ref={parentRef} className="min-h-0 flex-1 overflow-y-auto">
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
                      // No inline height: the row must be content-sized so
                      // measureElement can observe real heights; pinning it
                      // to virtualRow.size would freeze measurement at the
                      // estimate forever.
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
    <div className="min-h-0 flex-1 overflow-y-auto">
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
