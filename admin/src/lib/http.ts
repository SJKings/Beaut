import { DbNotConfigured } from "./db";

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

/** Turns storage failures into a clear 503 instead of a bare 500. */
export function serverError(e: unknown, cors = false) {
  console.error(e);
  const message = e instanceof DbNotConfigured ? e.message : "Server error";
  return json({ error: message }, e instanceof DbNotConfigured ? 503 : 500, cors ? CORS : {});
}
