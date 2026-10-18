import { isAdmin } from "@/lib/auth";
import { db } from "@/lib/db";
import { json, serverError } from "@/lib/http";

// GET /api/admin/bookings: every booking, for the studio dashboard (polled).
export async function GET() {
  if (!(await isAdmin())) return json({ error: "Sign in required" }, 401);
  try {
    return json({ bookings: await db().list() });
  } catch (e) {
    return serverError(e);
  }
}
