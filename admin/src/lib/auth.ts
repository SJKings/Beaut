import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

// Single shared studio password (ADMIN_PASSWORD). The session cookie holds an HMAC
// of the password, so changing the password signs everyone out.
export const COOKIE = "beaut_admin";
const MAX_AGE = 60 * 60 * 24 * 30;

const password = () => process.env.ADMIN_PASSWORD ?? "";
export const passwordConfigured = () => password().length > 0;

const token = () => createHmac("sha256", password()).update("beaut-admin-session-v1").digest("hex");

const same = (a: string, b: string) => {
  const x = Buffer.from(a), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
};

export const checkPassword = (attempt: string) => passwordConfigured() && same(attempt, password());

export async function isAdmin() {
  if (!passwordConfigured()) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && same(c, token());
}

export async function startSession() {
  (await cookies()).set(COOKIE, token(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(COOKIE);
}
