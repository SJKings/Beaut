import { ACTIVE, BOOKING_WINDOW_DAYS, SLOTS, SPECIALISTS, STUDIO, type Booking } from "./catalog";

const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

/** Today's date and the current minute of the day in the studio's time zone. */
export function studioNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-CA", { timeZone: STUDIO.timeZone, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date())
      .map((p) => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, minute: Number(parts.hour) * 60 + Number(parts.minute) };
}

const addDays = (date: string, n: number) => {
  const d = new Date(date + "T12:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

/** Why a date/time can't be booked at all (before looking at specialists), or null. */
export function slotProblem(date: string, time: string): string | null {
  if (!SLOTS.includes(time)) return "That time isn't one of the studio's slots";
  const now = studioNow();
  if (date < now.date || (date === now.date && toMin(time) <= now.minute)) return "That time has already passed";
  if (date > addDays(now.date, BOOKING_WINDOW_DAYS)) return `Bookings open ${BOOKING_WINDOW_DAYS} days ahead`;
  return null;
}

/** Specialists with nothing overlapping [time, time + dur) on that day's bookings. */
export function freeSpecialists(dayBookings: Booking[], time: string, dur: number, excludeCode?: string) {
  const start = toMin(time), end = start + dur;
  const busy = new Set(
    dayBookings
      .filter((b) => b.code !== excludeCode && ACTIVE.includes(b.status))
      .filter((b) => {
        const s = toMin(b.time);
        return s < end && start < s + b.durationMin;
      })
      .map((b) => b.specialist),
  );
  return SPECIALISTS.filter((p) => !busy.has(p));
}
