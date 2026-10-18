import { db, DuplicateCode } from "@/lib/db";
import { guestJson, preflight, readJson, serverError } from "@/lib/http";
import { parseNewBooking } from "@/lib/validate";

export const OPTIONS = preflight;

// POST /api/bookings: a guest books from the app. 409 means the code is taken
// and the app should retry with a new one.
export async function POST(req: Request) {
  const parsed = parseNewBooking(await readJson(req));
  if (!parsed.ok) return guestJson({ error: parsed.error }, 400);
  try {
    const booking = await db().insert(parsed.value);
    return guestJson({ booking }, 201);
  } catch (e) {
    if (e instanceof DuplicateCode) return guestJson({ error: "Code already in use" }, 409);
    return serverError(e, true);
  }
}
