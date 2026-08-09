/**
 * One-shot intent flag for "start a presentation from page mode".
 *
 * In two-surface mode, switching page→edgeless remounts the editor, so a
 * presentation cannot be activated from a page-mode FramePanel instance
 * (it would be torn down before setTool runs). Instead the page-mode "Start
 * presentation" action records an intent here, flips Cove to edgeless, and the
 * edgeless BlockSuiteSurface consumes the intent once its tool controller is
 * ready — then activates PresentTool.
 */
let pendingNoteId: string | null = null;

/** Record a pending presentation request for a note (before switching to edgeless). */
export function requestPresentation(noteId: string): void {
  pendingNoteId = noteId;
}

/** If a presentation is pending for this note, claim it (clears the flag). */
export function consumePresentation(noteId: string): boolean {
  if (pendingNoteId === noteId) {
    pendingNoteId = null;
    return true;
  }
  return false;
}
