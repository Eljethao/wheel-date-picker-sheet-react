/** A calendar date without a time or a time zone; `month` is 1–12. */
export type CalendarDate = { year: number; month: number; day: number };

/** A time of day, 24-hour. */
export type TimeOfDay = { hour: number; minute: number };

const two = (n: number) => String(n).padStart(2, "0");

/** A local `Date` at 00:00. Built with `setFullYear` so years 0–99 stay
 * themselves (`new Date(50, 0, 1)` would be 1950). */
export function makeDate(year: number, month: number, day: number): Date {
  const d = new Date(2000, 0, 1);
  d.setFullYear(year, month - 1, day);
  return d;
}

export function fromDate(d: Date): CalendarDate {
  return { year: d.getFullYear(), month: d.getMonth() + 1, day: d.getDate() };
}

export function toDate(c: CalendarDate): Date {
  return makeDate(c.year, c.month, c.day);
}

/** Days in `month` (1–12) of `year`, leap years included. */
export function daysInMonth(year: number, month: number): number {
  return makeDate(year, month + 1, 0).getDate();
}

export function compareDates(a: CalendarDate, b: CalendarDate): number {
  return a.year - b.year || a.month - b.month || a.day - b.day;
}

export function clampDate(d: CalendarDate, first: CalendarDate, last: CalendarDate): CalendarDate {
  if (compareDates(d, first) < 0) return first;
  if (compareDates(d, last) > 0) return last;
  return d;
}

const clamp = (n: number, lo: number, hi: number) => Math.min(Math.max(n, lo), hi);

/** The months the month wheel offers in `year`: all twelve, except in the
 * first and last year of the range. */
export function monthRange(year: number, first: CalendarDate, last: CalendarDate): [number, number] {
  return [year === first.year ? first.month : 1, year === last.year ? last.month : 12];
}

/** The days the day wheel offers in `year`/`month`. */
export function dayRange(year: number, month: number, first: CalendarDate, last: CalendarDate): [number, number] {
  const atFirst = year === first.year && month === first.month;
  const atLast = year === last.year && month === last.month;
  return [atFirst ? first.day : 1, atLast ? last.day : daysInMonth(year, month)];
}

/** Keeps month and day valid for a new year/month — 31 March becomes
 * 30 April, or 28/29 February — and inside the range. */
export function normalize(d: CalendarDate, first: CalendarDate, last: CalendarDate): CalendarDate {
  const [mFrom, mTo] = monthRange(d.year, first, last);
  const month = clamp(d.month, mFrom, mTo);
  const [dFrom, dTo] = dayRange(d.year, month, first, last);
  return { year: d.year, month, day: clamp(d.day, dFrom, dTo) };
}

/** `dd/MM/yyyy`, e.g. `05/03/2000` — the default preview format. */
export function formatDdMmYyyy(d: Date): string {
  return `${two(d.getDate())}/${two(d.getMonth() + 1)}/${d.getFullYear()}`;
}

/** `yyyy-MM-dd`, the value of an `<input type="date">` or an API field. */
export function toIsoDate(d: Date): string {
  return `${String(d.getFullYear()).padStart(4, "0")}-${two(d.getMonth() + 1)}-${two(d.getDate())}`;
}

/** A `yyyy-MM-dd` string as a local `Date`, or null when it isn't a real
 * date (`2023-02-30`). */
export function parseIsoDate(s: string | null | undefined): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s ?? "");
  if (!m) return null;
  const [year, month, day] = [Number(m[1]), Number(m[2]), Number(m[3])];
  if (month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) return null;
  return makeDate(year, month, day);
}

export const pad2 = two;
