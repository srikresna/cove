import type { PropertyValue } from "../domain/property/Property";

export interface IJournalService {
  /** Journal value (local-midnight date) per note, for every note that has one. */
  journalValuesByNote(): Promise<Map<string, PropertyValue>>;

  setJournalDate(noteId: string, timestamp: number): Promise<void>;

  removeJournalDate(noteId: string): Promise<void>;

  /**
   * AFFiNE journal pattern: return the existing same-day journal note in the
   * workspace, or create one titled YYYY-MM-DD with the journal value set.
   */
  ensureJournalByDate(workspaceId: string, timestamp: number): Promise<string>;
}
