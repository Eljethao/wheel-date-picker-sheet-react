/** All text the picker shows. Use `wheelPickerLabels.en` or
 * `wheelPickerLabels.lo`, or build your own for another language. */
export type WheelPickerLabels = {
  selectDate: string;
  selectTime: string;
  today: string;
  now: string;
  day: string;
  month: string;
  year: string;
  hour: string;
  minute: string;
  cancel: string;
  confirm: string;
  /** Exactly 12 names, January … December. */
  monthNames: readonly string[];
};

const en: WheelPickerLabels = {
  selectDate: "Select date",
  selectTime: "Select time",
  today: "Today",
  now: "Now",
  day: "Day",
  month: "Month",
  year: "Year",
  hour: "Hour",
  minute: "Minute",
  cancel: "Cancel",
  confirm: "Confirm",
  monthNames: [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ],
};

const lo: WheelPickerLabels = {
  selectDate: "ເລືອກວັນທີ",
  selectTime: "ເລືອກເວລາ",
  today: "ມື້ນີ້",
  now: "ດຽວນີ້",
  day: "ວັນ",
  month: "ເດືອນ",
  year: "ປີ",
  hour: "ຊົ່ວໂມງ",
  minute: "ນາທີ",
  cancel: "ຍົກເລີກ",
  confirm: "ຢືນຢັນ",
  monthNames: [
    "ມັງກອນ", "ກຸມພາ", "ມີນາ", "ເມສາ", "ພຶດສະພາ", "ມິຖຸນາ",
    "ກໍລະກົດ", "ສິງຫາ", "ກັນຍາ", "ຕຸລາ", "ພະຈິກ", "ທັນວາ",
  ],
};

/** The built-in labels: English and Lao. */
export const wheelPickerLabels = { en, lo } as const;

/** Lao for a `lo` locale (`"lo"`, `"lo-LA"`), otherwise English. */
export function labelsForLocale(locale: string | null | undefined): WheelPickerLabels {
  return locale?.toLowerCase().split(/[-_]/)[0] === "lo" ? lo : en;
}

/** The labels of the page's language (`<html lang>`), as the Flutter
 * package takes them from the app's locale. */
export function pageLabels(): WheelPickerLabels {
  return labelsForLocale(typeof document === "undefined" ? undefined : document.documentElement.lang);
}
