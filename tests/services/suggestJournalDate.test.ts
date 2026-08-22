import { describe, expect, it } from "vitest";
import { suggestJournalDate } from "@/services/suggestJournalDate";

const dayOf = (timestamp: number): string => {
  const d = new Date(timestamp);
  return `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
};

describe("suggestJournalDate", () => {
  it("matches today/tomorrow/yesterday with aliases", () => {
    const now = new Date();
    expect(suggestJournalDate("today")?.alias).toBe("Today");
    expect(dayOf(suggestJournalDate("today")?.timestamp ?? 0)).toBe(
      `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}`,
    );
    expect(suggestJournalDate("tomorrow")?.alias).toBe("Tomorrow");
    expect(suggestJournalDate("yesterday")?.alias).toBe("Yesterday");
    // Subsequence fuzzy: t-o-m-r-w all appear in order in "tomorrow".
    expect(suggestJournalDate("tmrw")?.alias).toBe("Tomorrow");
  });

  it("matches next/last weekday aliases", () => {
    const next = suggestJournalDate("next tuesday");
    expect(next?.alias).toBe("Next Tuesday");
    expect(next?.timestamp).toEqual(new Date(next?.timestamp ?? 0).getTime());
    const last = suggestJournalDate("lastfriday");
    expect(last?.alias).toBe("Last Friday");
  });

  it("matches month and month+day forms", () => {
    const dec = suggestJournalDate("dec");
    expect(dec).not.toBeNull();
    expect(new Date(dec?.timestamp ?? 0).getMonth()).toBe(11);

    const dec10 = suggestJournalDate("dec10");
    expect(new Date(dec10?.timestamp ?? 0).getMonth()).toBe(11);
    expect(new Date(dec10?.timestamp ?? 0).getDate()).toBe(10);

    // Invalid day falls back to today's day-of-month, not NaN.
    const dec99 = suggestJournalDate("dec99");
    expect(dec99).not.toBeNull();
    expect(Number.isFinite(dec99?.timestamp ?? NaN)).toBe(true);
  });

  it("returns null for unmatched queries", () => {
    expect(suggestJournalDate("zzz")).toBeNull();
    expect(suggestJournalDate("")).toBeNull();
    expect(suggestJournalDate("   ")).toBeNull();
  });
});
