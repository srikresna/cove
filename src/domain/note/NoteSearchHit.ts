/** A search result carrying only a short snippet — never the full decrypted body. */
export interface NoteSearchHit {
  id: string;
  workspaceId: string;
  title: string;
  icon?: string;
  snippet: string;
}
