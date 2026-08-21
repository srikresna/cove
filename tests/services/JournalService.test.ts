import { describe, expect, it } from "vitest";
import type { Note } from "@/domain/note/Note";
import { JOURNAL_PROPERTY_ID } from "@/domain/property/Property";
import type { INoteService } from "@/services/INoteService";
import { JournalService, journalTitleFor } from "@/services/JournalService";
import { PropertyService } from "@/services/PropertyService";
import { InMemoryPropertyRepository } from "../fakes/InMemoryPropertyRepository";

function makeFakeNoteService(): INoteService & {
  created: Array<{ workspaceId: string; title?: string }>;
} {
  const created: Array<{ workspaceId: string; title?: string }> = [];
  const notes = new Map<string, Note>();
  let nextId = 0;
  return {
    created,
    backlinksOf: () => Promise.resolve([]),
    outgoingLinksOf: () => Promise.resolve([]),
    getLinkTargets: () => Promise.resolve([]),
    listMetadataByWorkspace: () => Promise.resolve([]),
    getNote: (id) => Promise.resolve(notes.get(id) ?? null),
    searchAcrossWorkspaces: () => Promise.resolve([]),
    createNote: (workspaceId: string, title?: string) => {
      const note = {
        id: `n${nextId++}`,
        workspaceId,
        title: title ?? "",
        content: "",
        createdAt: 0,
        updatedAt: 0,
        isPinned: false,
        isFavorite: false,
      } as Note;
      notes.set(note.id, note);
      created.push({ workspaceId, title });
      return Promise.resolve(note);
    },
    createNoteWithId: () => {
      throw new Error("not implemented in fake");
    },
    updateMetadata: () => Promise.reject(new Error("not implemented in fake")),
    updateContent: () => Promise.reject(new Error("not implemented in fake")),
    getCoverImage: () => Promise.resolve(null),
    setCoverImage: () => Promise.resolve(),
    removeCoverImage: () => Promise.resolve(),
    deleteNote: () => Promise.resolve(),
    collectWorkspaceBlobCandidates: () => Promise.resolve([]),
    gcOrphanBlobs: () => Promise.resolve(),
    trashNote: () => Promise.resolve(),
    restoreNote: () => Promise.resolve(),
    listTrash: () => Promise.resolve([]),
    purgeExpiredTrash: () => Promise.resolve(0),
    duplicateNote: () => Promise.reject(new Error("not implemented in fake")),
    togglePin: () => Promise.reject(new Error("not implemented in fake")),
    toggleFavorite: () => Promise.reject(new Error("not implemented in fake")),
  };
}

function makePropertyService(): PropertyService {
  const repo = new InMemoryPropertyRepository();
  repo.definitions.push({
    id: JOURNAL_PROPERTY_ID,
    name: "Journal",
    type: "date",
    options: [],
    createdAt: 0,
    order: "a0",
    show: "hide-when-empty",
  });
  return new PropertyService(repo);
}

describe("JournalService", () => {
  it("ensureJournalByDate creates a dated note once and reuses it afterwards", async () => {
    const propertyService = makePropertyService();
    const notes = makeFakeNoteService();
    const journal = new JournalService(propertyService, notes);

    const date = new Date(2026, 7, 21).getTime();
    const first = await journal.ensureJournalByDate("w1", date);
    expect(notes.created).toHaveLength(1);
    expect(notes.created[0]?.title).toBe("2026-08-21");
    expect(journalTitleFor(date)).toBe("2026-08-21");

    const values = await journal.journalValuesByNote();
    expect(values.get(first)).toEqual({ type: "date", timestamp: date });

    // Same day, same workspace -> reuse, no second note.
    const second = await journal.ensureJournalByDate("w1", new Date(2026, 7, 21, 17, 30).getTime());
    expect(second).toBe(first);
    expect(notes.created).toHaveLength(1);

    // Same day, different workspace -> creates its own.
    const other = await journal.ensureJournalByDate("w2", date);
    expect(other).not.toBe(first);
    expect(notes.created).toHaveLength(2);
  });

  it("skips trashed journal notes and concurrent ensures create one note", async () => {
    const propertyService = makePropertyService();
    const notes = makeFakeNoteService();
    const journal = new JournalService(propertyService, notes);
    const date = new Date(2026, 7, 21).getTime();

    // Trash is soft: the note still resolves via getNote but must be skipped.
    const trashed = await journal.ensureJournalByDate("w1", date);
    const trashedNote = await notes.getNote(trashed);
    expect(trashedNote).not.toBeNull();
    (trashedNote as { deletedAt: number | null }).deletedAt = date + 1;
    const recreated = await journal.ensureJournalByDate("w1", date);
    expect(recreated).not.toBe(trashed);
    expect(notes.created).toHaveLength(2);

    // Two concurrent ensures for the same day resolve to the same note.
    const [a, b] = await Promise.all([
      journal.ensureJournalByDate("w1", new Date(2026, 7, 22).getTime()),
      journal.ensureJournalByDate("w1", new Date(2026, 7, 22, 20).getTime()),
    ]);
    expect(a).toBe(b);
    expect(notes.created).toHaveLength(3);
  });

  it("set and remove journal dates round-trip through the property system", async () => {
    const propertyService = makePropertyService();
    const notes = makeFakeNoteService();
    const journal = new JournalService(propertyService, notes);
    const note = await notes.createNote("w1", "Scratch");

    await journal.setJournalDate(note.id, new Date(2026, 0, 2, 12).getTime());
    let values = await journal.journalValuesByNote();
    // Stored at local midnight, not the original midday timestamp.
    expect(values.get(note.id)).toEqual({
      type: "date",
      timestamp: new Date(2026, 0, 2).getTime(),
    });

    await journal.removeJournalDate(note.id);
    values = await journal.journalValuesByNote();
    expect(values.has(note.id)).toBe(false);
  });

  it("valuesForDefinitionAllNotes returns values keyed by note across notes", async () => {
    const service = makePropertyService();
    const deadline = await service.createDefinition("Deadline", "date");
    await service.setValue("n1", deadline.id, { type: "date", timestamp: 1000 });
    await service.setValue("n2", deadline.id, { type: "date", timestamp: 2000 });
    await service.setValue("n2", JOURNAL_PROPERTY_ID, { type: "date", timestamp: 3000 });

    const values = await service.valuesForDefinitionAllNotes(deadline.id);
    expect(values.size).toBe(2);
    expect(values.get("n2")).toEqual({ type: "date", timestamp: 2000 });

    await expect(service.valuesForDefinitionAllNotes("missing")).rejects.toThrow();
  });
});
