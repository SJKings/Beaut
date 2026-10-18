import type { Metadata } from "next";
import { STUDIO } from "@/lib/catalog";

// Public privacy policy for the Beaut app and studio dashboard (linked from the
// Play Store listing and the app). Business name and contact come from Vercel
// environment variables so they can be changed without code.
export const metadata: Metadata = {
  title: "Privacy Policy · Beaut",
  description: "How Beaut handles your booking information.",
  robots: { index: true, follow: true },
};

const UPDATED = "18 October 2026";

export default function PrivacyPage() {
  const business = STUDIO.business;
  const email = STUDIO.contactEmail;
  const contact = email ? (
    <a href={`mailto:${email}`}>{email}</a>
  ) : (
    <span>the studio at {STUDIO.address.split(" · ")[0]}</span>
  );

  return (
    <main className="doc">
      <div className="brand doc-brand">
        Beaut<span className="dot">.</span>
      </div>
      <h1>Privacy Policy</h1>
      <p className="muted">Last updated {UPDATED}</p>

      <p>
        {business} (&ldquo;we&rdquo;, &ldquo;us&rdquo;) runs Beaut, an app for booking beauty services at {STUDIO.name}. You can book without creating an account: each
        booking gets a unique code (for example BT-4F7Q2) that you use to view, reschedule or cancel it. This policy explains what information we
        collect, why, and the choices you have. It covers the Beaut mobile app and the studio&apos;s booking system.
      </p>

      <h2>What we collect</h2>
      <p>When you make a booking, we collect only what the studio needs to provide your appointment:</p>
      <ul>
        <li>
          <strong>Your name and phone number</strong> (required), so the studio knows who to expect and can contact you about your appointment.
        </li>
        <li>
          <strong>Your email address</strong> (optional). If you give it, we use it to send you your booking code and appointment details.
        </li>
        <li>
          <strong>Notes for your specialist</strong> (optional), such as allergies or style preferences. Only include health information you are
          comfortable sharing with the studio.
        </li>
        <li>
          <strong>Booking details</strong>: the service, date, time, specialist, booking code, status (for example confirmed, checked in or
          cancelled) and when the booking was made or changed.
        </li>
      </ul>
      <p>
        <strong>Technical information.</strong> To protect booking codes from being guessed and to prevent spam, our server briefly counts requests
        from each internet connection. We store only a scrambled (hashed) form of the IP address, not the address itself, and delete these counters
        within a day.
      </p>
      <p>
        <strong>We do not</strong> require an account or password, collect your location, contacts, photos or payment details, use advertising or
        tracking, or sell your information. Payment is made in person at the studio.
      </p>

      <h2>Information stored on your phone</h2>
      <p>
        The app keeps a copy of bookings made or looked up on your phone, your favourite services, and the details you last typed into the booking
        form, so they are ready next time. This stays on your device; you can remove it by clearing the app&apos;s data or uninstalling the app.
      </p>

      <h2>How we use it</h2>
      <ul>
        <li>To create, show, reschedule and cancel your booking, and to prevent double bookings.</li>
        <li>For studio staff to prepare for, check in and complete your appointment, and to contact you about it.</li>
        <li>To email your booking code, if you gave an email address.</li>
        <li>To keep the service secure and working.</li>
      </ul>
      <p>We do not use your information for marketing unless you separately agree to it.</p>

      <h2>Who can see it</h2>
      <ul>
        <li>
          <strong>Studio staff</strong> see full booking details in the password-protected studio dashboard.
        </li>
        <li>
          <strong>Anyone with your booking code</strong> can open that booking in the app. Contact details are partly hidden when a booking is looked
          up by code (for example &ldquo;+••• ••• ••• 4321&rdquo;). Keep your code private, as you would a ticket.
        </li>
        <li>
          <strong>Service providers</strong> that run the system for us, under their own security and privacy terms: Vercel (hosting), our database
          provider (data storage) and Resend (sending booking emails, only if you gave an email address). They process
          information only to provide these services.
        </li>
        <li>Authorities, if the law requires it.</li>
      </ul>

      <h2>How long we keep it</h2>
      <p>
        We keep booking records for as long as the studio needs them to run appointments and keep business records, then delete them. You can ask us
        to delete your bookings sooner (see below).
      </p>

      <h2>Security</h2>
      <p>
        Information is sent over encrypted connections (HTTPS) and stored with our hosting and database providers. The studio dashboard is protected
        by a password. No system is perfectly secure, but we take reasonable steps to protect your information.
      </p>

      <h2>Your choices and rights</h2>
      <p>
        You can cancel a booking at any time in the app with your code. You can also ask us to see, correct or delete the information we hold about
        you, or object to how we use it, by contacting {contact}. Tell us your booking code(s) or the phone number you booked with so we can find
        them. Under the Nigeria Data Protection Act 2023 and other applicable laws you may also complain to the Nigeria Data Protection Commission or
        your local data protection authority.
      </p>

      <h2>Children</h2>
      <p>Beaut is intended for adults. Bookings for children should be made by a parent or guardian.</p>

      <h2>Changes to this policy</h2>
      <p>If we change this policy, we will update the date above and, for significant changes, tell you in the app.</p>

      <h2>Contact</h2>
      <p>
        {business}
        <br />
        {STUDIO.address.split(" · ")[0]}
        <br />
        {email ? contact : "Contact the studio in person or by phone."}
      </p>
    </main>
  );
}
