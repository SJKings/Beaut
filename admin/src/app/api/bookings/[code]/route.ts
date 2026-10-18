import { forGuest, rescheduleBooking, setStatus, SlotUnavailable } from "@/lib/bookings";
import { db } from "@/lib/db";
import { guestJson, preflight, readJson, serverError } from "@/lib/http";
import { clientIp, lookupsBlocked, recordMiss } from "@/lib/ratelimit";
import { isCode, normalizeCode, parseGuestPatch } from "@/lib/validate";

export const OPTIONS = preflight;

const BLOCKED = "Too many wrong codes. Try again in 15 minutes.";

// GET /api/bookings/BT-XXXXX: the code is the guest's key. Contact details come
// back partly hidden, and repeated wrong codes from one IP are blocked.
export async function GET(req: Request, ctx: RouteContext<"/api/bookings/[code]">) {
  const code = normalizeCode((await ctx.params).code);
  const ip = clientIp(req);
  try {
    if (await lookupsBlocked(ip)) return guestJson({ error: BLOCKED }, 429);
    const booking = isCode(code) ? await db().get(code) : null;
    if (!booking) {
      await recordMiss(ip);
      return guestJson({ error: "Not found" }, 404);
    }
    return guestJson({ booking: forGuest(booking) });
  } catch (e) {
    return serverError(e, true);
  }
}

// PATCH /api/bookings/BT-XXXXX  { action: "cancel" } | { action: "reschedule", date, time, specialist? }
export async function PATCH(req: Request, ctx: RouteContext<"/api/bookings/[code]">) {
  const code = normalizeCode((await ctx.params).code);
  const ip = clientIp(req);
  const parsed = parseGuestPatch(await readJson(req));
  if (!parsed.ok) return guestJson({ error: parsed.error }, 400);
  try {
    if (await lookupsBlocked(ip)) return guestJson({ error: BLOCKED }, 429);
    const p = parsed.value;
    const booking = !isCode(code)
      ? null
      : p.action === "cancel"
        ? await setStatus(code, "Cancelled", { guest: true })
        : await rescheduleBooking(code, p);
    if (!booking) {
      await recordMiss(ip);
      return guestJson({ error: "Not found" }, 404);
    }
    return guestJson({ booking: forGuest(booking) });
  } catch (e) {
    if (e instanceof SlotUnavailable) return guestJson({ error: e.message, reason: "slot_taken" }, 409);
    return serverError(e, true);
  }
}
