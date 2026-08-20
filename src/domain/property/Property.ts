import { generateKeyBetween } from "fractional-indexing";
import { TAG_COLORS } from "../tag/Tag";

export const PROPERTY_TYPES = [
  "text",
  "number",
  "select",
  "multiSelect",
  "status",
  "date",
  "person",
  "files",
  "checkbox",
  "url",
  "relation",
  "tags",
  "workspace",
  "created",
  "updated",
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

/**
 * Built-in rows (Tags / Workspace / Created / Updated) are seeded as property
 * definitions so they take part in ordering and visibility like any other
 * row, while their values stay derived from their real sources (tag service,
 * note fields) instead of note_properties.
 */
export const SYSTEM_PROPERTY_IDS = [
  "system:tags",
  "system:workspace",
  "system:created",
  "system:updated",
] as const;

export type SystemPropertyId = (typeof SYSTEM_PROPERTY_IDS)[number];

export const SYSTEM_PROPERTY_TYPES = ["tags", "workspace", "created", "updated"] as const;

export type SystemPropertyType = (typeof SYSTEM_PROPERTY_TYPES)[number];

export const isSystemPropertyId = (id: string): id is SystemPropertyId =>
  (SYSTEM_PROPERTY_IDS as readonly string[]).includes(id);

export const CREATABLE_PROPERTY_TYPES = PROPERTY_TYPES.filter(
  (type) => !(SYSTEM_PROPERTY_TYPES as readonly string[]).includes(type),
) as Exclude<PropertyType, SystemPropertyType>[];

export const PROPERTY_VISIBILITY = ["always-show", "hide-when-empty", "always-hide"] as const;

export type PropertyVisibility = (typeof PROPERTY_VISIBILITY)[number];

export const isPropertyVisibility = (value: string): value is PropertyVisibility =>
  (PROPERTY_VISIBILITY as readonly string[]).includes(value);

export interface PropertyOption {
  readonly id: string;
  readonly name: string;
  readonly color: string;
}

export interface PropertyDefinition {
  readonly id: string;
  readonly name: string;
  readonly type: PropertyType;
  readonly options: PropertyOption[];
  readonly createdAt: number;
  readonly order: string;
  readonly show: PropertyVisibility;
}

export type PropertyValue =
  | { type: "text"; text: string }
  | { type: "number"; number: number }
  | { type: "select"; optionId: string }
  | { type: "multiSelect"; optionIds: string[] }
  | { type: "status"; optionId: string }
  | { type: "date"; timestamp: number }
  | { type: "person"; name: string }
  | { type: "files"; entries: string[] }
  | { type: "checkbox"; checked: boolean }
  | { type: "url"; url: string }
  | { type: "relation"; noteIds: string[] };

export const isPropertyType = (value: string): value is PropertyType =>
  (PROPERTY_TYPES as readonly string[]).includes(value);

export const hasOptions = (type: PropertyType): boolean =>
  type === "select" || type === "multiSelect" || type === "status";

export const makePropertyId = (): string => crypto.randomUUID();

export const nextOptionColor = (existingCount: number): string =>
  TAG_COLORS[existingCount % TAG_COLORS.length] as string;

/**
 * Fractional ordering key positioned strictly between two existing keys
 * (either side may be null for list head/tail), so a reorder writes exactly
 * one row instead of renumbering the whole list.
 */
export const orderKeyBetween = (before: string | null, after: string | null): string =>
  generateKeyBetween(before || null, after || null);

export const DEFAULT_STATUS_OPTIONS = ["To do", "In progress", "Done"] as const;

export function serializePropertyValue(value: PropertyValue): string {
  return JSON.stringify(value);
}

export function deserializePropertyValue(
  json: string,
  expectedType: PropertyType,
): PropertyValue | null {
  try {
    const parsed = JSON.parse(json) as PropertyValue;
    return parsed && typeof parsed === "object" && parsed.type === expectedType ? parsed : null;
  } catch {
    return null;
  }
}
