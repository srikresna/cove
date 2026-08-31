import { QueryCache, QueryClient } from "@tanstack/react-query";
import {
  blockSuiteEditorService,
  noteService,
  propertyService,
  tagService,
  vaultService,
} from "../di/container";
import type { FilterableNote } from "../domain/filters/evaluateFilters";
import { isStackEligibleDef } from "../domain/library/query";
import type { Note } from "../domain/note/Note";
import type { PropertyDefinition, PropertyValue } from "../domain/property/Property";
import { changeBus } from "../services/changeBus";
import { notifyErrorWithSaveStatus as notifyError } from "./notify";

/** The notes-list cache key — per workspace. */
export const notesKey = (workspaceId: string) => ["notes", workspaceId] as const;
export const trashKey = ["trash"] as const;
/** One note's database-row backlink scan — per source note. */
export const backlinkScanKey = (noteId: string) => ["backlink-scan", noteId] as const;
/** The Library's bulk-loaded row stacks (definitions are global). */
export const libraryStacksKey = ["library-stacks"] as const;
/** The Library's filter inputs (property values + tag ids) — per workspace. */
export const libraryInputsKey = (workspaceId: string) => ["library-inputs", workspaceId] as const;

/**
 * Fetches a workspace's note list and mirrors it into the editor's doc
 * registry (the doc-registry side effect kept at the cache boundary).
 */
export async function fetchNotes(workspaceId: string): Promise<Note[]> {
  const notes = await noteService.listMetadataByWorkspace(workspaceId);
  blockSuiteEditorService.registerExistingNotes(notes.map((n) => ({ id: n.id, title: n.title })));
  return notes;
}

export interface LibraryStacksData {
  stackDefs: PropertyDefinition[];
  stackValues: Map<string, Map<string, PropertyValue>> | null;
}

export async function fetchLibraryStacks(): Promise<LibraryStacksData> {
  const eligible = (await propertyService.listDefinitions()).filter(isStackEligibleDef);
  if (eligible.length === 0) return { stackDefs: [], stackValues: null };
  const perDef = await Promise.all(
    eligible.map(async (def) => ({
      propertyId: def.id,
      values: await propertyService.valuesForDefinitionAllNotes(def.id),
    })),
  );
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
  return { stackDefs: eligible, stackValues: byNote };
}

export interface LibraryInputsData {
  filterable: Map<string, FilterableNote>;
  tagIdsByNote: Map<string, string[]>;
}

export async function fetchLibraryInputs(workspaceId: string): Promise<LibraryInputsData> {
  const [notes, journalValues, perDef, tagLists] = await Promise.all([
    noteService.listMetadataByWorkspace(workspaceId),
    propertyService.valuesForDefinitionAllNotes("system:journal"),
    propertyService.listDefinitions().then((allDefs) =>
      Promise.all(
        allDefs.map(async (def) => ({
          propertyId: def.id,
          values: await propertyService.valuesForDefinitionAllNotes(def.id),
        })),
      ),
    ),
    tagService
      .listTags(workspaceId)
      .then((wsTags) =>
        Promise.all(
          wsTags.map(async (tag) => ({
            tagId: tag.id,
            noteIds: await tagService.notesForTag(tag.id),
          })),
        ),
      )
      .catch(() => [] as Array<{ tagId: string; noteIds: string[] }>),
  ]);

  const idsByNote = new Map<string, string[]>();
  for (const { tagId, noteIds } of tagLists) {
    for (const noteId of noteIds) {
      const ids = idsByNote.get(noteId) ?? [];
      ids.push(tagId);
      idsByNote.set(noteId, ids);
    }
  }
  const filterable = new Map<string, FilterableNote>();
  for (const note of notes) {
    if (note.workspaceId !== workspaceId) continue;
    const journal = journalValues.get(note.id);
    filterable.set(note.id, {
      note,
      propertyValues: new Map(),
      tagIds: idsByNote.get(note.id) ?? [],
      journalTimestamp:
        journal?.type === "date" ? (journal as { timestamp: number }).timestamp : null,
    });
  }
  for (const { propertyId, values } of perDef) {
    for (const [noteId, value] of values) {
      filterable.get(noteId)?.propertyValues.set(propertyId, value);
    }
  }
  return { filterable, tagIdsByNote: idsByNote };
}

/** A created note has provably empty filter inputs — write its entry so
 *  emptiness-rule views show it immediately without a reload. */
export function seedLibraryInputsNote(workspaceId: string, note: Note): void {
  queryClient.setQueryData<LibraryInputsData>(libraryInputsKey(workspaceId), (prev) => {
    if (!prev) return prev;
    const filterable = new Map(prev.filterable);
    filterable.set(note.id, {
      note,
      propertyValues: new Map(),
      tagIds: [],
      journalTimestamp: null,
    });
    return { filterable, tagIdsByNote: prev.tagIdsByNote };
  });
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Local DB: data only changes through this app's own mutations, so
      // refetching happens on explicit invalidation, not on staleness timers.
      staleTime: Infinity,
      retry: false,
      refetchOnWindowFocus: false,
      gcTime: 5 * 60_000,
    },
  },
  queryCache: new QueryCache({
    // One surface for fetch failures (the old per-call notifyError paths).
    onError: (err) => notifyError(err, { saveStatus: false }),
  }),
});

// Vault lock wipes the caches; the unlock remount refetches through the
// vault gate.
vaultService.onLock(() => {
  void queryClient.cancelQueries();
  queryClient.clear();
});

// Repo writes publish change topics — the Library's bulk-input queries ride
// on them instead of version-signal effect deps.
changeBus.on("properties", () => {
  void queryClient.invalidateQueries({ queryKey: libraryStacksKey });
  void queryClient.invalidateQueries({ queryKey: ["library-inputs"] });
});
changeBus.on("tags", () => {
  void queryClient.invalidateQueries({ queryKey: ["library-inputs"] });
});
