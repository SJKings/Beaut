import { Footer, Header, PlayButton } from "@/components/chrome";
import { SITE } from "@/lib/site";

const STEPS = [
  { n: "01", t: "Pick a service", d: "Hair, nails, makeup and facials, with prices and durations up front." },
  { n: "02", t: "Choose a time", d: "See open slots by day and pick a specialist, or take whoever is available." },
  { n: "03", t: "Keep your code", d: "Add your name and phone once. You get a booking code that brings it all back." },
];

const DASHBOARD_ROWS = [
  { code: "BT-7K4QN", name: "Zainab Bello", what: "Hydrating Facial · 11:00", badge: "New" },
  { code: "BT-3MW8R", name: "Bisi Adeyemi", what: "Gel Manicure · 12:30", badge: "Confirmed" },
  { code: "BT-9QD2H", name: "Ifeoma Nwosu", what: "Signature Cut & Style · 14:30", badge: "Confirmed" },
];

export default function Home() {
  return (
    <div className="shell">
      <Header home />

      <section id="top" className="wrap hero">
        <div className="hero-copy">
          <div className="eyebrow">No sign-up. No passwords.</div>
          <h1>Beauty care, booked in a minute.</h1>
          <p className="lead">Pick a service, choose a time and keep your booking code. That code is all you need to find, change or cancel your appointment.</p>
          <div className="actions">
            <PlayButton />
            <a href="#code" className="btn btn-outline">
              I have a booking code
            </a>
          </div>
        </div>
        <div className="phone-wrap" aria-hidden>
          <div className="phone">
            <div className="phone-screen">
              <div className="phone-check">
                <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
              </div>
              <div className="phone-title">You&apos;re booked</div>
              <div className="phone-note">Keep this code. It&apos;s how you&apos;ll find, change or cancel your booking.</div>
              <div className="phone-code">
                <span className="label">Booking code</span>
                <span className="code mono">BT-7K4QN</span>
              </div>
              <div className="phone-card">
                <div className="t">Hydrating Facial</div>
                <div className="s">Wed, 21 Oct · 11:00 · Lena K.</div>
              </div>
              <div className="phone-btn">View booking</div>
            </div>
          </div>
        </div>
      </section>

      <section id="how" className="band-white">
        <div className="wrap section">
          <h2 className="h2 steps-head">Three steps from browsing to booked.</h2>
          <div className="steps">
            {STEPS.map((s) => (
              <div key={s.n} className="step">
                <span className="n mono">{s.n}</span>
                <div className="t">{s.t}</div>
                <p>{s.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="code" className="wrap section split">
        <div className="find" aria-hidden>
          <div className="label">Find your booking</div>
          <div className="code mono">BT-7K4QN</div>
          <div className="rows">
            <div className="row">
              <span className="k">Name</span>
              <span className="v">Zainab Bello</span>
            </div>
            <div className="row">
              <span className="k">Phone</span>
              <span className="v">+234 809 882 3310</span>
            </div>
            <div className="row">
              <span className="k">Appointment</span>
              <span className="v">Wed 21 Oct, 11:00</span>
            </div>
          </div>
        </div>
        <div className="stack">
          <h2 className="h2">One code instead of an account.</h2>
          <p className="body-lg">
            Every booking gets its own code, tied to the name and phone number you entered. Type it in the app to see your appointment, reschedule or
            cancel. Nothing to remember beyond one short code.
          </p>
        </div>
      </section>

      <section id="studios" className="band-pink">
        <div className="wrap section split">
          <div className="stack">
            <div className="kicker">For studios</div>
            <h2 className="h2">Every booking lands on your dashboard.</h2>
            <p className="body-lg">
              Beaut Studio shows new appointments as they come in, with the client&apos;s name, phone, service and status, so the front desk always
              knows who&apos;s next.
            </p>
            <a href={`mailto:${SITE.email}?subject=Beaut%20for%20my%20studio`} className="btn btn-dark" style={{ alignSelf: "flex-start" }}>
              Talk to us
            </a>
          </div>
          <div className="list-card" aria-hidden>
            {DASHBOARD_ROWS.map((r) => (
              <div key={r.code} className="list-row">
                <span className="code mono">{r.code}</span>
                <div className="who">
                  <div className="t">{r.name}</div>
                  <div className="s">{r.what}</div>
                </div>
                <span className={r.badge === "New" ? "badge badge-new" : "badge badge-ok"}>{r.badge}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="get" className="band-dark">
        <div className="wrap cta">
          <h2>Your next appointment is a minute away.</h2>
          <PlayButton />
        </div>
      </section>

      <Footer />
    </div>
  );
}
