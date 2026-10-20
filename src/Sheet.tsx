"use client";

import { useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { WheelPickerLabels } from "./labels.js";

/** Colours of the picker. Unset colours keep the stylesheet's defaults,
 * which can also be set as CSS variables (`--wdp-primary`…). */
export type WheelPickerStyle = {
  /** Confirm button, "Today" and the selected row's text. */
  primaryColor?: string;
  /** The band behind the selected row. */
  highlightColor?: string;
  backgroundColor?: string;
  textColor?: string;
  mutedTextColor?: string;
  borderColor?: string;
};

/** Props every picker shares. */
export type SheetOptions = {
  /** Shown when true; render it with `open={false}` (or not at all) to close. */
  open: boolean;
  /** Cancel, Escape, or a tap outside. */
  onCancel: () => void;
  /** Heading above the preview; defaults to the labels' "Select date/time". */
  title?: string;
  /** Defaults to the page's language (`<html lang>`): Lao or English. */
  labels?: WheelPickerLabels;
  style?: WheelPickerStyle;
  /** From this window width (px) up, a centred dialog instead of a bottom
   * sheet. Default 1024. */
  dialogBreakpoint?: number;
  /** Extra class on the panel. */
  className?: string;
};

type FrameProps = SheetOptions & {
  labels: WheelPickerLabels;
  title: string;
  preview: string;
  trailing?: ReactNode;
  columns: { label: string; flex: number; wheel: ReactNode }[];
  onConfirm: () => void;
};

const cssVars = (s: WheelPickerStyle | undefined) => {
  const v: Record<string, string> = {};
  if (s?.primaryColor) v["--wdp-primary"] = s.primaryColor;
  if (s?.highlightColor) v["--wdp-highlight"] = s.highlightColor;
  if (s?.backgroundColor) v["--wdp-bg"] = s.backgroundColor;
  if (s?.textColor) v["--wdp-text"] = s.textColor;
  if (s?.mutedTextColor) v["--wdp-muted"] = s.mutedTextColor;
  if (s?.borderColor) v["--wdp-border"] = s.borderColor;
  return v as CSSProperties;
};

const focusable = (root: HTMLElement) =>
  Array.from(root.querySelectorAll<HTMLElement>("button, [tabindex]:not([tabindex='-1'])")).filter((el) => !el.hasAttribute("disabled"));

/** The bottom sheet (or dialog) every picker is drawn in: handle, title,
 * preview and an optional button beside it, labelled wheels over the
 * selection band, Cancel and Confirm. */
export function SheetFrame({
  open,
  onCancel,
  onConfirm,
  title,
  preview,
  trailing,
  columns,
  labels,
  style,
  dialogBreakpoint = 1024,
  className,
}: FrameProps) {
  const titleId = useId();
  const panel = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // While open, the page behind can't scroll; focus moves in, and goes back
  // where it was on closing.
  useEffect(() => {
    if (!open) return;
    const before = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusFirst = window.setTimeout(() => {
      const p = panel.current;
      if (p) (focusable(p).find((el) => el.classList.contains("wdp-wheel")) ?? p).focus({ preventScroll: true });
    });
    return () => {
      window.clearTimeout(focusFirst);
      document.body.style.overflow = overflow;
      before?.focus?.({ preventScroll: true });
    };
  }, [open]);

  if (!open || !mounted) return null;
  const dialog = window.innerWidth >= dialogBreakpoint;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onCancel();
    } else if (e.key === "Tab" && panel.current) {
      // Keep Tab inside the picker.
      const items = focusable(panel.current);
      const [first, last] = [items[0], items[items.length - 1]];
      if (!first || !last) return;
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  };

  return createPortal(
    <div className={dialog ? "wdp-root wdp-as-dialog" : "wdp-root wdp-as-sheet"} style={cssVars(style)} onKeyDown={onKeyDown}>
      <div className="wdp-backdrop" onClick={onCancel} />
      <div
        ref={panel}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={className ? `wdp-panel ${className}` : "wdp-panel"}
      >
        {!dialog && <div className="wdp-handle" aria-hidden="true" />}
        <div className="wdp-head">
          <div className="wdp-head-text">
            <div id={titleId} className="wdp-title">
              {title}
            </div>
            <div className="wdp-preview" aria-live="polite">
              {preview}
            </div>
          </div>
          {trailing}
        </div>
        <div className="wdp-columns" style={{ gridTemplateColumns: columns.map((c) => `${c.flex}fr`).join(" ") }}>
          {columns.map((c) => (
            <div key={c.label} className="wdp-column-label">
              {c.label}
            </div>
          ))}
        </div>
        <div className="wdp-wheels" style={{ gridTemplateColumns: columns.map((c) => `${c.flex}fr`).join(" ") }}>
          <div className="wdp-band" aria-hidden="true" />
          {columns.map((c) => (
            <div key={c.label} className="wdp-wheel-cell">
              {c.wheel}
            </div>
          ))}
        </div>
        <div className="wdp-actions">
          <button type="button" className="wdp-button wdp-cancel" onClick={onCancel}>
            {labels.cancel}
          </button>
          <button type="button" className="wdp-button wdp-confirm" onClick={onConfirm}>
            {labels.confirm}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}
