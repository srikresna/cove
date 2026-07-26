export interface INoteLinkRepository {
  replaceForSource(sourceId: string, targetIds: string[]): Promise<void>;
  backlinksOf(targetId: string): Promise<string[]>;
}
