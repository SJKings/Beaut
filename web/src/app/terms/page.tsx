import type { Metadata } from "next";
import Link from "next/link";
import { Footer, Header } from "@/components/chrome";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Use",
  description: "The terms for booking with Beaut.",
};

export default function TermsPage() {
  const contact = <a href={`mailto:${SITE.email}`}>{SITE.email}</a>;
  return (
    <div className="shell">
      <Header />
      <main className="wrap doc">
        <h1>Terms of Use</h1>
        <p className="updated">Last updated {SITE.updated}</p>

        <p>
          These terms apply when you use the Beaut app or this website to book services at {SITE.studio}, operated by {SITE.business}
          (&ldquo;we&rdquo;, &ldquo;us&rdquo;). By making a booking you agree to them. Our <Link href="/privacy">Privacy Policy</Link> explains how we
          handle your information.
        </p>

        <h2>Bookings</h2>
        <ul>
          <li>You can book without an account. Each booking gets a unique code, which is how you view, reschedule or cancel it.</li>
          <li>Give your real name and a phone number we can reach you on. Only make bookings for yourself or with the person&apos;s permission.</li>
          <li>A booking is confirmed when the app shows your code. Specialists are subject to availability; if you choose &ldquo;Any available&rdquo;, we assign one for you.</li>
          <li>Keep your code private. Anyone who has it can see and change that booking.</li>
        </ul>

        <h2>Arriving, changes and cancellations</h2>
        <ul>
          <li>Please arrive about 10 minutes before your appointment.</li>
          <li>You can reschedule or cancel in the app with your code. Please do so at least 12 hours before your appointment so the slot can go to someone else.</li>
          <li>If you don&apos;t arrive, the studio may mark the booking as a no-show.</li>
          <li>We may need to move or cancel a booking (for example if a specialist is unwell). We will contact you on the phone number you gave.</li>
        </ul>

        <h2>Prices and payment</h2>
        <p>
          Prices are shown in naira in the app at the time you book. You pay at the studio after your appointment; the app does not take payment. Prices may
          change, but the price shown when you booked applies to that booking.
        </p>

        <h2>Your health and safety</h2>
        <p>
          Tell your specialist about allergies, sensitivities or conditions that could affect a treatment, using the notes field or in person. The studio may
          decline or adjust a treatment if it isn&apos;t safe to go ahead.
        </p>

        <h2>Using the service fairly</h2>
        <p>
          Don&apos;t misuse the app or this website, for example by making fake or repeated bookings, guessing other people&apos;s codes or interfering with
          the system. We may cancel bookings or limit access where this happens.
        </p>

        <h2>Our responsibility</h2>
        <p>
          We work to keep the app available and accurate, but can&apos;t promise it will always be uninterrupted or error-free. Nothing in these terms limits
          rights you have under Nigerian consumer protection law or other law that cannot be excluded.
        </p>

        <h2>Changes to these terms</h2>
        <p>We may update these terms. The date above shows the latest version; continuing to book after a change means you accept it.</p>

        <h2>Contact</h2>
        <p>
          {SITE.business}
          <br />
          {SITE.address}
          <br />
          {contact}
        </p>
      </main>
      <Footer />
    </div>
  );
}
