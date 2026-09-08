export type DocMode = "page" | "edgeless";

export type EdgelessTheme = "system" | "light" | "dark";

export type PageWidth = "standard" | "fullWidth";

export interface Note {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly content: string;
  readonly icon?: string;
  readonly coverColor?: string;
  readonly docMode?: DocMode;
  readonly edgelessTheme?: EdgelessTheme;
  readonly pageWidth?: PageWidth;
  readonly isTemplate?: boolean;
  readonly isPinned: boolean;
  readonly isFavorite: boolean;
  readonly orderIndex?: string;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly deletedAt?: number;
}
