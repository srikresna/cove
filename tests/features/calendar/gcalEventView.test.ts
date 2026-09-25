import { describe, expect, it } from "vitest";
import { buildWeeks } from "@/features/calendar/gcalEventView";

describe("calendar weeks", () => {
  it("starts month rows on Monday", () => {
    const weeks = buildWeeks(new Date(2026, 8, 25));
    expect(weeks[0]).toEqual(new Date(2026, 7, 31));
    expect(weeks.every((week) => week.getDay() === 1)).toBe(true);
  });
});
