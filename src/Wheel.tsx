"use client";

import { useEffect, useLayoutEffect, useRef, useState, type KeyboardEvent } from "react";

/** Row height in px; `style.css`'s `--wdp-row` must match. */
export const ROW = 44;

/** How long scrolling must pause before the centred row is taken. */
const SETTLE_MS = 120;

const useIsoLayoutEffect = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type WheelProps = {
  count: number;
  /** Index of the selected row. */
  selected: number;
  label: (index: number) => string;
  onChange: (index: number) => void;
  /** Read out by screen readers ("Day", "Month"…). */
  ariaLabel: string;
};

/**
 * One scroll wheel: the centred row is the selection. Scroll it (it snaps
 * to a row), tap a row, or focus it and use the arrow keys, Page Up/Down,
 * Home and End.
 */
export function Wheel({ count, selected, label, onChange, ariaLabel }: WheelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const settle = useRef<number | undefined>(undefined);
  const scrolling = useRef(false);
  const placed = useRef(false);
  // The row under the band while scrolling, before it is committed.
  const [live, setLive] = useState(selected);
  const last = count - 1;
  const at = (i: number) => Math.min(Math.max(i, 0), last);

  // Follow the selection: on opening (instantly), and when the parent
  // changes it — a clamped day (31 → 30), "Today", a key press.
  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const target = at(selected) * ROW;
    setLive(at(selected));
    const opening = !placed.current;
    placed.current = true;
    if (scrolling.current || Math.abs(el.scrollTop - target) < 1) return;
    if (opening || typeof el.scrollTo !== "function") el.scrollTop = target;
    else el.scrollTo({ top: target, behavior: "smooth" });
  }, [selected, count]);

  useEffect(() => () => window.clearTimeout(settle.current), []);

  const onScroll = () => {
    const el = ref.current;
    if (!el) return;
    scrolling.current = true;
    setLive(at(Math.round(el.scrollTop / ROW)));
    window.clearTimeout(settle.current);
    settle.current = window.setTimeout(() => {
      scrolling.current = false;
      const i = at(Math.round(el.scrollTop / ROW));
      if (i !== selected) onChange(i);
    }, SETTLE_MS);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    const step: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
    let next: number | undefined;
    if (e.key in step) next = at(selected + step[e.key]!);
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = last;
    if (next === undefined) return;
    e.preventDefault();
    if (next !== selected) onChange(next);
  };

  return (
    <div
      ref={ref}
      className="wdp-wheel"
      role="spinbutton"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={last}
      aria-valuenow={selected}
      aria-valuetext={label(at(selected))}
      onScroll={onScroll}
      onKeyDown={onKeyDown}
    >
      {Array.from({ length: count }, (_, i) => (
        <div
          key={i}
          className={i === live ? "wdp-row wdp-row-selected" : "wdp-row"}
          aria-hidden="true"
          onClick={() => i !== selected && onChange(i)}
        >
          {label(i)}
        </div>
      ))}
    </div>
  );
}
