import { createBooking, SlotUnavailable } from "@/lib/bookings";
import { DuplicateCode } from "@/lib/db";
import { sendConfirmation } from "@/lib/email";
import { guestJson, preflight, readJson, serverError } from "@/lib/http";
import { clientIp, tooManyCreates } from "@/lib/ratelimit";
import { parseNewBooking } from "@/lib/validate";

export const OPTIONS = preflight;

// POST /api/bookings: a guest books from the app.
// 409 { reason: "code_taken" } → the app retries with a new code.
// 409 { reason: "slot_taken" } → the time/specialist was just booked.
export async function POST(req: Request) {
  const parsed = parseNewBooking(await readJson(req));
  if (!parsed.ok) return guestJson({ error: parsed.error }, 400);
  try {
    if (await tooManyCreates(clientIp(req))) return guestJson({ error: "Too many bookings from this connection. Try again later." }, 429);
    const booking = await createBooking(parsed.value);
    const emailSent = await sendConfirmation(booking);
    return guestJson({ booking, emailSent }, 201);
  } catch (e) {
    if (e instanceof DuplicateCode) return guestJson({ error: "Code already in use", reason: "code_taken" }, 409);
    if (e instanceof SlotUnavailable) return guestJson({ error: e.message, reason: "slot_taken" }, 409);
    return serverError(e, true);
  }
}
