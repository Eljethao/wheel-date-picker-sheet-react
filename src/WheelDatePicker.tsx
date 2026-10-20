"use client";

import { useState } from "react";
import { SheetFrame, type SheetOptions } from "./Sheet.js";
import { Wheel } from "./Wheel.js";
import {
  clampDate,
  compareDates,
  dayRange,
  formatDdMmYyyy,
  fromDate,
  makeDate,
  monthRange,
  normalize,
  pad2,
  toDate,
  type CalendarDate,
} from "./dates.js";
import { pageLabels } from "./labels.js";

export type WheelDatePickerProps = SheetOptions & {
  /** The picked date, at 00:00 local time. */
  onConfirm: (date: Date) => void;
  /** Defaults to 1 January 2000. Clamped into `firstDate`..`lastDate`. */
  initialDate?: Date | null;
  /** Defaults to 1 January 1900. */
  firstDate?: Date;
  /** Defaults to 31 December, 50 years from now, so future dates
   * (expiry dates, appointments) work out of the box. Pass `new Date()` to
   * forbid them. */
  lastDate?: Date;
  /** The preview line above the wheels; `dd/MM/yyyy` by default. */
  formatter?: (date: Date) => string;
  /** The "Today" button beside the preview (only when today is in range). */
  showTodayButton?: boolean;
};

/**
 * A date picker as a bottom sheet with day, month and year wheels instead
 * of a calendar grid — fast for dates far from today, such as a date of
 * birth or a document's expiry date.
 *
 * ```tsx
 * <WheelDatePicker open={open} lastDate={new Date()} onCancel={close} onConfirm={(d) => { setDob(d); close(); }} />
 * ```
 */
export function WheelDatePicker(props: WheelDatePickerProps) {
  // Mounted only while open, so each opening starts from `initialDate`.
  return props.open ? <DatePickerSheet {...props} /> : null;
}

function DatePickerSheet({
  onConfirm,
  initialDate,
  firstDate,
  lastDate,
  formatter = formatDdMmYyyy,
  showTodayButton = true,
  title,
  labels,
  ...sheet
}: WheelDatePickerProps) {
  const l = labels ?? pageLabels();
  const [range] = useState(() => {
    const now = new Date();
    const first = fromDate(firstDate ?? makeDate(1900, 1, 1));
    let last = fromDate(lastDate ?? makeDate(now.getFullYear() + 50, 12, 31));
    if (compareDates(last, first) < 0) last = first;
    return { first, last };
  });
  const { first, last } = range;
  const [value, setValue] = useState<CalendarDate>(() =>
    clampDate(fromDate(initialDate ?? makeDate(2000, 1, 1)), first, last),
  );

  const set = (patch: Partial<CalendarDate>) => setValue((v) => normalize({ ...v, ...patch }, first, last));
  const [mFrom, mTo] = monthRange(value.year, first, last);
  const [dFrom, dTo] = dayRange(value.year, value.month, first, last);
  const today = fromDate(new Date());
  const canToday = showTodayButton && compareDates(today, first) >= 0 && compareDates(today, last) <= 0;

  return (
    <SheetFrame
      {...sheet}
      labels={l}
      title={title ?? l.selectDate}
      preview={formatter(toDate(value))}
      trailing={
        canToday ? (
          <button type="button" className="wdp-text-button" onClick={() => setValue(today)}>
            {l.today}
          </button>
        ) : undefined
      }
      columns={[
        {
          label: l.day,
          flex: 2,
          wheel: (
            <Wheel
              ariaLabel={l.day}
              count={dTo - dFrom + 1}
              selected={value.day - dFrom}
              label={(i) => pad2(dFrom + i)}
              onChange={(i) => set({ day: dFrom + i })}
            />
          ),
        },
        {
          label: l.month,
          flex: 4,
          wheel: (
            <Wheel
              ariaLabel={l.month}
              count={mTo - mFrom + 1}
              selected={value.month - mFrom}
              label={(i) => l.monthNames[mFrom + i - 1] ?? String(mFrom + i)}
              onChange={(i) => set({ month: mFrom + i })}
            />
          ),
        },
        {
          label: l.year,
          flex: 3,
          wheel: (
            <Wheel
              ariaLabel={l.year}
              count={last.year - first.year + 1}
              selected={value.year - first.year}
              label={(i) => String(first.year + i)}
              onChange={(i) => set({ year: first.year + i })}
            />
          ),
        },
      ]}
      onConfirm={() => onConfirm(toDate(value))}
    />
  );
}
