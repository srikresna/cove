let pendingNoteId: string | null = null;

export function requestPresentation(noteId: string): void {
  pendingNoteId = noteId;
}

export function consumePresentation(noteId: string): boolean {
  if (pendingNoteId === noteId) {
    pendingNoteId = null;
    return true;
  }
  return false;
}
