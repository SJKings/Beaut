import type { Booking } from './data';

// Base URL of the Beaut Studio admin (the Next.js app in admin/), e.g.
// https://beaut-studio.vercel.app. Set per build in eas.json (EXPO_PUBLIC_API_URL).
// When empty, bookings stay on the device only, which keeps local development
// working without a server.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');
export const hasBackend = API_URL.length > 0;

const TIMEOUT_MS = 15000;

/** The code is already taken on the server; pick another and retry. */
export class DuplicateCodeError extends Error {}
/** The server refused the request; `message` is safe to show the guest. */
export class ApiError extends Error {}

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
};

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

const errorText = async (res: Response) => {
  try {
    return ((await res.json()) as { error?: string }).error ?? `Request failed (${res.status})`;
  } catch {
    return `Request failed (${res.status})`;
  }
};

/** POST /api/bookings. The server prices the booking from its own catalogue. */
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
  if (res.status === 409) throw new DuplicateCodeError();
  if (!res.ok) throw new ApiError(await errorText(res));
  return fromServer((await res.json()).booking);
}

/** GET /api/bookings/:code. Null when the code doesn't exist. */
export async function fetchBooking(code: string): Promise<Booking | null> {
  const res = await request('/api/bookings/' + encodeURIComponent(code));
  if (res.status === 404) return null;
  if (!res.ok) throw new ApiError(await errorText(res));
  return fromServer((await res.json()).booking);
}

export type GuestChange = { action: 'cancel' } | { action: 'reschedule'; date: string; time: string; specialist: string };

/** PATCH /api/bookings/:code: the guest cancels or moves their booking. */
export async function changeBooking(code: string, change: GuestChange): Promise<Booking> {
  const res = await request('/api/bookings/' + encodeURIComponent(code), { method: 'PATCH', body: JSON.stringify(change) });
  if (!res.ok) throw new ApiError(await errorText(res));
  return fromServer((await res.json()).booking);
}
