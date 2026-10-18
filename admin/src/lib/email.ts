import { formatMoney, STUDIO, type Booking } from "./catalog";

// Booking confirmations are sent with Resend (resend.com) when RESEND_API_KEY and
// EMAIL_FROM are set. EMAIL_FROM must be on a domain verified in Resend, e.g.
// "Beaut Studio <bookings@yourdomain.com>".
export const emailEnabled = () => !!(process.env.RESEND_API_KEY && process.env.EMAIL_FROM);

const fmtDate = (s: string) =>
  new Date(s + "T12:00:00Z").toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: "UTC" });

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Sends the guest their code. Returns whether it was accepted for delivery; never throws. */
export async function sendConfirmation(b: Booking): Promise<boolean> {
  if (!emailEnabled() || !b.email) return false;
  const when = `${fmtDate(b.date)} at ${b.time}`;
  const text = [
    `Hi ${b.name},`,
    ``,
    `You're booked at ${STUDIO.name}.`,
    ``,
    `Booking code: ${b.code}`,
    `${b.serviceName} with ${b.specialist}`,
    when,
    `${formatMoney(b.price)}, pay at the studio`,
    ``,
    `Use your code in the Beaut app to view, reschedule or cancel.`,
    STUDIO.address,
  ].join("\n");
  const html = `<div style="font-family:Arial,sans-serif;color:#1E1A1B;max-width:480px">
  <p>Hi ${esc(b.name)},</p>
  <p>You're booked at <strong>${esc(STUDIO.name)}</strong>.</p>
  <div style="border:1.5px dashed #E3A6BD;background:#FFF5F8;border-radius:16px;padding:18px;text-align:center;margin:16px 0">
    <div style="font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:#B23763;font-weight:bold">Booking code</div>
    <div style="font-family:monospace;font-size:30px;font-weight:bold;letter-spacing:.08em;margin-top:6px">${esc(b.code)}</div>
  </div>
  <p style="margin:4px 0"><strong>${esc(b.serviceName)}</strong> with ${esc(b.specialist)}</p>
  <p style="margin:4px 0">${esc(when)}</p>
  <p style="margin:4px 0">${formatMoney(b.price)}, pay at the studio</p>
  <p style="color:#6E6265">Use your code in the Beaut app to view, reschedule or cancel.<br>${esc(STUDIO.address)}</p>
</div>`;

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 6000);
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM, to: [b.email], subject: `Your Beaut booking ${b.code}`, text, html }),
      signal: controller.signal,
    });
    if (!res.ok) console.error("Resend rejected email", res.status, await res.text().catch(() => ""));
    return res.ok;
  } catch (e) {
    console.error("Email send failed", e);
    return false;
  } finally {
    clearTimeout(timer);
  }
}
