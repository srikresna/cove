import {
  decidesByFabricatedEmptiness,
  evaluateFilters,
  type FilterableNote,
} from "../filters/evaluateFilters";
import type { FilterRule } from "../filters/FilterRule";
import { isRuleComplete } from "../filters/FilterRule";
import type { Note } from "../note/Note";
import { cmpOrderIndex } from "../note/ordering";
import type { PropertyDefinition, PropertyValue } from "../property/Property";

export type LibrarySort =
  | "custom"
  | "updated-desc"
  | "updated-asc"
  | "created-desc"
  | "created-asc"
  | "title-asc"
  | "title-desc";

export function compareBy(sort: LibrarySort): (a: Note, b: Note) => number {
  switch (sort) {
    case "custom":
      return (a, b) => cmpOrderIndex(a.orderIndex, b.orderIndex) || a.createdAt - b.createdAt;
    case "updated-asc":
      return (a, b) => a.updatedAt - b.updatedAt;
    case "created-desc":
      return (a, b) => b.createdAt - a.createdAt;
    case "created-asc":
      return (a, b) => a.createdAt - b.createdAt;
    case "title-asc":
      return (a, b) => (a.title || "").localeCompare(b.title || "");
    case "title-desc":
      return (a, b) => (b.title || "").localeCompare(a.title || "");
    default:
      return (a, b) => b.updatedAt - a.updatedAt;
  }
}

const STACK_ELIGIBLE_TYPES = [
  "text",
  "number",
  "date",
  "select",
  "status",
  "multiSelect",
  "checkbox",
  "person",
  "url",
] as const;

/** Simple-typed, visible, custom properties — groupable, chip-toggleable,
 *  and stackable on note rows. */
export function isStackEligibleDef(def: PropertyDefinition): boolean {
  return (
    def.show !== "always-hide" &&
    !def.id.startsWith("system:") &&
    (STACK_ELIGIBLE_TYPES as readonly string[]).includes(def.type)
  );
}

export interface ViewSelectionInputs {
  /** Live notes of the workspace, already tag-prefiltered. */
  notes: Note[];
  rules: FilterRule[];
  /** Bulk-loaded filter inputs by note id (null while loading). */
  filterable: Map<string, FilterableNote> | null;
  /** Note ids the app itself created — provably empty filter inputs. */
  knownEmptyIds: Set<string> | undefined;
  /** Manually-included ids (a collection's Docs tab): rules OR membership. */
  allowNoteIds: string[];
}

/** The one definition of "which notes does this view show": rule evaluation
 *  with cache-aware deferral, OR-unioned with the manual allow-list, sorted.
 *  Notes absent from the cache are synthesized empty ONLY where fabricated
 *  emptiness cannot decide the outcome; otherwise they wait for
 *  revalidation. */
export function selectNotesForView(inputs: ViewSelectionInputs, sort: LibrarySort): Note[] {
  const { notes, rules, filterable, knownEmptyIds, allowNoteIds } = inputs;
  const rulesActive = rules.length > 0;
  const deferUnknown = rules.filter(isRuleComplete).some(decidesByFabricatedEmptiness);
  const filtered =
    !rulesActive || !filterable
      ? notes
      : evaluateFilters(
          notes
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
          rules,
        ).map((i) => i.note);
  const allow = new Set(allowNoteIds);
  const withAllow =
    allow.size === 0
      ? filtered
      : [
          ...filtered,
          ...notes.filter((n) => allow.has(n.id) && !filtered.some((f) => f.id === n.id)),
        ];
  return [...withAllow].sort(compareBy(sort));
}
