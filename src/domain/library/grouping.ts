import type { Note } from "../note/Note";
import { stackValueText } from "../property/format";
import type { PropertyDefinition, PropertyValue } from "../property/Property";
import type { Tag } from "../tag/Tag";

export type GroupBy = "none" | "tags" | "created" | "updated" | { defId: string };

export interface NoteGroup {
  key: string;
  label: string;
  dotColor?: string;
  notes: Note[];
}

export interface GroupingInputs {
  groupBy: GroupBy;
  notes: Note[];
  allTags: Tag[];
  tagIdsByNote: Map<string, string[]> | null;
  stackValues: Map<string, Map<string, PropertyValue>> | null;
  stackDefs: PropertyDefinition[];
  defs: PropertyDefinition[];
}

export const startOfDay = (ts: number): number => {
  const d = new Date(ts);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export const relativeDayLabel = (ts: number): string => {
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

const isSpecialKey = (key: string): boolean =>
  key === "__untagged__" ||
  key === "__empty__" ||
  key.endsWith("__empty__") ||
  key === "p:__unchecked__" ||
  key === "p:__novalue__";

export function groupNotes(inputs: GroupingInputs): NoteGroup[] {
  const { groupBy, notes, allTags, tagIdsByNote, stackValues, stackDefs, defs } = inputs;
  if (groupBy === "none") return [];
  const buckets = new Map<string, { label: string; dotColor?: string; notes: Note[] }>();

  const push = (key: string, label: string, note: Note, dotColor?: string) => {
    const bucket = buckets.get(key) ?? { label, dotColor, notes: [] };
    if (dotColor && !bucket.dotColor) bucket.dotColor = dotColor;
    bucket.notes.push(note);
    buckets.set(key, bucket);
  };

  if (groupBy === "tags") {
    const idsByNote = tagIdsByNote ?? new Map<string, string[]>();
    const tagged = new Set<string>();
    for (const tag of allTags) {
      for (const note of notes) {
        if ((idsByNote.get(note.id) ?? []).includes(tag.id)) {
          tagged.add(note.id);
          push(`tag:${tag.id}`, tag.name, note, tag.color);
        }
      }
    }
    for (const note of notes) {
      if (!tagged.has(note.id)) push("__untagged__", "Untagged", note);
    }
  } else if (groupBy === "created" || groupBy === "updated") {
    for (const note of notes) {
      const ts = groupBy === "created" ? note.createdAt : note.updatedAt;
      push(`d:${startOfDay(ts)}`, relativeDayLabel(ts), note);
    }
  } else {
    const defId = groupBy.defId;
    const def = stackDefs.find((d) => d.id === defId) ?? defs.find((d) => d.id === defId);
    if (def) {
      for (const note of notes) {
        const value = stackValues?.get(note.id)?.get(defId);
        if (!value) {
          push("p:__empty__", "Empty", note);
          continue;
        }
        const text = stackValueText(def, value);
        if (text) {
          push(`p:${text}`, text, note);
        } else if (value.type === "checkbox") {
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
      for (const note of notes) push("__all__", "All notes", note);
    }
  }

  const entries = [...buckets.entries()].sort((a, b) => {
    if (isSpecialKey(a[0]) !== isSpecialKey(b[0])) return isSpecialKey(a[0]) ? 1 : -1;
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
}
