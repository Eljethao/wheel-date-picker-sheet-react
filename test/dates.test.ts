import { describe, expect, it } from "vitest";
import { dayRange, daysInMonth, formatDdMmYyyy, makeDate, monthRange, normalize, parseIsoDate, toIsoDate } from "../src/dates.js";

const d = (year: number, month: number, day: number) => ({ year, month, day });

describe("dates", () => {
  it("counts days, leap years included", () => {
    expect(daysInMonth(2024, 2)).toBe(29);
    expect(daysInMonth(2023, 2)).toBe(28);
    expect(daysInMonth(1900, 2)).toBe(28);
    expect(daysInMonth(2000, 2)).toBe(29);
    expect(daysInMonth(2023, 4)).toBe(30);
    expect(daysInMonth(2023, 12)).toBe(31);
  });

  it("keeps years under 100 as themselves", () => {
    expect(makeDate(50, 1, 1).getFullYear()).toBe(50);
  });

  it("moves an invalid day into the new month (31 March → 30 April, 29 Feb → 28)", () => {
    const first = d(1900, 1, 1);
    const last = d(2100, 12, 31);
    expect(normalize(d(2023, 4, 31), first, last)).toEqual(d(2023, 4, 30));
    expect(normalize(d(2023, 2, 31), first, last)).toEqual(d(2023, 2, 28));
    expect(normalize(d(2024, 2, 31), first, last)).toEqual(d(2024, 2, 29));
  });

  it("limits months and days in the first and last year of the range", () => {
    const first = d(2000, 3, 10);
    const last = d(2026, 10, 20);
    expect(monthRange(2000, first, last)).toEqual([3, 12]);
    expect(monthRange(2026, first, last)).toEqual([1, 10]);
    expect(monthRange(2010, first, last)).toEqual([1, 12]);
    expect(dayRange(2000, 3, first, last)).toEqual([10, 31]);
    expect(dayRange(2026, 10, first, last)).toEqual([1, 20]);
    expect(normalize(d(2026, 12, 31), first, last)).toEqual(d(2026, 10, 20));
    expect(normalize(d(2000, 1, 1), first, last)).toEqual(d(2000, 3, 10));
  });

  it("formats and parses", () => {
    expect(formatDdMmYyyy(makeDate(2000, 3, 5))).toBe("05/03/2000");
    expect(toIsoDate(makeDate(1999, 12, 31))).toBe("1999-12-31");
    expect(toIsoDate(parseIsoDate("2024-02-29")!)).toBe("2024-02-29");
    expect(parseIsoDate("2023-02-29")).toBeNull();
    expect(parseIsoDate("2023-13-01")).toBeNull();
    expect(parseIsoDate("")).toBeNull();
    expect(parseIsoDate(undefined)).toBeNull();
  });
});
