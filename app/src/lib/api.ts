import { svcOf, type Booking } from './data';

// Base URL of the Next.js backend, e.g. https://beaut-studio.vercel.app
// Set per build in eas.json (EXPO_PUBLIC_API_URL). When empty, bookings stay on
// the device only, which keeps local development working without a server.
export const API_URL = (process.env.EXPO_PUBLIC_API_URL ?? '').trim().replace(/\/+$/, '');

const TIMEOUT_MS = 15000;

/** POSTs a new booking to the studio backend. Throws if the server doesn't accept it. */
export async function submitBooking(b: Booking): Promise<void> {
  if (!API_URL) return;
  const sv = svcOf(b.serviceId);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(`${API_URL}/api/bookings`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({
        code: b.code,
        serviceId: b.serviceId,
        serviceName: sv.name,
        price: sv.price,
        durationMin: sv.dur,
        specialist: b.spec,
        date: b.date,
        time: b.time,
        name: b.name,
        phone: b.phone,
        email: b.email,
        notes: b.notes,
        status: b.status,
        createdAt: b.createdAt,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Booking API responded ${res.status}`);
  } finally {
    clearTimeout(timer);
  }
}
