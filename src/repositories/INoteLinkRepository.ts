export interface INoteLinkRepository {
  replaceForSource(sourceId: string, targetIds: string[]): Promise<void>;
  /** Notes that link TO targetId. */
  backlinksOf(targetId: string): Promise<string[]>;
  /** Notes that sourceId links TO (outgoing references). */
  outgoingLinksOf(sourceId: string): Promise<string[]>;
}
