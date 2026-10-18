import "dotenv/config";
import { defineConfig } from "prisma/config";
import { migrationDb } from "./scripts/db-url.mjs";

// Migrations need a direct (non-pooled) postgres:// connection; see scripts/db-url.mjs.
const db = migrationDb();

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  ...(db ? { datasource: { url: db.url } } : {}),
});
