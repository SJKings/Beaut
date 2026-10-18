"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent } from "react";
import type { Booking, Status } from "@/lib/catalog";
import { logout } from "./actions";

const POLL_MS = 4000;
const PREFS = "beaut_admin_v1";

const STATUS: Record<Status, [string, string]> = {
  Confirmed: ["#FBE7EF", "#B23763"],
  "Checked in": ["#E6EEFB", "#2F5AA8"],
  Completed: ["#E3F1E9", "#2F7A57"],
  "No-show": ["#FFF1DE", "#9A5B12"],
  Cancelled: ["#F0ECED", "#7A6F72"],
};

const DOW = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const iso = (d: Date) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const off = (n: number) => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + n);
  return iso(d);
};
const parse = (s: string) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d);
};
const fmt = (s: string) => {
  const d = parse(s);
  return DOW[d.getDay()].slice(0, 3) + ", " + d.getDate() + " " + MON[d.getMonth()];
};
const addMin = (t: string, m: number) => {
  const [h, mm] = t.split(":").map(Number);
  const x = h * 60 + mm + m;
  return String(Math.floor(x / 60)).padStart(2, "0") + ":" + String(x % 60).padStart(2, "0");
};

type Filter = "today" | "upcoming" | "past" | "cancelled" | "all";
const FILTERS: [Filter, string][] = [
  ["today", "Today"],
  ["upcoming", "Upcoming"],
  ["past", "Past"],
  ["cancelled", "Cancelled"],
  ["all", "All"],
];

type Prefs = { seen: string[]; filter: Filter };
const loadPrefs = (): Prefs | null => {
  try {
    return JSON.parse(localStorage.getItem(PREFS) || "null");
  } catch {
    return null;
  }
};
const savePrefs = (p: Prefs) => {
  try {
    localStorage.setItem(PREFS, JSON.stringify(p));
  } catch {}
};

type Action = { label: string; status: Status; kind?: "primary" | "danger" };
const ACTIONS: Record<Status, Action[]> = {
  Confirmed: [
    { label: "Check in guest", status: "Checked in", kind: "primary" },
    { label: "Mark no-show", status: "No-show" },
    { label: "Cancel booking", status: "Cancelled", kind: "danger" },
  ],
  "Checked in": [
    { label: "Mark completed", status: "Completed", kind: "primary" },
    { label: "Undo check-in", status: "Confirmed" },
  ],
  Completed: [{ label: "Reopen as checked in", status: "Checked in" }],
  "No-show": [{ label: "Restore booking", status: "Confirmed" }],
  Cancelled: [{ label: "Reinstate booking", status: "Confirmed" }],
};

export function Dashboard() {
  const router = useRouter();
  const [bookings, setBookings] = useState<Record<string, Booking> | null>(null);
  const [online, setOnline] = useState(true);
  // The server's explanation when it answers with an error (e.g. database not set up).
  const [problem, setProblem] = useState<string | null>(null);
  const [filter, setFilterState] = useState<Filter>("today");
  const [seen, setSeen] = useState<string[]>([]);
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [toast, setToast] = useState<{ msg: string; code?: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const known = useRef<Set<string> | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const flash = useCallback((msg: string, code?: string) => {
    setToast({ msg, code });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 5000);
  }, []);

  const fetchAll = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/bookings", { cache: "no-store" });
      if (res.status === 401) {
        router.replace("/login");
        return;
      }
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        setProblem(body?.error ?? `The server answered ${res.status}.`);
        setOnline(false);
        return;
      }
      const list: Booking[] = (await res.json()).bookings;
      const map = Object.fromEntries(list.map((b) => [b.code, b]));
      if (known.current === null) {
        // First load: everything already in the system counts as seen on a fresh browser.
        const prefs = loadPrefs();
        const s = prefs?.seen ?? list.map((b) => b.code);
        setSeen(s);
        setFilterState(prefs?.filter ?? "today");
        savePrefs({ seen: s, filter: prefs?.filter ?? "today" });
      } else {
        const fresh = list.filter((b) => !known.current!.has(b.code));
        if (fresh.length) flash(`New booking ${fresh[0].code} from ${fresh[0].name}`, fresh[0].code);
      }
      known.current = new Set(list.map((b) => b.code));
      setBookings(map);
      setOnline(true);
      setProblem(null);
    } catch {
      setProblem(null);
      setOnline(false);
    }
  }, [flash, router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initial load from the server
    fetchAll();
    const iv = setInterval(fetchAll, POLL_MS);
    const onFocus = () => fetchAll();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(iv);
      window.removeEventListener("focus", onFocus);
      clearTimeout(toastTimer.current);
    };
  }, [fetchAll]);

  const setFilter = (f: Filter) => {
    setFilterState(f);
    savePrefs({ seen, filter: f });
  };

  const select = (code: string) => {
    setSelected(code);
    if (!seen.includes(code)) {
      const s = [...seen, code];
      setSeen(s);
      savePrefs({ seen: s, filter });
    }
  };

  const setStatus = async (code: string, status: Status) => {
    setBusy(true);
    try {
      const res = await fetch(`/api/admin/bookings/${code}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        flash(data.error && res.status === 409 ? data.error : `Couldn't update ${code}. Try again.`);
        return;
      }
      setBookings((m) => ({ ...m, [code]: data.booking }));
      flash(`${code} marked ${status.toLowerCase()}`);
    } catch {
      flash(`Couldn't update ${code}. Try again.`);
    } finally {
      setBusy(false);
    }
  };

  const today = off(0);
  const all = useMemo(() => Object.values(bookings ?? {}).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)), [bookings]);
  const query = q.trim().toLowerCase();
  const qd = query.replace(/\D/g, "");
  const match = (b: Booking) =>
    !query || b.code.toLowerCase().includes(query) || b.name.toLowerCase().includes(query) || (qd.length > 2 && b.phone.replace(/\D/g, "").includes(qd));
  const F: Record<Filter, (b: Booking) => boolean> = {
    today: (b) => b.date === today,
    upcoming: (b) => b.date >= today && b.status === "Confirmed",
    past: (b) => b.date < today && b.status !== "Cancelled",
    cancelled: (b) => b.status === "Cancelled",
    all: () => true,
  };

  let list = all.filter(F[filter]).filter(match);
  if (filter === "past") list = list.reverse();
  const byDate = new Map<string, Booking[]>();
  list.forEach((b) => byDate.set(b.date, [...(byDate.get(b.date) ?? []), b]));
  const rel = (d: string) => (d === today ? "Today" : d === off(1) ? "Tomorrow" : d === off(-1) ? "Yesterday" : DOW[parse(d).getDay()]);

  const onQKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter") return;
    let raw = q.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (raw.startsWith("BT")) raw = raw.slice(2);
    const code = "BT-" + raw;
    if (bookings?.[code]) {
      setQ("");
      setFilter("all");
      select(code);
    } else if (list.length === 1) select(list[0].code);
  };

  const sel = selected ? bookings?.[selected] : undefined;
  const d = new Date();
  const todayLabel = `${DOW[d.getDay()]}, ${d.getDate()} ${MON[d.getMonth()]} ${d.getFullYear()}`;

  return (
    <div className="shell">
      <header className="topbar">
        <div className="brand">
          Beaut<span className="dot">.</span> <span className="brand-sub">Studio</span>
        </div>
        <span className="topbar-muted">Beaut Studio, Lekki</span>
        <div className="topbar-right">
          <div className="live">
            <span className={online ? "live-dot on" : "live-dot off"} />
            {online ? "Receiving bookings" : problem ? "Not receiving bookings" : "Can't reach server"}
          </div>
          <span className="today">{todayLabel}</span>
          <form action={logout}>
            <button className="signout" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="layout">
        <main className="main">
          <div className="titlebar">
            <div className="title">
              <h1>Bookings</h1>
              <span className="muted">Guest bookings from the Beaut app, matched by booking code.</span>
            </div>
            <div className="search">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#1E1A1B" strokeWidth="2" strokeLinecap="round">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-4-4" />
              </svg>
              <input value={q} onChange={(e) => setQ(e.target.value)} onKeyDown={onQKey} placeholder="Code, name or phone" aria-label="Search bookings" />
              {q && (
                <button className="clear" onClick={() => setQ("")} aria-label="Clear search">
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="tabs">
            {FILTERS.map(([k, label]) => {
              const a = filter === k;
              return (
                <button key={k} className={a ? "tab active" : "tab"} onClick={() => setFilter(k)}>
                  {label}
                  <span className="count">{all.filter(F[k]).filter(match).length}</span>
                </button>
              );
            })}
          </div>

          {problem ? (
            <div className="empty problem">
              <div className="empty-title">The dashboard can&apos;t load bookings</div>
              <div className="muted">{problem}</div>
              <a className="muted small" href="/api/health" target="_blank" rel="noreferrer">
                Open the health check
              </a>
            </div>
          ) : bookings === null ? (
            <div className="empty">
              <div className="empty-title">{online ? "Loading bookings…" : "Can't reach the server"}</div>
            </div>
          ) : byDate.size === 0 ? (
            <div className="empty">
              <div className="empty-title">{query ? `No bookings match "${q}"` : "No bookings here"}</div>
              <div className="muted">New bookings from the app appear here automatically.</div>
            </div>
          ) : (
            [...byDate].map(([date, rows]) => (
              <section key={date} className="group">
                <div className="group-head">
                  <span className="group-title">{rel(date)}</span>
                  <span className="muted small">
                    {fmt(date)} · {rows.length} {rows.length === 1 ? "booking" : "bookings"}
                  </span>
                </div>
                {rows.map((b) => {
                  const [sBg, sFg] = STATUS[b.status] ?? STATUS.Confirmed;
                  return (
                    <div
                      key={b.code}
                      role="button"
                      tabIndex={0}
                      onClick={() => select(b.code)}
                      onKeyDown={(e) => e.key === "Enter" && select(b.code)}
                      className={selected === b.code ? "row on" : "row"}
                    >
                      <div className="row-time mono">{b.time}</div>
                      <div className="row-col">
                        <div className="row-name">
                          <span>{b.name}</span>
                          {!seen.includes(b.code) && <span className="new">NEW</span>}
                        </div>
                        <span className="muted small">{b.phone}</span>
                      </div>
                      <div className="row-col">
                        <span className="row-svc">{b.serviceName}</span>
                        <span className="muted small">
                          {b.durationMin} min · {b.specialist}
                        </span>
                      </div>
                      <span className="row-code mono">{b.code}</span>
                      <span className="badge row-status" style={{ background: sBg, color: sFg }}>
                        {b.status}
                      </span>
                    </div>
                  );
                })}
              </section>
            ))
          )}
        </main>

        <aside className="aside">
          {!sel ? (
            <div className="nosel">
              <div className="empty-title">No booking selected</div>
              <div className="muted">Pick a booking from the list, or type a guest&apos;s code in search and press Enter.</div>
            </div>
          ) : (
            <Detail b={sel} busy={busy} onClose={() => setSelected(null)} onStatus={(s) => setStatus(sel.code, s)} />
          )}
        </aside>
      </div>

      {toast && (
        <div
          className="toast"
          onClick={() => {
            if (toast.code) {
              setFilter("all");
              select(toast.code);
            }
            setToast(null);
          }}
        >
          <span className="toast-dot" />
          <span>{toast.msg}</span>
        </div>
      )}
    </div>
  );
}

function Detail({ b, busy, onClose, onStatus }: { b: Booking; busy: boolean; onClose: () => void; onStatus: (s: Status) => void }) {
  const [sBg, sFg] = STATUS[b.status] ?? STATUS.Confirmed;
  const tel = "tel:" + b.phone.replace(/[^\d+]/g, "");
  const rows = [
    { k: "Service", v: b.serviceName },
    { k: "Date", v: fmt(b.date) },
    { k: "Time", v: b.time + " – " + addMin(b.time, b.durationMin) },
    { k: "Duration", v: b.durationMin + " min" },
    { k: "Specialist", v: b.specialist },
    { k: "Price", v: "$" + b.price + " · pay at studio" },
  ];
  return (
    <div className="detail">
      <div className="detail-head">
        <div className="detail-top">
          <span className="eyebrow">Booking code</span>
          <button className="close" onClick={onClose} aria-label="Close">
            ✕
          </button>
        </div>
        <div className="detail-code">
          <span className="mono code-lg">{b.code}</span>
          <span className="badge" style={{ background: sBg, color: sFg, padding: "6px 12px" }}>
            {b.status}
          </span>
        </div>
        <div className="detail-guest">
          <span className="guest-name">{b.name}</span>
          <a href={tel} className="guest-phone">
            {b.phone}
          </a>
          {b.email && <span className="guest-email">{b.email}</span>}
        </div>
      </div>
      <div className="detail-rows">
        {rows.map((r) => (
          <div key={r.k} className="kv">
            <span className="muted">{r.k}</span>
            <span className="kv-v">{r.v}</span>
          </div>
        ))}
      </div>
      <div className="notes">
        <span className="notes-label">Guest notes</span>
        <span className={b.notes ? "notes-text" : "notes-text none"}>{b.notes || "No notes"}</span>
      </div>
      <div className="actions">
        {ACTIONS[b.status].map((a) => (
          <button key={a.label} disabled={busy} className={`btn ${a.kind ?? ""}`} onClick={() => onStatus(a.status)}>
            {a.label}
          </button>
        ))}
        <a href={tel} className="btn call">
          Call guest
        </a>
      </div>
    </div>
  );
}
