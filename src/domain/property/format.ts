import type { PropertyDefinition, PropertyValue } from "./Property";

/** Compact stack-value formatting for note rows, cards, and group labels. */
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
