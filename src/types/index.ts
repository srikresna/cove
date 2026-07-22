export interface Note {
  id: string;
  workspaceId: string;
  title: string;
  content: string;
  icon?: string;
  coverColor?: string;
  isPinned: boolean;
  isFavorite: boolean;
  folderId?: string;
  createdAt: number;
  updatedAt: number;
}

export interface Folder {
  id: string;
  workspaceId: string;
  name: string;
  icon?: string;
}

export interface Workspace {
  id: string;
  name: string;
  emoji: string;
  color: string;
  description?: string;
  createdAt: number;
}
