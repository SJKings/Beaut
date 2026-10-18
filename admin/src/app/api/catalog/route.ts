import { ANY, SERVICES, SLOTS, SPECIALISTS, STUDIO } from "@/lib/catalog";
import { emailEnabled } from "@/lib/email";
import { CORS, preflight } from "@/lib/http";

export const OPTIONS = preflight;

// GET /api/catalog: services, prices, specialists and slots for the mobile app.
// Edit src/lib/catalog.ts and redeploy; apps pick it up on their next launch.
export function GET() {
  return Response.json(
    {
      services: SERVICES,
      specialists: [ANY, ...SPECIALISTS],
      slots: SLOTS,
      studio: { name: STUDIO.name, address: STUDIO.address, closesAt: STUDIO.closesAt },
      emailEnabled: emailEnabled(),
    },
    { headers: { ...CORS, "Cache-Control": "public, max-age=60" } },
  );
}
