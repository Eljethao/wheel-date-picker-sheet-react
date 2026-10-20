# wheel-date-picker-sheet

A modern, easy-to-use date and time picker for **React**. It opens as a
bottom sheet with three scrolling wheels — **day, month, year** — instead of
a calendar grid, so picking a date far from today (a date of birth, a
document's expiry date) takes a couple of flicks instead of paging through
months.

The React port of the Flutter package
[`wheel_date_picker_sheet`](https://pub.dev/packages/wheel_date_picker_sheet):
same behaviour, same options.

- `dd/MM/yyyy` preview of the selected date (custom formatter supported)
- Opens on **01/01/2000** when no initial date is given
- **Future dates** allowed by default (up to 50 years ahead)
- Invalid days are corrected as you scroll (31 Jan → Feb gives 28/29 Feb)
- Scroll, tap a row, or use the keyboard (arrows, Page Up/Down, Home, End); "Today" jumps back to today
- Hour / minute time picker in the same style
- English and Lao labels built in (picked from `<html lang>`), or bring your own
- A centred dialog instead of a sheet on wide (desktop / tablet) screens
- Works with Next.js App Router (`"use client"` built in) and server rendering
- No dependencies beyond React

## Screenshots

| Date (English) | Date (Lao) | Time |
|:---:|:---:|:---:|
| <img src="https://cdn.jsdelivr.net/npm/wheel-date-picker-sheet@0.1.1/screenshots/date-sheet.png" alt="Date picker as a bottom sheet, English labels" width="260"> | <img src="https://cdn.jsdelivr.net/npm/wheel-date-picker-sheet@0.1.1/screenshots/date-sheet-lao.png" alt="Date picker with Lao labels" width="260"> | <img src="https://cdn.jsdelivr.net/npm/wheel-date-picker-sheet@0.1.1/screenshots/time-sheet.png" alt="Time picker with hour and minute wheels" width="260"> |

On a wide screen (from `dialogBreakpoint`, 1024 px) it opens as a centred dialog:

<img src="https://cdn.jsdelivr.net/npm/wheel-date-picker-sheet@0.1.1/screenshots/date-dialog.png" alt="Date picker as a centred dialog on a desktop screen" width="660">

## Install

```sh
npm install wheel-date-picker-sheet
```

Import the stylesheet once, e.g. in your root layout:

```ts
import "wheel-date-picker-sheet/style.css";
```

## Usage

```tsx
import { useState } from "react";
import { WheelDatePicker, formatDdMmYyyy } from "wheel-date-picker-sheet";

function DateOfBirth() {
  const [open, setOpen] = useState(false);
  const [dob, setDob] = useState<Date | null>(null);
  return (
    <>
      <button type="button" onClick={() => setOpen(true)}>
        {dob ? formatDdMmYyyy(dob) : "Date of birth"}
      </button>
      <WheelDatePicker
        open={open}
        initialDate={dob}
        lastDate={new Date()} // no future dates
        onCancel={() => setOpen(false)}
        onConfirm={(date) => {
          setDob(date);
          setOpen(false);
        }}
      />
    </>
  );
}
```

Time:

```tsx
import { WheelTimePicker } from "wheel-date-picker-sheet";

<WheelTimePicker
  open={open}
  initialTime={{ hour: 9, minute: 30 }}
  onCancel={() => setOpen(false)}
  onConfirm={({ hour, minute }) => { /* … */ setOpen(false); }}
/>;
```

Dates are local `Date` objects at 00:00. For forms and APIs, `toIsoDate(date)`
gives `yyyy-MM-dd` and `parseIsoDate("2000-01-31")` reads one back (null if it
isn't a real date).

### Options

Both pickers:

| Prop | Default | |
|---|---|---|
| `open` | — | Shown while true |
| `onCancel` | — | Cancel, Escape, or a tap outside |
| `onConfirm` | — | `(date: Date)` / `({ hour, minute })` |
| `title` | "Select date" / "Select time" | |
| `labels` | from `<html lang>` | `wheelPickerLabels.en`, `wheelPickerLabels.lo`, or your own |
| `style` | blue on white | `{ primaryColor, highlightColor, backgroundColor, textColor, mutedTextColor, borderColor }` |
| `dialogBreakpoint` | `1024` | Window width (px) from which a dialog is used |
| `className` | | Extra class on the panel |

`WheelDatePicker` only:

| Prop | Default | |
|---|---|---|
| `initialDate` | 1 Jan 2000 | Clamped into `firstDate`..`lastDate` |
| `firstDate` | 1 Jan 1900 | |
| `lastDate` | 31 Dec, 50 years from now | Pass `new Date()` to forbid future dates |
| `formatter` | `formatDdMmYyyy` | Preview line, e.g. `(d) => d.toLocaleDateString()` |
| `showTodayButton` | `true` | |

`WheelTimePicker` only: `initialTime` (`{ hour, minute }`, default now).

### Colours

Pass `style`, or set the CSS variables on `.wdp-root` in your own stylesheet:

```css
.wdp-root {
  --wdp-primary: #2d6692;
  --wdp-bg: #fff;
  --wdp-text: #111827;
  --wdp-muted: #6b7280;
  --wdp-border: #e5e7eb;
  --wdp-z: 1000; /* z-index of the overlay */
}
```

### Custom language

```ts
import type { WheelPickerLabels } from "wheel-date-picker-sheet";

const thai: WheelPickerLabels = {
  selectDate: "เลือกวันที่", selectTime: "เลือกเวลา", today: "วันนี้", now: "ตอนนี้",
  day: "วัน", month: "เดือน", year: "ปี", hour: "ชั่วโมง", minute: "นาที",
  cancel: "ยกเลิก", confirm: "ยืนยัน",
  monthNames: ["มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
    "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"],
};

<WheelDatePicker open={open} labels={thai} onCancel={close} onConfirm={pick} />;
```

## Accessibility

The panel is a modal `dialog` labelled by its title; focus moves into it on
opening, stays inside while it is open (Tab cycles), and returns on closing.
Each wheel is a `spinbutton` with its column's name and the selected value as
text, so it can be read and changed without a pointer.

## Development

`pnpm test` runs the tests (Vitest, jsdom). jsdom does no layout, so check
anything visual in a browser: `pnpm run screenshots` bundles `demo/` and
retakes the screenshots above with Chrome (`CHROME_PATH` if it isn't in the
macOS location).

## License

MIT
