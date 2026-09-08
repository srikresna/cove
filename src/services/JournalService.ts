import { JOURNAL_PROPERTY_ID, type PropertyValue } from "../domain/property/Property";
import type { IJournalService } from "./IJournalService";
import type { INoteService } from "./INoteService";
import type { IPropertyService } from "./IPropertyService";
import { getJournalTemplateId } from "./journalTemplateSetting";

const pad = (n: number): string => String(n).padStart(2, "0");

const sameCalendarDay = (a: number, b: number): boolean => {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const localMidnight = (timestamp: number): number => {
  const d = new Date(timestamp);
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
};

export const journalTitleFor = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
};

export class JournalService implements IJournalService {
  private readonly inFlightEnsures = new Map<string, Promise<string>>();

  constructor(
    private readonly properties: IPropertyService,
    private readonly notes: INoteService,
  ) {}

  journalValuesByNote(): Promise<Map<string, PropertyValue>> {
    return this.properties.valuesForDefinitionAllNotes(JOURNAL_PROPERTY_ID);
  }

  async setJournalDate(noteId: string, timestamp: number): Promise<void> {
    await this.properties.setValue(noteId, JOURNAL_PROPERTY_ID, {
      type: "date",
      timestamp: localMidnight(timestamp),
    });
  }

  async removeJournalDate(noteId: string): Promise<void> {
    await this.properties.removeValue(noteId, JOURNAL_PROPERTY_ID);
  }

  async ensureJournalByDate(workspaceId: string, timestamp: number): Promise<string> {
    const midnight = localMidnight(timestamp);
    const key = `${workspaceId}:${journalTitleFor(midnight)}`;
    const inFlight = this.inFlightEnsures.get(key);
    if (inFlight) return inFlight;
    const pending = this.createOrReuseJournal(workspaceId, midnight).finally(() => {
      this.inFlightEnsures.delete(key);
    });
    this.inFlightEnsures.set(key, pending);
    return pending;
  }

  private async createOrReuseJournal(workspaceId: string, midnight: number): Promise<string> {
    for (const [noteId, value] of await this.journalValuesByNote()) {
      if (value.type !== "date" || !sameCalendarDay(value.timestamp, midnight)) continue;
      const note = await this.notes.getNote(noteId);
      if (note && note.deletedAt == null && note.workspaceId === workspaceId) return noteId;
    }
    let content: string | undefined;
    const templateId = getJournalTemplateId(workspaceId);
    if (templateId) {
      const template = await this.notes.getNote(templateId).catch(() => null);
      if (template && template.deletedAt == null && template.isTemplate) {
        content = template.content;
      }
    }
    const note = await this.notes.createNote(
      workspaceId,
      journalTitleFor(midnight),
      content,
      undefined,
      {
        createdAt: midnight,
      },
    );
    await this.setJournalDate(note.id, midnight);
    return note.id;
  }

  async isJournalNote(noteId: string): Promise<boolean> {
    const value = (await this.journalValuesByNote()).get(noteId);
    return value?.type === "date";
  }

  async journalDateOf(noteId: string): Promise<number | null> {
    const value = (await this.journalValuesByNote()).get(noteId);
    return value?.type === "date" ? value.timestamp : null;
  }

  async openJournalByDate(workspaceId: string, timestamp: number): Promise<string> {
    return this.ensureJournalByDate(workspaceId, timestamp);
  }
}
