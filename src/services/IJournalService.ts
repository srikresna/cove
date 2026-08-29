import type { PropertyValue } from "../domain/property/Property";

export interface IJournalService {
  /** Journal value (local-midnight date) per note, for every note that has one. */
  journalValuesByNote(): Promise<Map<string, PropertyValue>>;

  setJournalDate(noteId: string, timestamp: number): Promise<void>;

  removeJournalDate(noteId: string): Promise<void>;

  /** Return the existing same-day journal note, or create one titled YYYY-MM-DD. */
  ensureJournalByDate(workspaceId: string, timestamp: number): Promise<string>;

  /** True when the note has a journal value. */
  isJournalNote(noteId: string): Promise<boolean>;

  /** Journal value (local midnight) of a note, or null. */
  journalDateOf(noteId: string): Promise<number | null>;

  /** Return the same-day journal note, creating it if needed. */
  openJournalByDate(workspaceId: string, timestamp: number): Promise<string>;
}
