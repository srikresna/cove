import type { PropertyDefinition, PropertyValue } from "../../domain/property/Property";
import type { FilterableNote } from "../../services/filters/evaluateFilters";

/**
 * Module-level stale-while-revalidate cache for the Library list's
 * bulk-loaded inputs (kept out of the component so note-creating store
 * actions can seed it without an import cycle). See LibraryNoteList for
 * the rationale.
 */
export interface LibraryListCache {
  stackDefs: PropertyDefinition[];
  stackValues: Map<string, Map<string, PropertyValue>> | null;
  filterable: Map<string, FilterableNote> | null;
  /**
   * Note ids the app itself just created — provably empty filter inputs,
   * so emptiness-rule views may show them immediately instead of deferring
   * them to revalidation like genuinely-unknown notes.
   */
  knownEmptyIds: Set<string>;
}

export const listCache = new Map<string, LibraryListCache>();

export function readListCache(workspaceId: string): LibraryListCache | undefined {
  return listCache.get(workspaceId);
}

/** Record a freshly created note as provably empty in the cache. */
export function seedKnownEmptyNote(workspaceId: string, noteId: string): void {
  const entry = listCache.get(workspaceId);
  // No cache yet: the next mount builds filterable fresh from live data,
  // so there is nothing to seed around.
  if (!entry) return;
  entry.knownEmptyIds.add(noteId);
}
