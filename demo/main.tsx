// The README's screenshots are taken from this page (`pnpm run screenshots`).
// Query: ?open=date|time, ?lang=en|lo, ?date=yyyy-MM-dd, ?time=HH:mm.
import { useState } from "react";
import { createRoot } from "react-dom/client";
import {
  WheelDatePicker,
  WheelTimePicker,
  formatDdMmYyyy,
  parseIsoDate,
  wheelPickerLabels,
  type TimeOfDay,
} from "../src/index.js";
import "../src/style.css";

const q = new URLSearchParams(location.search);
const lang = q.get("lang") === "lo" ? "lo" : "en";
document.documentElement.lang = lang;
const text = {
  en: { title: "Create your account", name: "Full name", dob: "Date of birth", appt: "Appointment time", pick: "dd/mm/yyyy", time: "--:--", person: "Somchai Phommavong" },
  lo: { title: "ລົງທະບຽນ", name: "ຊື່ ແລະ ນາມສະກຸນ", dob: "ວັນເດືອນປີເກີດ", appt: "ເວລານັດ", pick: "ວັນ/ເດືອນ/ປີ", time: "--:--", person: "ສົມໃຈ ພົມມະວົງ" },
}[lang];
const two = (n: number) => String(n).padStart(2, "0");

function Demo() {
  const [open, setOpen] = useState(q.get("open"));
  const [dob, setDob] = useState<Date | null>(parseIsoDate(q.get("date")));
  const [time, setTime] = useState<TimeOfDay | null>(() => {
    const m = /^(\d\d):(\d\d)$/.exec(q.get("time") ?? "");
    return m ? { hour: Number(m[1]), minute: Number(m[2]) } : null;
  });
  return (
    <main className="demo">
      <h1>{text.title}</h1>
      <label>
        {text.name}
        <input defaultValue={text.person} />
      </label>
      <label>
        {text.dob}
        <button type="button" onClick={() => setOpen("date")}>
          {dob ? formatDdMmYyyy(dob) : <span className="muted">{text.pick}</span>}
        </button>
      </label>
      <label>
        {text.appt}
        <button type="button" onClick={() => setOpen("time")}>
          {time ? `${two(time.hour)}:${two(time.minute)}` : <span className="muted">{text.time}</span>}
        </button>
      </label>
      <WheelDatePicker
        open={open === "date"}
        initialDate={dob}
        lastDate={new Date()}
        labels={wheelPickerLabels[lang]}
        onCancel={() => setOpen(null)}
        onConfirm={(d) => {
          setDob(d);
          setOpen(null);
        }}
      />
      <WheelTimePicker
        open={open === "time"}
        initialTime={time}
        labels={wheelPickerLabels[lang]}
        onCancel={() => setOpen(null)}
        onConfirm={(t) => {
          setTime(t);
          setOpen(null);
        }}
      />
    </main>
  );
}

createRoot(document.getElementById("root")!).render(<Demo />);
