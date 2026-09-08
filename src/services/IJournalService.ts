import type { PropertyValue } from "../domain/property/Property";

export interface IJournalService {
  journalValuesByNote(): Promise<Map<string, PropertyValue>>;

  setJournalDate(noteId: string, timestamp: number): Promise<void>;

  removeJournalDate(noteId: string): Promise<void>;

  ensureJournalByDate(workspaceId: string, timestamp: number): Promise<string>;

  isJournalNote(noteId: string): Promise<boolean>;

  journalDateOf(noteId: string): Promise<number | null>;

  openJournalByDate(workspaceId: string, timestamp: number): Promise<string>;
}
