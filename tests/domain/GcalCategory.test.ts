import { describe, expect, it } from "vitest";
import { getGcalCategory, withGcalCategory } from "@/domain/gcal/GcalCategory";
import type { GcalEvent } from "@/domain/gcal/GcalTypes";

const event: GcalEvent = {
  id: "event-1",
  summary: "Plan work",
  start: { dateTime: "2026-09-25T09:00:00Z" },
  end: { dateTime: "2026-09-25T10:00:00Z" },
  extendedProperties: { private: { coveNoteId: "note-1" } },
};

describe("Google Calendar categories", () => {
  it("treats events without a Cove category as events", () => {
    expect(getGcalCategory(event)).toBe("event");
  });

  it("stores a task as an event category without losing its linked note", () => {
    const task = withGcalCategory(event, "task");
    expect(getGcalCategory(task)).toBe("task");
    expect(task.extendedProperties?.private).toEqual({
      coveNoteId: "note-1",
      cove: "1",
      coveCategory: "task",
    });
    expect(event.extendedProperties?.private?.coveCategory).toBeUndefined();
  });
});
