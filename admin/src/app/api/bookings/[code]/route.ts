import { db } from "@/lib/db";
import { guestJson, preflight, readJson, serverError } from "@/lib/http";
import { isCode, normalizeCode, parseGuestPatch } from "@/lib/validate";

export const OPTIONS = preflight;

// GET /api/bookings/BT-XXXXX: the booking code is the guest's key, so anyone
// holding it can see and change that one booking (same as the app's design).
export async function GET(_req: Request, ctx: RouteContext<"/api/bookings/[code]">) {
  const code = normalizeCode((await ctx.params).code);
  if (!isCode(code)) return guestJson({ error: "Invalid booking code" }, 400);
  try {
    const booking = await db().get(code);
    return booking ? guestJson({ booking }) : guestJson({ error: "Not found" }, 404);
  } catch (e) {
    return serverError(e, true);
  }
}

// PATCH /api/bookings/BT-XXXXX  { action: "cancel" } | { action: "reschedule", date, time, specialist? }
export async function PATCH(req: Request, ctx: RouteContext<"/api/bookings/[code]">) {
  const code = normalizeCode((await ctx.params).code);
  if (!isCode(code)) return guestJson({ error: "Invalid booking code" }, 400);
  const parsed = parseGuestPatch(await readJson(req));
  if (!parsed.ok) return guestJson({ error: parsed.error }, 400);
  try {
    const current = await db().get(code);
    if (!current) return guestJson({ error: "Not found" }, 404);
    if (current.status !== "Confirmed") return guestJson({ error: `Booking is ${current.status.toLowerCase()} and can't be changed` }, 409);
    const booking = await db().update(code, parsed.value);
    return guestJson({ booking });
  } catch (e) {
    return serverError(e, true);
  }
}
