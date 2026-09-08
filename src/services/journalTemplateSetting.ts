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
  } catch {}
}
