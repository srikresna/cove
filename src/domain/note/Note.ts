export type DocMode = "page" | "edgeless";

export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  icon?: string;
  coverColor?: string;
  docMode?: DocMode;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
  deletedAt?: number;
}
