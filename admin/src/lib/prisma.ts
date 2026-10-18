import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";
import { runtimeDb } from "../../scripts/db-url.mjs";

// Runtime connection (pooled first); see scripts/db-url.mjs for the order.
const picked = runtimeDb();
export const DB_URL = picked?.url ?? "";
export const DB_URL_VAR = picked?.name ?? null;

// Prisma-specific hints in Vercel's URL (pgbouncer=true, connect_timeout) mean
// nothing to the pg driver, so drop them.
const forPg = (url: string) => {
  try {
    const u = new URL(url);
    u.searchParams.delete("pgbouncer");
    u.searchParams.delete("connect_timeout");
    return u.toString();
  } catch {
    return url;
  }
};

const g = globalThis as unknown as { __beautPrisma?: PrismaClient };

/** One client per server instance (and across dev hot reloads). */
export function prisma() {
  return (g.__beautPrisma ??= new PrismaClient({
    adapter: new PrismaPg({ connectionString: forPg(DB_URL), max: 3, idleTimeoutMillis: 20_000 }),
  }));
}
