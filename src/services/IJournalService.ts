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

  /** True when the note has a journal value. */
  isJournalNote(noteId: string): Promise<boolean>;

  /** Journal value (local midnight) of a note, or null. */
  journalDateOf(noteId: string): Promise<number | null>;

  /**
   * The single navigation helper AFFi NE repeats everywhere: existing
   * same-day journal in the workspace -> ensure-and-create.
   */
  openJournalByDate(workspaceId: string, timestamp: number): Promise<string>;
}
