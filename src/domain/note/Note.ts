export type DocMode = "page" | "edgeless";

export interface Note {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly content: string;
  readonly icon?: string;
  readonly coverColor?: string;
  readonly docMode?: DocMode;
  readonly isPinned: boolean;
  readonly isFavorite: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly deletedAt?: number;
}
