import type { INoteLinkRepository } from "@/repositories/INoteLinkRepository";

export class InMemoryNoteLinkRepository implements INoteLinkRepository {
  public links = new Map<string, Set<string>>();

  async replaceForSource(sourceId: string, targetIds: string[]): Promise<void> {
    this.links.set(sourceId, new Set(targetIds.filter((id) => id && id !== sourceId)));
  }

  async backlinksOf(targetId: string): Promise<string[]> {
    const sources: string[] = [];
    for (const [sourceId, targets] of this.links) {
      if (targets.has(targetId)) sources.push(sourceId);
    }
    return sources.sort();
  }

  async outgoingLinksOf(sourceId: string): Promise<string[]> {
    return [...(this.links.get(sourceId) ?? [])].sort();
  }
}
