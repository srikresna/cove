/**
 * Natural-language date suggestions for quick search ("today", "tomorrow",
 * "next tuesday", "dec 10"). Returns local midnight + matched alias, or null.
 */

const MONTH_NAMES = Array.from({ length: 12 }, (_, index) =>
  new Intl.DateTimeFormat("en-US", { month: "long" }).format(new Date(2024, index)),
);

const WEEKDAY_NAMES = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat("en-US", { weekday: "long" }).format(new Date(2024, 0, index)),
);

const midnightOf = (d: Date): number =>
  new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();

const addDays = (base: Date, n: number): Date => {
  const copy = new Date(base);
  copy.setDate(copy.getDate() + n);
  return copy;
};

/** Subsequence match: every query char appears in order within target. */
function fuzzyMatch(query: string, target: string): boolean {
  let ti = 0;
  for (const ch of query) {
    if (ch === " ") continue;
    ti = target.indexOf(ch, ti);
    if (ti === -1) return false;
    ti += 1;
  }
  return true;
}

export interface SuggestedJournalDate {
  timestamp: number;
  alias?: string;
}

export function suggestJournalDate(query: string): SuggestedJournalDate | null {
  const q = query.trim().toLowerCase().split(" ").join("");
  if (q === "") return null;
  const now = new Date();

  if (fuzzyMatch(q, "today")) return { timestamp: midnightOf(now), alias: "Today" };
  if (fuzzyMatch(q, "tomorrow"))
    return { timestamp: midnightOf(addDays(now, 1)), alias: "Tomorrow" };
  if (fuzzyMatch(q, "yesterday"))
    return { timestamp: midnightOf(addDays(now, -1)), alias: "Yesterday" };

  // Weekday aliases ("next tuesday") — the letters must fuzzy-match a
  // weekday name, so bare "next week" never matches.
  const weekMatch = q.match(/^(next|last)([a-z]+)$/);
  if (weekMatch) {
    const [, direction = "", letters = ""] = weekMatch;
    for (let i = 0; i < 7; i += 1) {
      const weekday = WEEKDAY_NAMES[i] ?? "";
      if (fuzzyMatch(letters, weekday.toLowerCase())) {
        const anchor = addDays(now, direction === "next" ? 7 : -7);
        const delta = (i - anchor.getDay() + 7) % 7;
        return {
          timestamp: midnightOf(addDays(anchor, delta)),
          alias: `${direction === "next" ? "Next" : "Last"} ${weekday}`,
        };
      }
    }
  }

  // Month + optional day: "dec", "dec10".
  const monthMatch = q.match(/^([a-z]+)(\d*)$/);
  if (monthMatch) {
    const [, letters = "", numbers = ""] = monthMatch;
    for (let m = 0; m < 12; m += 1) {
      if (!fuzzyMatch(letters, (MONTH_NAMES[m] ?? "").toLowerCase())) continue;
      const parsed = numbers ? Number.parseInt(numbers, 10) : now.getDate();
      const day = parsed >= 1 && parsed <= 31 ? parsed : now.getDate();
      return { timestamp: midnightOf(new Date(now.getFullYear(), m, day)) };
    }
  }

  return null;
}
