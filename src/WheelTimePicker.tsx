"use client";

import { useState } from "react";
import { SheetFrame, type SheetOptions } from "./Sheet.js";
import { Wheel } from "./Wheel.js";
import { pad2, type TimeOfDay } from "./dates.js";
import { pageLabels } from "./labels.js";

export type WheelTimePickerProps = SheetOptions & {
  onConfirm: (time: TimeOfDay) => void;
  /** Defaults to now. */
  initialTime?: TimeOfDay | null;
};

/** A time picker in the same style: 24-hour hour and minute wheels, and
 * "Now" beside the preview. */
export function WheelTimePicker(props: WheelTimePickerProps) {
  return props.open ? <TimePickerSheet {...props} /> : null;
}

const now = (): TimeOfDay => {
  const d = new Date();
  return { hour: d.getHours(), minute: d.getMinutes() };
};

function TimePickerSheet({ onConfirm, initialTime, title, labels, ...sheet }: WheelTimePickerProps) {
  const l = labels ?? pageLabels();
  const [value, setValue] = useState<TimeOfDay>(() => initialTime ?? now());
  return (
    <SheetFrame
      {...sheet}
      labels={l}
      title={title ?? l.selectTime}
      preview={`${pad2(value.hour)}:${pad2(value.minute)}`}
      trailing={
        <button type="button" className="wdp-text-button" onClick={() => setValue(now())}>
          {l.now}
        </button>
      }
      columns={[
        {
          label: l.hour,
          flex: 1,
          wheel: <Wheel ariaLabel={l.hour} count={24} selected={value.hour} label={pad2} onChange={(hour) => setValue((v) => ({ ...v, hour }))} />,
        },
        {
          label: l.minute,
          flex: 1,
          wheel: <Wheel ariaLabel={l.minute} count={60} selected={value.minute} label={pad2} onChange={(minute) => setValue((v) => ({ ...v, minute }))} />,
        },
      ]}
      onConfirm={() => onConfirm(value)}
    />
  );
}
