import { SERVICES, SPECIALISTS, STATUSES, type Booking, type Status } from "./catalog";

type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const str = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const CODE = /^BT-[A-Z0-9]{5}$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

export const isCode = (c: string) => CODE.test(c);

/** Validates a booking sent by the mobile app. Price and duration come from the catalogue. */
export function parseNewBooking(body: unknown): Result<Booking> {
  const b = (body ?? {}) as Record<string, unknown>;
  const code = str(b.code, 9).toUpperCase();
  const serviceId = str(b.serviceId, 10);
  const specialist = str(b.specialist, 40);
  const date = str(b.date, 10);
  const time = str(b.time, 5);
  const name = str(b.name, 100);
  const phone = str(b.phone, 30);
  const email = str(b.email, 200);
  const notes = str(b.notes, 1000);
  const svc = SERVICES[serviceId];

  if (!isCode(code)) return { ok: false, error: "Invalid booking code" };
  if (!svc) return { ok: false, error: "Unknown service" };
  if (!SPECIALISTS.includes(specialist)) return { ok: false, error: "Unknown specialist" };
  if (!DATE.test(date) || !TIME.test(time)) return { ok: false, error: "Invalid date or time" };
  if (name.length < 2) return { ok: false, error: "Name is required" };
  if (phone.replace(/\D/g, "").length < 7) return { ok: false, error: "Phone number is required" };

  const now = Date.now();
  return {
    ok: true,
    value: {
      code, serviceId, serviceName: svc.name, price: svc.price, durationMin: svc.dur,
      specialist, date, time, name, phone, email, notes,
      status: "Confirmed", createdAt: now, updatedAt: now,
    },
  };
}

/** What a guest may change with their code: cancel, or move date/time/specialist. */
export function parseGuestPatch(body: unknown): Result<{ date?: string; time?: string; specialist?: string; status?: "Cancelled" }> {
  const b = (body ?? {}) as Record<string, unknown>;
  if (b.action === "cancel") return { ok: true, value: { status: "Cancelled" } };
  if (b.action === "reschedule") {
    const date = str(b.date, 10), time = str(b.time, 5), specialist = str(b.specialist, 40);
    if (!DATE.test(date) || !TIME.test(time)) return { ok: false, error: "Invalid date or time" };
    if (specialist && !SPECIALISTS.includes(specialist)) return { ok: false, error: "Unknown specialist" };
    return { ok: true, value: { date, time, ...(specialist ? { specialist } : {}) } };
  }
  return { ok: false, error: 'action must be "cancel" or "reschedule"' };
}

export function parseStatus(body: unknown): Result<Status> {
  const s = (body as { status?: unknown })?.status;
  return STATUSES.includes(s as Status) ? { ok: true, value: s as Status } : { ok: false, error: "Invalid status" };
}

export const normalizeCode = (raw: string) => {
  let c = raw.toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (c.startsWith("BT")) c = c.slice(2);
  return "BT-" + c;
};
