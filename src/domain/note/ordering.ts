/**
 * Fractional-index keys order by char code (a0..a9,aA..aZ,aa..az) — never
 * compare them with localeCompare: ICU collation is case-insensitive and
 * scrambles the sequence from the 37th key onward. Empty keys mean "never
 * keyed" (pre-v23 strays, imports) and sink to the end; ties fall back to
 * createdAt.
 */
export const cmpOrderIndex = (a: string | undefined, b: string | undefined): number => {
  const ak = a ?? "";
  const bk = b ?? "";
  return (ak === "" ? 1 : 0) - (bk === "" ? 1 : 0) || (ak < bk ? -1 : ak > bk ? 1 : 0);
};
