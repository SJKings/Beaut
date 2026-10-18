import { passwordConfigured } from "@/lib/auth";
import { db } from "@/lib/db";
import { describeDbError } from "@/lib/dberror";
import { emailEnabled } from "@/lib/email";
import { CORS } from "@/lib/http";
import { DB_URL_VAR } from "@/lib/prisma";

// GET /api/health: is this deployment ready? Open it in a browser after deploying.
// Shows no secrets, only what's configured and whether the database answers.
export async function GET() {
  let database: { ok: boolean; state: string; message?: string; bookings?: number };
  try {
    const list = await db().list();
    database = { ok: true, state: "connected", bookings: list.length };
  } catch (e) {
    console.error(e);
    database = { ok: false, ...describeDbError(e) };
  }
  const body = {
    ok: database.ok && passwordConfigured(),
    database: { ...database, connectionVariable: DB_URL_VAR },
    adminPassword: passwordConfigured() ? "set" : "missing: add ADMIN_PASSWORD in Vercel → Settings → Environment Variables, then redeploy",
    email: emailEnabled() ? "on" : "off (optional: RESEND_API_KEY + EMAIL_FROM)",
  };
  return Response.json(body, { status: body.ok ? 200 : 503, headers: { ...CORS, "Cache-Control": "no-store" } });
}
