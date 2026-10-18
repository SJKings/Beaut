import { createHash } from "node:crypto";
import { db } from "./db";

// Per-IP limits on the public guest endpoints (stored in the database so they
// hold across serverless instances). Only a salted hash of the IP is stored, and
// expired counters are deleted (see db.ts), as the privacy policy states.
export const LIMITS = {
  /** Wrong codes before lookups are blocked: stops someone guessing codes. */
  misses: { max: 10, windowSec: 15 * 60 },
  /** New bookings per IP: stops form spam. */
  creates: { max: 20, windowSec: 60 * 60 },
};

const SALT = process.env.ADMIN_PASSWORD || "beaut";

/** A stable, non-reversible key for the caller's IP address. */
export const clientIp = (req: Request) => {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "unknown";
  return createHash("sha256").update(SALT + ip).digest("base64url").slice(0, 22);
};

export async function lookupsBlocked(ip: string) {
  return (await db().peek(`miss:${ip}`, LIMITS.misses.windowSec)) >= LIMITS.misses.max;
}

export async function recordMiss(ip: string) {
  await db().hit(`miss:${ip}`, LIMITS.misses.windowSec);
}

/** Counts this create; true when the IP is over the limit. */
export async function tooManyCreates(ip: string) {
  return (await db().hit(`create:${ip}`, LIMITS.creates.windowSec)) > LIMITS.creates.max;
}
