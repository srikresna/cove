import type { FilterRules } from "./FilterRule";

export interface SavedView {
  readonly id: string;
  readonly workspaceId: string;
  readonly name: string;
  readonly rules: FilterRules;
  readonly createdAt: number;
}

export function makeSavedViewId(): string {
  return crypto.randomUUID();
}
