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

export function isStackEligibleDef(def: PropertyDefinition): boolean {
  return (
    def.show !== "always-hide" &&
    !def.id.startsWith("system:") &&
    (STACK_ELIGIBLE_TYPES as readonly string[]).includes(def.type)
  );
}

export interface ViewSelectionInputs {
  notes: Note[];
  rules: FilterRule[];
  filterable: Map<string, FilterableNote> | null;
  allowNoteIds: string[];
}

export function selectNotesForView(inputs: ViewSelectionInputs, sort: LibrarySort): Note[] {
  const { notes, rules, filterable, allowNoteIds } = inputs;
  const rulesActive = rules.length > 0;
  const synthesized = (n: Note): FilterableNote => ({
    ...(filterable?.get(n.id) ?? {
      note: n,
      propertyValues: new Map<string, PropertyValue>(),
      tagIds: [],
    }),
    note: n,
  });
  let filtered: Note[];
  if (!rulesActive) {
    filtered = notes;
  } else if (!filterable) {
    filtered = notes;
  } else {
    const deferUnknown = rules.filter(isRuleComplete).some(decidesByFabricatedEmptiness);
    filtered = evaluateFilters(
      notes.filter((n) => !deferUnknown || filterable.has(n.id)).map(synthesized),
      rules,
    ).map((i) => i.note);
  }
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
