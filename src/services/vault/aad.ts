export const coverAad = (noteId: string): string => `cover:${noteId}`;

export const titleAad = (noteId: string): string => `title:${noteId}`;

export const blobAad = (blobId: string): string => `blob:${blobId}`;

export const workspaceIconAad = (workspaceId: string): string => `workspace-icon:${workspaceId}`;

export const customIconAad = (id: string): string => `custom-icon:${id}`;
