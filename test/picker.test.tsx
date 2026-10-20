import { afterEach, describe, expect, it, vi } from "vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { WheelDatePicker, WheelTimePicker, toIsoDate, wheelPickerLabels } from "../src/index.js";
import { makeDate } from "../src/dates.js";

afterEach(cleanup);

const spin = (name: string) => screen.getByRole("spinbutton", { name });

describe("WheelDatePicker", () => {
  it("renders nothing while closed", () => {
    render(<WheelDatePicker open={false} onCancel={() => {}} onConfirm={() => {}} />);
    expect(screen.queryByRole("dialog")).toBeNull();
  });

  it("opens on 01/01/2000 by default and confirms it", () => {
    const onConfirm = vi.fn();
    render(<WheelDatePicker open labels={wheelPickerLabels.en} onCancel={() => {}} onConfirm={onConfirm} />);
    expect(screen.getByRole("dialog")).toBeTruthy();
    expect(screen.getByText("01/01/2000")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(toIsoDate(onConfirm.mock.calls[0]![0])).toBe("2000-01-01");
  });

  it("changes a wheel with the keyboard and fixes the day for a shorter month", () => {
    const onConfirm = vi.fn();
    render(
      <WheelDatePicker open labels={wheelPickerLabels.en} initialDate={makeDate(2023, 1, 31)} onCancel={() => {}} onConfirm={onConfirm} />,
    );
    fireEvent.keyDown(spin("Month"), { key: "ArrowDown" });
    expect(screen.getByText("28/02/2023")).toBeTruthy();
    expect(spin("Day").getAttribute("aria-valuetext")).toBe("28");
    fireEvent.keyDown(spin("Year"), { key: "ArrowDown" });
    expect(screen.getByText("28/02/2024")).toBeTruthy();
    fireEvent.keyDown(spin("Day"), { key: "End" });
    expect(screen.getByText("29/02/2024")).toBeTruthy();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(toIsoDate(onConfirm.mock.calls[0]![0])).toBe("2024-02-29");
  });

  it("clamps the initial date into the range and stops at the last date", () => {
    render(
      <WheelDatePicker
        open
        labels={wheelPickerLabels.en}
        initialDate={makeDate(2030, 6, 1)}
        firstDate={makeDate(1990, 1, 1)}
        lastDate={makeDate(2020, 5, 15)}
        onCancel={() => {}}
        onConfirm={() => {}}
      />,
    );
    expect(screen.getByText("15/05/2020")).toBeTruthy();
    fireEvent.keyDown(spin("Day"), { key: "End" });
    expect(spin("Day").getAttribute("aria-valuetext")).toBe("15");
    expect(spin("Month").getAttribute("aria-valuetext")).toBe("May");
  });

  it("jumps to today, and hides Today when it is out of range", () => {
    render(<WheelDatePicker open labels={wheelPickerLabels.en} onCancel={() => {}} onConfirm={() => {}} />);
    fireEvent.click(screen.getByRole("button", { name: "Today" }));
    const now = new Date();
    const two = (n: number) => String(n).padStart(2, "0");
    expect(screen.getByText(`${two(now.getDate())}/${two(now.getMonth() + 1)}/${now.getFullYear()}`)).toBeTruthy();
    cleanup();
    render(<WheelDatePicker open labels={wheelPickerLabels.en} lastDate={makeDate(2000, 1, 1)} onCancel={() => {}} onConfirm={() => {}} />);
    expect(screen.queryByRole("button", { name: "Today" })).toBeNull();
  });

  it("cancels with Escape, the Cancel button and the backdrop", () => {
    const onCancel = vi.fn();
    const { container } = render(<WheelDatePicker open labels={wheelPickerLabels.en} onCancel={onCancel} onConfirm={() => {}} />);
    fireEvent.keyDown(screen.getByRole("dialog"), { key: "Escape" });
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    fireEvent.click(document.querySelector(".wdp-backdrop")!);
    expect(onCancel).toHaveBeenCalledTimes(3);
    expect(container).toBeTruthy();
  });

  it("takes Lao labels from <html lang>", () => {
    document.documentElement.lang = "lo";
    render(<WheelDatePicker open initialDate={makeDate(2000, 5, 1)} onCancel={() => {}} onConfirm={() => {}} />);
    expect(screen.getByText("ເລືອກວັນທີ")).toBeTruthy();
    expect(spin("ເດືອນ").getAttribute("aria-valuetext")).toBe("ພຶດສະພາ");
    document.documentElement.lang = "";
  });

  it("commits the row a wheel settles on after scrolling", async () => {
    vi.useFakeTimers();
    const onConfirm = vi.fn();
    render(<WheelDatePicker open labels={wheelPickerLabels.en} initialDate={makeDate(2000, 1, 1)} onCancel={() => {}} onConfirm={onConfirm} />);
    const day = spin("Day");
    day.scrollTop = 44 * 9; // the 10th row
    fireEvent.scroll(day);
    await act(async () => {
      vi.advanceTimersByTime(200);
    });
    vi.useRealTimers();
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(toIsoDate(onConfirm.mock.calls[0]![0])).toBe("2000-01-10");
  });
});

describe("WheelTimePicker", () => {
  it("confirms the picked time", () => {
    const onConfirm = vi.fn();
    render(<WheelTimePicker open labels={wheelPickerLabels.en} initialTime={{ hour: 9, minute: 5 }} onCancel={() => {}} onConfirm={onConfirm} />);
    expect(screen.getByText("09:05")).toBeTruthy();
    fireEvent.keyDown(spin("Hour"), { key: "ArrowUp" });
    fireEvent.click(screen.getByRole("button", { name: "Confirm" }));
    expect(onConfirm).toHaveBeenCalledWith({ hour: 8, minute: 5 });
  });
});
