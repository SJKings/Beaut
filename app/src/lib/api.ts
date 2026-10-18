import type { Booking, Catalog } from './data';

// Base URL of the Beaut Studio admin (the Next.js app in admin/), e.g.
// https://beaut-studio.vercel.app. Set per build in eas.json (EXPO_PUBLIC_API_URL).
// When empty, bookings stay on the device only, which keeps local development
// working without a server.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
export const hasBackend = API_URL.length > 0;

const TIMEOUT_MS = 15000;

/** The server refused the request; `message` is safe to show the guest. */
export class ApiError extends Error {}
/** The code is already taken on the server; pick another and retry. */
export class DuplicateCodeError extends ApiError {}
/** The time or specialist was booked by someone else (or the booking can't change any more). */
export class SlotTakenError extends ApiError {}

type ServerBooking = {
  code: string;
  serviceId: string;
  specialist: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: Booking['status'];
  createdAt: number;
  /** Lookups by code return contact details partly hidden. */
  masked?: boolean;
};

/** A booking from the server, plus whether its contact details are hidden. */
export type Fetched = { booking: Booking; masked: boolean };

const fromServer = (b: ServerBooking): Booking => ({
  code: b.code,
  serviceId: b.serviceId,
  spec: b.specialist,
  date: b.date,
  time: b.time,
  name: b.name,
  phone: b.phone,
  email: b.email,
  notes: b.notes,
  status: b.status,
  createdAt: b.createdAt,
});

async function request(path: string, init?: RequestInit) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    return await fetch(API_URL + path, {
      ...init,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timer);
  }
}

const readError = async (res: Response) => {
  try {
    const body = (await res.json()) as { error?: string; reason?: string };
    return { message: body.error ?? `Request failed (${res.status})`, reason: body.reason };
  } catch {
    return { message: `Request failed (${res.status})`, reason: undefined };
  }
};

async function fail(res: Response): Promise<never> {
  const { message, reason } = await readError(res);
  if (reason === 'code_taken') throw new DuplicateCodeError(message);
  if (reason === 'slot_taken') throw new SlotTakenError(message);
  throw new ApiError(message);
}

/**
 * POST /api/bookings. The server prices the booking from its own catalogue,
 * assigns a specialist for "Any available" and emails the code if it can.
 */
export async function submitBooking(b: Booking): Promise<Booking> {
  if (!hasBackend) return b;
  const res = await request('/api/bookings', {
    method: 'POST',
    body: JSON.stringify({
      code: b.code,
      serviceId: b.serviceId,
      specialist: b.spec,
      date: b.date,
      time: b.time,
      name: b.name,
      phone: b.phone,
      email: b.email,
      notes: b.notes,
    }),
  });
  if (!res.ok) return fail(res);
  const body = await res.json();
  return { ...fromServer(body.booking), emailSent: !!body.emailSent };
}

/** GET /api/bookings/:code. Null when the code doesn't exist. */
export async function fetchBooking(code: string): Promise<Fetched | null> {
  const res = await request('/api/bookings/' + encodeURIComponent(code));
  if (res.status === 404) return null;
  if (!res.ok) return fail(res);
  const b: ServerBooking = (await res.json()).booking;
  return { booking: fromServer(b), masked: !!b.masked };
}

export type GuestChange = { action: 'cancel' } | { action: 'reschedule'; date: string; time: string; specialist: string };

/** PATCH /api/bookings/:code: the guest cancels or moves their booking. */
export async function changeBooking(code: string, change: GuestChange): Promise<Fetched> {
  const res = await request('/api/bookings/' + encodeURIComponent(code), { method: 'PATCH', body: JSON.stringify(change) });
  if (!res.ok) return fail(res);
  const b: ServerBooking = (await res.json()).booking;
  return { booking: fromServer(b), masked: !!b.masked };
}

/** GET /api/catalog: the studio's live services, prices, specialists and slots. */
export async function fetchCatalog(): Promise<Catalog> {
  const res = await request('/api/catalog');
  if (!res.ok) return fail(res);
  return (await res.json()) as Catalog;
}

/** Free specialists per slot; `exclude` ignores the guest's own booking when rescheduling. */
export async function fetchAvailability(date: string, serviceId: string, exclude?: string): Promise<Record<string, string[]>> {
  const q = `date=${date}&serviceId=${encodeURIComponent(serviceId)}` + (exclude ? `&exclude=${encodeURIComponent(exclude)}` : '');
  const res = await request('/api/availability?' + q);
  if (!res.ok) return fail(res);
  const { slots } = (await res.json()) as { slots: { time: string; free: string[] }[] };
  return Object.fromEntries(slots.map((s) => [s.time, s.free]));
}
