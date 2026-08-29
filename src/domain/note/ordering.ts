/**
 * Char-code ordering (never localeCompare — ICU collation scrambles it);
 * empty key = "never keyed", sinks to the end; ties fall back to createdAt.
 */
export const cmpOrderIndex = (a: string | undefined, b: string | undefined): number => {
  const ak = a ?? "";
  const bk = b ?? "";
  return (ak === "" ? 1 : 0) - (bk === "" ? 1 : 0) || (ak < bk ? -1 : ak > bk ? 1 : 0);
};
