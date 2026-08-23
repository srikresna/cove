/**
 * Per-workspace journal template selection, stored in localStorage for now
 * (matches the phased plan; a workspace settings table can replace this
 * later without changing the callers).
 */
const PREFIX = "cove-journal-template:";

export function getJournalTemplateId(workspaceId: string): string | null {
  try {
    return localStorage.getItem(PREFIX + workspaceId);
  } catch {
    return null;
  }
}

export function setJournalTemplateId(workspaceId: string, noteId: string | null): void {
  try {
    if (noteId === null) localStorage.removeItem(PREFIX + workspaceId);
    else localStorage.setItem(PREFIX + workspaceId, noteId);
  } catch {
    // storage unavailable - setting simply doesn't persist
  }
}
