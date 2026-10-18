import { db } from "@/lib/db";
import { guestJson, preflight, serverError } from "@/lib/http";
import { freeSpecialists, slotProblem } from "@/lib/schedule";
import { SLOTS, svcById } from "@/lib/catalog";
import { isDate, normalizeCode } from "@/lib/validate";

export const OPTIONS = preflight;

// GET /api/availability?date=YYYY-MM-DD&serviceId=s1[&exclude=BT-XXXXX]
// → { slots: [{ time, free: ["Lena K.", …] }] }. A slot with no one free (or in the
// past) has free: []. `exclude` ignores the guest's own booking when rescheduling.
export async function GET(req: Request) {
  const url = new URL(req.url);
  const date = url.searchParams.get("date") ?? "";
  const svc = svcById(url.searchParams.get("serviceId") ?? "");
  const exclude = url.searchParams.get("exclude");
  if (!isDate(date) || !svc) return guestJson({ error: "date and serviceId are required" }, 400);
  try {
    const day = await db().onDate(date);
    const slots = SLOTS.map((time) => ({
      time,
      free: slotProblem(date, time, svc.dur) ? [] : freeSpecialists(day, time, svc.dur, exclude ? normalizeCode(exclude) : undefined),
    }));
    return guestJson({ date, slots });
  } catch (e) {
    return serverError(e, true);
  }
}
