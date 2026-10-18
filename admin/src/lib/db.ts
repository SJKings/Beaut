import { Prisma, type Booking as BookingRow, type PrismaClient } from "@/generated/prisma/client";
import { SERVICES, type Booking, type Status } from "./catalog";
import { DB_URL, prisma } from "./prisma";

// Bookings live in Postgres through Prisma (schema: prisma/schema.prisma).
// Without a database URL, local development falls back to an in-memory list.

export class DbNotConfigured extends Error {
  constructor() {
    super("No database configured: set POSTGRES_PRISMA_URL (or DATABASE_URL).");
  }
}

export class DuplicateCode extends Error {}

// The database enum uses identifiers (CheckedIn); the API and UI use the labels.
const TO_DB: Record<Status, BookingRow["status"]> = {
  Confirmed: "Confirmed",
  "Checked in": "CheckedIn",
  Completed: "Completed",
  "No-show": "NoShow",
  Cancelled: "Cancelled",
};
const FROM_DB = Object.fromEntries(Object.entries(TO_DB).map(([k, v]) => [v, k])) as Record<BookingRow["status"], Status>;

const fromRow = (r: BookingRow): Booking => ({
  code: r.code,
  serviceId: r.serviceId,
  serviceName: r.serviceName,
  price: r.price,
  durationMin: r.durationMin,
  specialist: r.specialist,
  date: r.date,
  time: r.time,
  name: r.name,
  phone: r.phone,
  email: r.email,
  notes: r.notes,
  status: FROM_DB[r.status],
  createdAt: r.createdAt.getTime(),
  updatedAt: r.updatedAt.getTime(),
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

type Client = PrismaClient | Prisma.TransactionClient;

function prismaOps(db: Client): Ops {
  return {
    async list() {
      return (await db.booking.findMany({ orderBy: [{ date: "asc" }, { time: "asc" }] })).map(fromRow);
    },
    async onDate(date) {
      return (await db.booking.findMany({ where: { date } })).map(fromRow);
    },
    async get(code) {
      const r = await db.booking.findUnique({ where: { code } });
      return r ? fromRow(r) : null;
    },
    async insert(b) {
      try {
        const r = await db.booking.create({
          data: {
            code: b.code, serviceId: b.serviceId, serviceName: b.serviceName, price: b.price, durationMin: b.durationMin,
            specialist: b.specialist, date: b.date, time: b.time, name: b.name, phone: b.phone, email: b.email, notes: b.notes,
            status: TO_DB[b.status],
          },
        });
        return fromRow(r);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") throw new DuplicateCode();
        throw e;
      }
    },
    async update(code, p) {
      try {
        const r = await db.booking.update({
          where: { code },
          data: { date: p.date, time: p.time, specialist: p.specialist, status: p.status && TO_DB[p.status] },
        });
        return fromRow(r);
      } catch (e) {
        if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") return null;
        throw e;
      }
    },
  };
}

function prismaStore(): Store {
  const db = prisma();
  return {
    ...prismaOps(db),
    lockDays(dates, fn) {
      return db.$transaction(async (tx) => {
        for (const d of [...new Set(dates)].sort()) await tx.$executeRaw`select pg_advisory_xact_lock(hashtext(${"beaut:" + d}))`;
        return fn(prismaOps(tx));
      });
    },
    async hit(key, windowSec) {
      // Single atomic upsert: start a new window once the old one has expired.
      const [r] = await db.$queryRaw<{ count: number }[]>`
        insert into rate_limits (key, window_start, count) values (${key}, now(), 1)
        on conflict (key) do update set
          count = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}) then 1 else rate_limits.count + 1 end,
          window_start = case when rate_limits.window_start < now() - make_interval(secs => ${windowSec}) then now() else rate_limits.window_start end
        returning count`;
      return Number(r.count);
    },
    async peek(key, windowSec) {
      const r = await db.rateLimit.findUnique({ where: { key } });
      return r && r.windowStart.getTime() >= Date.now() - windowSec * 1000 ? r.count : 0;
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
  if (DB_URL) return (store = prismaStore());
  if (process.env.NODE_ENV === "production") throw new DbNotConfigured();
  return (store = memoryStore());
}
