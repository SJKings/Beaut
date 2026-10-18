// Applies pending Prisma migrations during `npm run build` (i.e. on every Vercel
// deploy). Skipped when no database is configured, so local builds still work.
import { execSync } from "node:child_process";

const url = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL_UNPOOLED || process.env.DATABASE_URL || process.env.POSTGRES_URL;
if (!url) {
  console.log("No database URL set: skipping prisma migrate deploy.");
} else {
  execSync("prisma migrate deploy", { stdio: "inherit" });
}
