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
] as const;

export type PropertyType = (typeof PROPERTY_TYPES)[number];

export interface PropertyOption {
  id: string;
  name: string;
  color: string;
}

export interface PropertyDefinition {
  id: string;
  name: string;
  type: PropertyType;
  options: PropertyOption[];
  createdAt: number;
}

/** Typed value per property type; persisted as JSON. */
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
