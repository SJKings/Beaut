import postgres from "postgres";
import { SERVICES, type Booking, type Status } from "./catalog";

// Bookings live in Postgres (Neon or Supabase via the Vercel Marketplace both set
// one of these). Without one, local development falls back to an in-memory list.
const DB_URL = process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

export class DbNotConfigured extends Error {
  constructor() {
    super("No database configured: set DATABASE_URL (or POSTGRES_URL).");
  }
}

export class DuplicateCode extends Error {}

type Row = {
  code: string;
  service_id: string;
  service_name: string;
  price: number;
  duration_min: number;
  specialist: string;
  date: string;
  time: string;
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: Status;
  created_at: Date;
  updated_at: Date;
};

const fromRow = (r: Row): Booking => ({
  code: r.code,
  serviceId: r.service_id,
  serviceName: r.service_name,
  price: r.price,
  durationMin: r.duration_min,
  specialist: r.specialist,
  date: r.date,
  time: r.time,
  name: r.name,
  phone: r.phone,
  email: r.email,
  notes: r.notes,
  status: r.status,
  createdAt: r.created_at.getTime(),
  updatedAt: r.updated_at.getTime(),
});

export type BookingPatch = Partial<Pick<Booking, "date" | "time" | "specialist" | "status">>;

export interface Ops {
  list(): Promise<Booking[]>;
  onDate(date: string): Promise<Booking[]>;
  get(code: string): Promise<Booking | null>;
  insert(b: Booking): Promise<Booking>;
  update(code: string, patch: BookingPatch): Promise<Booking | null>;
}

interface Store extends Ops {
  /**
   * Runs fn with every write serialised per day (Postgres advisory lock), so two
   * guests can't both pass the "is this slot free?" check for the same time.
   */
  lockDays<T>(dates: string[], fn: (ops: Ops) => Promise<T>): Promise<T>;
  /** Fixed-window counter for rate limiting. Returns the count including this hit. */
  hit(key: string, windowSec: number): Promise<number>;
  /** Current count without adding to it. */
  peek(key: string, windowSec: number): Promise<number>;
}

type Sql = postgres.Sql | postgres.TransactionSql;

function pgOps(sql: Sql, init: () => Promise<unknown>): Ops {
  const q = sql as postgres.Sql;
  return {
    async list() {
      await init();
      return (await q<Row[]>`select * from bookings order by date, time`).map(fromRow);
    },
    async onDate(date) {
      await init();
      return (await q<Row[]>`select * from bookings where date = ${date}`).map(fromRow);
    },
    async get(code) {
      await init();
      const [r] = await q<Row[]>`select * from bookings where code = ${code}`;
      return r ? fromRow(r) : null;
    },
    async insert(b) {
      await init();
      try {
        const [r] = await q<Row[]>`
          insert into bookings (code, service_id, service_name, price, duration_min, specialist, date, time, name, phone, email, notes, status)
          values (${b.code}, ${b.serviceId}, ${b.serviceName}, ${b.price}, ${b.durationMin}, ${b.specialist}, ${b.date}, ${b.time}, ${b.name}, ${b.phone}, ${b.email}, ${b.notes}, ${b.status})
          returning *`;
        return fromRow(r);
      } catch (e) {
        if ((e as { code?: string }).code === "23505") throw new DuplicateCode();
        throw e;
      }
    },
    async update(code, p) {
      await init();
      const [r] = await q<Row[]>`
        update bookings set
          date = coalesce(${p.date ?? null}, date),
          time = coalesce(${p.time ?? null}, time),
          specialist = coalesce(${p.specialist ?? null}, specialist),
          status = coalesce(${p.status ?? null}, status),
          updated_at = now()
        where code = ${code}
        returning *`;
      return r ? fromRow(r) : null;
    },
  };
}

function pgStore(url: string): Store {
  const local = /localhost|127\.0\.0\.1/.test(url);
  // prepare:false keeps it compatible with the transaction poolers Neon/Supabase hand out.
  const sql = postgres(url, { ssl: local ? false : "require", max: 1, prepare: false, idle_timeout: 20 });
  let ready: Promise<unknown> | null = null;
  const init = () =>
    (ready ??= sql
      .unsafe(
        `create table if not exists bookings (
          code text primary key,
          service_id text not null,
          service_name text not null,
          price integer not null,
          duration_min integer not null,
          specialist text not null,
          date text not null,
          time text not null,
          name text not null,
          phone text not null,
          email text not null default '',
          notes text not null default '',
          status text not null,
          created_at timestamptz not null default now(),
          updated_at timestamptz not null default now()
        );
        create index if not exists bookings_date on bookings (date);
        create table if not exists rate_limits (
          key text primary key,
          window_start timestamptz not null,
          count integer not null
        );`,
      )
      .catch((e) => {
        ready = null;
        throw e;
      }));

  return {
    ...pgOps(sql, init),
    async lockDays(dates, fn) {
      await init();
      return (await sql.begin(async (tx) => {
        for (const d of [...new Set(dates)].sort()) await tx`select pg_advisory_xact_lock(hashtext(${"beaut:" + d}))`;
        return fn(pgOps(tx, init));
      })) as Awaited<ReturnType<typeof fn>>;
    },
    async hit(key, windowSec) {
      await init();
      const [r] = await sql<{ count: number }[]>`
        insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
        on conflict (key) do update set
          count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}) then 1 else rate_limits.count + 1 end,
          window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}) then now() else rate_limits.window_start end
        returning count`;
      return r.count;
    },
    async peek(key, windowSec) {
      await init();
      const [r] = await sql<{ count: number }[]>`
        select count from rate_limits where key = ${key} and window_start >= now() - make_interval(secs => ${windowSec})`;
      return r?.count ?? 0;
    },
  };
}

// Local development only: the dashboard prototype's sample day.
function sampleBookings(): Booking[] {
  const off = (n: number) => {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
  };
  const mk = (code: string, serviceId: string, specialist: string, date: string, time: string, name: string, phone: string, status: Status, notes = "", email = ""): Booking => {
    const s = SERVICES.find((x) => x.id === serviceId)!;
    return { code, serviceId, serviceName: s.name, price: s.price, durationMin: s.dur, specialist, date, time, name, phone, email, notes, status, createdAt: 0, updatedAt: 0 };
  };
  return [
    mk("BT-4F7Q2", "s6", "Lena K.", off(3), "11:00", "Demo Guest", "+234 801 234 5678", "Confirmed"),
    mk("BT-K82NV", "s1", "Amara O.", off(0), "09:00", "Ifeoma Nwosu", "+234 803 555 1290", "Completed"),
    mk("BT-7RWD3", "s3", "Tolu A.", off(0), "11:00", "Bisi Adeyemi", "+234 806 120 4471", "Checked in", "Prefers nude shades"),
    mk("BT-Q9HZ5", "s7", "Lena K.", off(0), "14:30", "Zainab Bello", "+234 809 882 3310", "Confirmed", "First lash set, sensitive eyes", "zainab.b@mail.com"),
    mk("BT-M3TXA", "s2", "Sofia R.", off(0), "16:30", "Grace Eze", "+234 812 004 7765", "Confirmed"),
    mk("BT-P6GJ8", "s5", "Sofia R.", off(1), "10:00", "Kemi Lawal", "+234 805 431 9002", "Confirmed", "Wedding guest look"),
    mk("BT-2CEY9", "s4", "Tolu A.", off(1), "13:30", "Ngozi Obi", "+234 802 776 1184", "Cancelled"),
    mk("BT-V5LUB", "s9", "Amara O.", off(2), "12:00", "Halima Musa", "+234 807 663 2051", "Confirmed"),
    mk("BT-H4DSN", "s8", "Sofia R.", off(-1), "15:30", "Tara Johnson", "+234 810 229 8843", "No-show"),
  ];
}

function memoryStore(): Store {
  const g = globalThis as unknown as { __beautBookings?: Map<string, Booking>; __beautHits?: Map<string, { start: number; count: number }> };
  const m = (g.__beautBookings ??= new Map(sampleBookings().map((b) => [b.code, b])));
  const hits = (g.__beautHits ??= new Map());
  let queue: Promise<unknown> = Promise.resolve();
  const ops: Ops = {
    async list() {
      return [...m.values()].sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
    },
    async onDate(date) {
      return [...m.values()].filter((b) => b.date === date);
    },
    async get(code) {
      return m.get(code) ?? null;
    },
    async insert(b) {
      if (m.has(b.code)) throw new DuplicateCode();
      m.set(b.code, b);
      return b;
    },
    async update(code, p) {
      const cur = m.get(code);
      if (!cur) return null;
      const next = { ...cur, ...Object.fromEntries(Object.entries(p).filter(([, v]) => v != null)), updatedAt: Date.now() };
      m.set(code, next);
      return next;
    },
  };
  const live = (key: string, windowSec: number) => {
    const h = hits.get(key);
    return h && Date.now() - h.start < windowSec * 1000 ? h : null;
  };
  return {
    ...ops,
    lockDays(_dates, fn) {
      const run = queue.then(() => fn(ops));
      queue = run.catch(() => {});
      return run;
    },
    async hit(key, windowSec) {
      const h = live(key, windowSec) ?? { start: Date.now(), count: 0 };
      h.count++;
      hits.set(key, h);
      return h.count;
    },
    async peek(key, windowSec) {
      return live(key, windowSec)?.count ?? 0;
    },
  };
}

let store: Store | null = null;
export function db(): Store {
  if (store) return store;
  if (DB_URL) return (store = pgStore(DB_URL));
  if (process.env.NODE_ENV === "production") throw new DbNotConfigured();
  return (store = memoryStore());
}
