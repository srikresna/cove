export interface NoteSearchHit {
  readonly id: string;
  readonly workspaceId: string;
  readonly title: string;
  readonly icon?: string;
  readonly snippet: string;
}
