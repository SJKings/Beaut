import { isAdmin } from "@/lib/auth";
import { setStatus, SlotUnavailable } from "@/lib/bookings";
import { json, readJson, serverError } from "@/lib/http";
import { parseStatus } from "@/lib/validate";

// PATCH /api/admin/bookings/BT-XXXXX  { status }: check in, complete, no-show, cancel, reinstate.
export async function PATCH(req: Request, ctx: RouteContext<"/api/admin/bookings/[code]">) {
  if (!(await isAdmin())) return json({ error: "Sign in required" }, 401);
  const parsed = parseStatus(await readJson(req));
  if (!parsed.ok) return json({ error: parsed.error }, 400);
  try {
    const booking = await setStatus((await ctx.params).code, parsed.value);
    return booking ? json({ booking }) : json({ error: "Not found" }, 404);
  } catch (e) {
    if (e instanceof SlotUnavailable) return json({ error: e.message }, 409);
    return serverError(e);
  }
}
