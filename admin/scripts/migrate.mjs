// Applies pending Prisma migrations during `npm run build`, i.e. on every Vercel
// deploy, so the tables always match prisma/schema.prisma.
import { execSync } from "node:child_process";
import { migrationDb, unusableDbVars } from "./db-url.mjs";

const db = migrationDb();
if (db) {
  console.log(`Applying database migrations using ${db.name}…`);
  execSync("prisma migrate deploy", { stdio: "inherit" });
} else if (process.env.VERCEL) {
  // On Vercel a missing database would only show up later as a broken dashboard.
  const bad = unusableDbVars();
  console.error(
    "\n✖ No usable Postgres connection string for migrations.\n" +
      (bad.length ? `  Set but not a postgres:// URL: ${bad.join(", ")}\n` : "") +
      "  Connect a Postgres database to this project (Storage tab) for this environment\n" +
      "  (Production and Preview), or add DATABASE_URL, then redeploy.\n",
  );
  process.exit(1);
} else {
  console.log("No database URL set: skipping prisma migrate deploy (local build).");
}
