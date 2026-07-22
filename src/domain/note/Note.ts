export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  icon?: string;
  coverColor?: string;
  isPinned: boolean;
  isFavorite: boolean;
  createdAt: number;
  updatedAt: number;
}
