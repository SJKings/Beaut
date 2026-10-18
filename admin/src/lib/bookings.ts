import { ACTIVE, ANY, type Booking, type Status } from "./catalog";
import { db } from "./db";
import { freeSpecialists, slotProblem } from "./schedule";

/** The slot can't be booked; `message` is shown to the guest or studio. */
export class SlotUnavailable extends Error {}

/**
 * Picks who does the booking: the requested specialist if free, otherwise (for
 * "Any available") the first free one. Throws SlotUnavailable when nobody is.
 */
function assign(day: Booking[], requested: string, time: string, dur: number, excludeCode?: string) {
  const free = freeSpecialists(day, time, dur, excludeCode);
  if (requested === ANY) {
    if (!free.length) throw new SlotUnavailable("That time is fully booked. Please pick another time.");
    return free[0];
  }
  if (!free.includes(requested)) throw new SlotUnavailable(`${requested} is already booked at ${time}. Please pick another time or specialist.`);
  return requested;
}

/** Validated new booking from the app (specialist may be "Any available"). */
export async function createBooking(b: Booking): Promise<Booking> {
  const problem = slotProblem(b.date, b.time, b.durationMin);
  if (problem) throw new SlotUnavailable(problem);
  return db().lockDays([b.date], async (ops) => {
    const specialist = assign(await ops.onDate(b.date), b.specialist, b.time, b.durationMin);
    return ops.insert({ ...b, specialist });
  });
}

/** Guest moves a confirmed booking. Returns null when the code doesn't exist. */
export async function rescheduleBooking(code: string, to: { date: string; time: string; specialist?: string }) {
  const current = await db().get(code);
  if (!current) return null;
  const problem = slotProblem(to.date, to.time, current.durationMin);
  if (problem) throw new SlotUnavailable(problem);
  return db().lockDays([current.date, to.date], async (ops) => {
    const cur = await ops.get(code);
    if (!cur || cur.status !== "Confirmed") throw new SlotUnavailable(`This booking is ${cur?.status.toLowerCase() ?? "gone"} and can't be changed.`);
    const specialist = assign(await ops.onDate(to.date), to.specialist || cur.specialist, to.time, cur.durationMin, code);
    return ops.update(code, { date: to.date, time: to.time, specialist });
  });
}

/**
 * Status change. Moving a booking back into an active status (e.g. reinstating a
 * cancellation) re-checks that its specialist is still free.
 */
export async function setStatus(code: string, status: Status, opts: { guest?: boolean } = {}) {
  const current = await db().get(code);
  if (!current) return null;
  return db().lockDays([current.date], async (ops) => {
    const cur = (await ops.get(code))!;
    if (opts.guest && cur.status !== "Confirmed") throw new SlotUnavailable(`This booking is ${cur.status.toLowerCase()} and can't be changed.`);
    if (ACTIVE.includes(status) && !ACTIVE.includes(cur.status)) {
      const free = freeSpecialists(await ops.onDate(cur.date), cur.time, cur.durationMin, code);
      if (!free.includes(cur.specialist)) throw new SlotUnavailable(`${cur.specialist} has since been booked at ${cur.time}, so this can't be reinstated.`);
    }
    return ops.update(code, { status });
  });
}

/** What someone holding only the code sees: enough to recognise the booking, not the full contact details. */
export function forGuest(b: Booking) {
  const digits = b.phone.replace(/\D/g, "").length;
  let seen = 0;
  const phone = b.phone.replace(/\d/g, (d) => (++seen > digits - 4 ? d : "•"));
  const email = b.email ? b.email.replace(/^(.)[^@]*(@.*)$/, "$1•••$2") : "";
  const [first, ...rest] = b.name.split(/\s+/);
  const name = rest.length ? `${first} ${rest[rest.length - 1][0]}.` : first;
  return { ...b, name, phone, email, notes: b.notes ? "•••" : "", masked: true };
}
