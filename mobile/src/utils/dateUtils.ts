/**
 * Safe date parsing/conversion helpers.
 *
 * Why this exists (regression protection):
 *   CaseForm crashed with "RangeError: Invalid time value" because free-text
 *   date input (e.g. a half-typed "2024-0" or "abc") was passed to
 *   `new Date(value).toISOString()` during render. `toISOString()` throws on
 *   an Invalid Date, which took down the whole component tree.
 *
 * Rules:
 *   - Never throw. Invalid/empty input parses to `null`.
 *   - Optional dates keep the semantic meaning of "not provided" (`undefined`),
 *     we never silently invent "today" for missing values.
 *   - Only ISO-like strings (YYYY-MM-DD, optionally with a time part) are
 *     accepted. This is the format this app stores/sends and it parses
 *     deterministically across JavaScript engines, unlike locale formats
 *     ("15/03/2024") whose behavior varies by platform.
 */

const ISO_DATE_LIKE = /^\d{4}-\d{2}-\d{2}([T ].+)?$/;

/**
 * Parse an unknown value into a valid Date, or `null` when the value is
 * empty/unrecognized/invalid. Handles: undefined, null, "", whitespace,
 * invalid strings, invalid timestamps, invalid Date objects, valid ISO
 * strings and valid timestamps.
 */
export function parseValidDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }

  if (typeof value === "number") {
    if (!Number.isFinite(value)) return null;
    const fromTimestamp = new Date(value);
    return Number.isNaN(fromTimestamp.getTime()) ? null : fromTimestamp;
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || !ISO_DATE_LIKE.test(trimmed)) return null;
    const parsed = new Date(trimmed);

    // Guard against engines that "roll over" impossible calendar dates
    // (e.g. new Date("2024-02-30") becomes 2024-03-01 in V8). A plain
    // YYYY-MM-DD input must round-trip to the exact same Y/M/D in UTC.
    const dateOnly = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);
    if (dateOnly) {
      const [, y, m, d] = dateOnly;
      const matchesCalendar =
        parsed.getUTCFullYear() === Number(y) &&
        parsed.getUTCMonth() === Number(m) - 1 &&
        parsed.getUTCDate() === Number(d);
      if (!matchesCalendar) return null;
    }

    return Number.isNaN(parsed.getTime()) ? null : parsed;
  }

  return null;
}

/**
 * Convert an unknown value to an ISO string, or `undefined` when the value
 * does not represent a valid date. Safe to call during render — never throws.
 */
export function safeToISOString(value: unknown): string | undefined {
  const parsed = parseValidDate(value);
  return parsed ? parsed.toISOString() : undefined;
}

/**
 * True when `value` is a string that is exactly a valid `YYYY-MM-DD` date
 * (used for inline form validation UX).
 */
export function isValidISODateString(value: unknown): value is string {
  return (
    typeof value === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.trim()) &&
    parseValidDate(value) !== null
  );
}
