import { formatRelativeDay } from "../../utils/time";
import type { PropertyDefinition, PropertyValue } from "./Property";

export function stackValueText(def: PropertyDefinition, value: PropertyValue): string | null {
  switch (value.type) {
    case "text":
      return value.text || null;
    case "number":
      return String(value.number);
    case "select":
    case "status":
      return def.options.find((o) => o.id === value.optionId)?.name ?? null;
    case "multiSelect": {
      const names = def.options.filter((o) => value.optionIds.includes(o.id)).map((o) => o.name);
      return names.length > 0 ? names.join(", ") : null;
    }
    case "date":
      return new Date(value.timestamp).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
        year: "numeric",
      });
    case "person":
      return value.name || null;
    case "checkbox":
      return value.checked ? "✓" : null;
    case "url":
      return value.url || null;
    default:
      return null;
  }
}

export function summarizePropertyValue(
  def: PropertyDefinition,
  value: PropertyValue,
): string | null {
  switch (value.type) {
    case "text":
      return value.text || null;
    case "number":
      return String(value.number);
    case "select":
    case "status":
      return def.options.find((o) => o.id === value.optionId)?.name ?? null;
    case "multiSelect": {
      const names = def.options.filter((o) => value.optionIds.includes(o.id)).map((o) => o.name);
      return names.length > 0 ? names.join(", ") : null;
    }
    case "date":
      return formatRelativeDay(value.timestamp);
    case "person":
      return value.name || null;
    case "files": {
      const first = value.entries[0];
      if (!first) return null;
      return value.entries.length === 1 ? first : `${first} +${value.entries.length - 1}`;
    }
    case "checkbox":
      return value.checked ? "✓" : null;
    case "url":
      if (!value.url) return null;
      try {
        return new URL(value.url).hostname;
      } catch {
        return value.url;
      }
    case "relation":
      return value.noteIds.length > 0 ? `${value.noteIds.length} linked` : null;
    default:
      return null;
  }
}
