import { DbNotConfigured } from "./db";
import { describeDbError } from "./dberror";

// Guest endpoints are called by the Beaut app (and its web build), so they allow any origin.
export const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Accept",
};

export const json = (data: unknown, status = 200, headers: HeadersInit = {}) =>
  Response.json(data, { status, headers: { "Cache-Control": "no-store", ...headers } });

export const guestJson = (data: unknown, status = 200) => json(data, status, CORS);
export const preflight = () => new Response(null, { status: 204, headers: CORS });

export async function readJson(req: Request): Promise<unknown> {
  try {
    return await req.json();
  } catch {
    return null;
  }
}

/**
 * Storage failures. Guest endpoints (cors) get a generic message; the studio's
 * endpoints say what's wrong and how to fix it.
 */
export function serverError(e: unknown, cors = false) {
  console.error(e);
  const status = e instanceof DbNotConfigured ? 503 : 500;
  if (cors) return json({ error: "The studio's booking system is unavailable. Please try again shortly." }, status, CORS);
  const { state, message } = describeDbError(e);
  return json({ error: message, state }, status);
}
