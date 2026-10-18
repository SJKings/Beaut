// Picks the Postgres connection string from whatever the hosting set up.
// Vercel's database integrations use different names (Neon: POSTGRES_PRISMA_URL /
// POSTGRES_URL_NON_POOLING; Prisma Postgres: DATABASE_URL / POSTGRES_URL plus a
// "prisma+postgres://" Accelerate URL in PRISMA_DATABASE_URL). Only plain
// postgres:// URLs work with the pg driver and with migrations, so those win.

const isPg = (v) => typeof v === "string" && /^postgres(ql)?:\/\//i.test(v.trim());

function pick(names) {
  for (const name of names) {
    const value = process.env[name];
    if (isPg(value)) return { name, url: value.trim() };
  }
  return null;
}

/** For the running app: pooled first. */
export const runtimeDb = () =>
  pick(["POSTGRES_PRISMA_URL", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"]);

/** For migrations: direct (non-pooled) first. */
export const migrationDb = () =>
  pick(["POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"]);

/** Names of database-looking variables that are set but unusable (e.g. prisma+postgres://). */
export const unusableDbVars = () =>
  ["POSTGRES_PRISMA_URL", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED", "PRISMA_DATABASE_URL"].filter(
    (n) => process.env[n] && !isPg(process.env[n]),
  );
