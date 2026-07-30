export interface Tag {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly createdAt: number;
}

export const TAG_COLORS = [
  "#dc4446",
  "#d34a9e",
  "#e8590c",
  "#d9a05b",
  "#2f9e44",
  "#0e7c66",
  "#1971c2",
  "#7048e8",
  "#697077",
] as const;

export function makeTagId(): string {
  return crypto.randomUUID();
}

export function nextTagColor(existingCount: number): string {
  return TAG_COLORS[existingCount % TAG_COLORS.length] as string;
}

export function normalizeTagName(name: string): string {
  return name.trim().replace(/\s+/g, " ");
}
