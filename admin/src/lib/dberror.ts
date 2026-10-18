import { unusableDbVars } from "../../scripts/db-url.mjs";
import { DbNotConfigured } from "./db";

/**
 * Turns a database failure into something the studio can act on (shown on the
 * dashboard and /api/health). Guests only ever see a generic message.
 */
export function describeDbError(e: unknown): { state: string; message: string } {
  const err = e as { code?: string; message?: string; cause?: { code?: string; message?: string } };
  const text = `${err?.code ?? ""} ${err?.message ?? ""} ${err?.cause?.code ?? ""} ${err?.cause?.message ?? ""}`;

  if (e instanceof DbNotConfigured) {
    const bad = unusableDbVars();
    return {
      state: "not_configured",
      message:
        "No database is connected to this deployment. In Vercel, open the project's Storage tab and connect the Postgres database to Production (and Preview), then redeploy." +
        (bad.length ? ` (${bad.join(", ")} is set but isn't a postgres:// address.)` : ""),
    };
  }
  if (/P2021|P2022|does not exist|relation .* not exist/i.test(text))
    return {
      state: "tables_missing",
      message: "The database is connected but its tables haven't been created (the migration didn't run). Redeploy the latest commit in Vercel; the build creates them.",
    };
  if (/28P01|password authentication failed/i.test(text))
    return { state: "auth_failed", message: "The database rejected the password in its connection string. Reconnect the database in Vercel's Storage tab." };
  if (/P1001|P1002|ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EAI_AGAIN|timeout|Can't reach database/i.test(text))
    return { state: "unreachable", message: "Can't connect to the database server. Check that the database in Vercel's Storage tab is running and connected to this project." };
  return { state: "error", message: "The database returned an error. Check the Vercel function logs for details." };
}
