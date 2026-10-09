import { site, weekdays, type Weekday } from "@/data/site";

const toMin = (hhmm: string) => {
  const [h, m] = hhmm.split(":").map(Number);
  return h * 60 + m;
};
const pad = (n: number) => String(n).padStart(2, "0");

/** "13:30" → "1:30 PM" */
export function to12h(hhmm: string) {
  const [h, m] = hhmm.split(":").map(Number);
  const suffix = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${pad(m)} ${suffix}`;
}

/** Horários oferecidos no formulário, derivados de data/site.ts. */
export function reservationSlots(): string[] {
  const { slotMinutes, lastSlotBeforeCloseMinutes } = site.reservations;
  const start = toMin(site.hours.opens);
  const end = toMin(site.hours.closes) - lastSlotBeforeCloseMinutes;
  const out: string[] = [];
  for (let t = start; t <= end; t += slotMinutes) out.push(`${pad(Math.floor(t / 60))}:${pad(t % 60)}`);
  return out;
}

/** Dia da semana de uma data "YYYY-MM-DD" (fuso local). */
export function weekdayOf(isoDate: string): Weekday {
  const [y, m, d] = isoDate.split("-").map(Number);
  const js = new Date(y, m - 1, d).getDay(); // 0 = domingo
  return weekdays[(js + 6) % 7];
}

export const isClosedOn = (isoDate: string) => (site.hours.closed as readonly Weekday[]).includes(weekdayOf(isoDate));

export function todayIso() {
  const n = new Date();
  return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`;
}
