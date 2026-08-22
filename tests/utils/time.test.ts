import { describe, expect, it } from "vitest";
import { formatFullTimestamp, formatRelativeDay } from "@/utils/time";

const NOON = new Date(2026, 7, 20, 12, 0, 0).getTime();

describe("formatRelativeDay", () => {
  it("labels timestamps from the same local day as today", () => {
    const sameMorning = new Date(2026, 7, 20, 6, 30).getTime();
    expect(formatRelativeDay(sameMorning, NOON)).toBe("today");
  });

  it("labels the previous local day as yesterday", () => {
    const yesterday = new Date(2026, 7, 19, 23, 59).getTime();
    expect(formatRelativeDay(yesterday, NOON)).toBe("yesterday");
  });

  it("shows an absolute date beyond yesterday (AFFI NE caps relativity at 1 day)", () => {
    const threeDaysAgo = new Date(2026, 7, 17, 10).getTime();
    const label = formatRelativeDay(threeDaysAgo, NOON);
    expect(label).toContain("2026");
    expect(label).not.toContain("ago");
  });

  it("future timestamps clamp to today", () => {
    const future = new Date(2026, 7, 21, 9).getTime();
    expect(formatRelativeDay(future, NOON)).toBe("today");
  });
});

describe("formatFullTimestamp", () => {
  it("formats with date and time components", () => {
    const label = formatFullTimestamp(NOON);
    expect(label).toContain("2026");
    expect(label).toMatch(/\d{1,2}:\d{2}/);
  });
});
