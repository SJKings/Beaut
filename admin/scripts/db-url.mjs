// Picks the Postgres connection string from whatever the hosting set up.
// Vercel's database integrations use different names (Neon: POSTGRES_PRISMA_URL /
// POSTGRES_URL_NON_POOLING; Prisma Postgres: DATABASE_URL / POSTGRES_URL plus a
// "prisma+postgres://" Accelerate URL in PRISMA_DATABASE_URL). Only plain
// postgres:// URLs work with the pg driver and with migrations, so those win.

const isPg = (v) => typeof v === "string" && /^postgres(ql)?:\/\//i.test(v.trim());

// Vercel can prefix integration variables (e.g. STORAGE_DATABASE_URL), so after
// the standard names, any variable ending in one of these suffixes counts too.
const SUFFIXES = ["POSTGRES_PRISMA_URL", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"];
const looksLikeDb = (name) => SUFFIXES.some((s) => name === s || name.endsWith("_" + s)) || name.endsWith("PRISMA_DATABASE_URL");

function pick(names) {
  for (const name of names) {
    const value = process.env[name];
    if (isPg(value)) return { name, url: value.trim() };
  }
  // Prefixed variants, in the same preference order as `names`.
  for (const suffix of names) {
    const name = Object.keys(process.env)
      .filter((n) => n.endsWith("_" + suffix) && isPg(process.env[n]))
      .sort()[0];
    if (name) return { name, url: process.env[name].trim() };
  }
  return null;
}

/** Names (never values) of every database-looking variable that is set. */
export const dbVarNames = () => Object.keys(process.env).filter(looksLikeDb).sort();

/** For the running app: pooled first. */
export const runtimeDb = () =>
  pick(["POSTGRES_PRISMA_URL", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED"]);

/** For migrations: direct (non-pooled) first. */
export const migrationDb = () =>
  pick(["POSTGRES_URL_NON_POOLING", "DATABASE_URL_UNPOOLED", "DATABASE_URL", "POSTGRES_URL", "POSTGRES_PRISMA_URL"]);

/** Names of database-looking variables that are set but unusable (e.g. prisma+postgres://). */
export const unusableDbVars = () => dbVarNames().filter((n) => process.env[n] && !isPg(process.env[n]));
