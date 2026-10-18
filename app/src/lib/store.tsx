import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { changeBooking, DuplicateCodeError, fetchBooking, fetchCatalog, hasBackend, submitBooking, type Fetched } from './api';
import { categories, DEFAULT_CATALOG, DEMO_CODE, findService, genCode, seedBookings, type Booking, type Catalog } from './data';

// The studio backend (admin/) is the source of truth when EXPO_PUBLIC_API_URL is
// set: bookings, statuses and the catalogue all come from it. AsyncStorage keeps a
// copy so the app still shows things offline. Without a backend everything stays
// on the device (and the demo booking is seeded).
const KEY = 'beaut_v1';

export type GuestForm = { name: string; phone: string; email: string; notes: string };
export type Draft = { serviceId: string; spec: string; date: string; time: string };

type Persisted = {
  bookings: Record<string, Booking>;
  seen: string[]; // codes made or looked up on this device, newest first
  fav: Record<string, boolean>;
  onboarded: boolean;
  form: GuestForm;
  catalog: Catalog;
};

const initial = (): Persisted => ({
  bookings: hasBackend ? {} : seedBookings(),
  seen: hasBackend ? [] : [DEMO_CODE],
  fav: {},
  onboarded: false,
  form: { name: '', phone: '', email: '', notes: '' },
  catalog: DEFAULT_CATALOG,
});

type Store = Persisted & {
  ready: boolean;
  draft: Draft | null;
  explore: { cat: string; q: string };
  setExplore: (e: Partial<{ cat: string; q: string }>) => void;
  setDraft: (d: Draft) => void;
  setForm: (f: Partial<GuestForm>) => void;
  setOnboarded: () => void;
  toggleFav: (serviceId: string) => void;
  createBooking: () => Promise<Booking>;
  /** Looks up a code (server first) and remembers it on this device. */
  findBooking: (code: string) => Promise<Booking | null>;
  /** Pulls the latest status from the server; keeps the local copy if offline. */
  refreshBookings: (codes: string[]) => Promise<void>;
  cancelBooking: (code: string) => Promise<void>;
  rescheduleBooking: (code: string, to: { date: string; time: string; spec: string }) => Promise<void>;
  remember: (code: string) => void;
};

const Ctx = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Persisted>(initial);
  const [ready, setReady] = useState(false);
  const [draft, setDraft] = useState<Draft | null>(null);
  const [explore, setExploreState] = useState({ cat: 'All', q: '' });
  const dataRef = useRef(data);
  dataRef.current = data;

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        const saved = raw ? (JSON.parse(raw) as Partial<Persisted>) : null;
        if (saved) setData((d) => ({ ...d, ...saved }));
      })
      .catch(() => {})
      .finally(() => setReady(true));
    // Refresh the catalogue on every launch; the saved copy covers offline starts.
    if (hasBackend)
      fetchCatalog()
        .then((catalog) => setData((d) => ({ ...d, catalog })))
        .catch(() => {});
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  const remember = useCallback((code: string) => {
    setData((d) => (d.seen.includes(code) ? d : { ...d, seen: [code, ...d.seen] }));
  }, []);

  // Lookups by code come back with the guest's contact details partly hidden;
  // keep the full ones this device already has (it made the booking).
  const save = useCallback(({ booking, masked }: Fetched) => {
    setData((d) => {
      const prev = d.bookings[booking.code];
      const b = masked && prev ? { ...booking, name: prev.name, phone: prev.phone, email: prev.email, notes: prev.notes, emailSent: prev.emailSent } : booking;
      return { ...d, bookings: { ...d.bookings, [b.code]: b } };
    });
  }, []);

  // Sends the booking to the backend first and only keeps it on the device once
  // the server has accepted it, so a guest never holds a code the studio lacks.
  const createBooking = useCallback(async () => {
    const d = dataRef.current;
    if (!draft) throw new Error('No booking in progress');
    for (let attempt = 0; ; attempt++) {
      const code = genCode(d.bookings);
      try {
        const b = await submitBooking({ code, ...draft, ...d.form, status: 'Confirmed', createdAt: Date.now() });
        setData((cur) => ({ ...cur, bookings: { ...cur.bookings, [code]: b }, seen: [code, ...cur.seen] }));
        return b;
      } catch (e) {
        if (!(e instanceof DuplicateCodeError) || attempt >= 4) throw e;
      }
    }
  }, [draft]);

  const findBooking = useCallback(
    async (code: string) => {
      let found: Fetched | null = null;
      if (hasBackend) {
        try {
          found = await fetchBooking(code);
        } catch (e) {
          const local = dataRef.current.bookings[code];
          if (!local) throw e; // offline or blocked, and nothing on this device
          found = { booking: local, masked: false };
        }
      } else if (dataRef.current.bookings[code]) found = { booking: dataRef.current.bookings[code], masked: false };
      if (!found) return null;
      save(found);
      remember(code);
      return found.booking;
    },
    [remember, save],
  );

  const refreshBookings = useCallback(
    async (codes: string[]) => {
      if (!hasBackend) return;
      await Promise.all(
        codes.map((c) =>
          fetchBooking(c)
            .then((f) => f && save(f))
            .catch(() => {}),
        ),
      );
    },
    [save],
  );

  const cancelBooking = useCallback(
    async (code: string) => {
      const cur = dataRef.current.bookings[code];
      save(hasBackend ? await changeBooking(code, { action: 'cancel' }) : { booking: { ...cur, status: 'Cancelled' }, masked: false });
    },
    [save],
  );

  const rescheduleBooking = useCallback(
    async (code: string, to: { date: string; time: string; spec: string }) => {
      const cur = dataRef.current.bookings[code];
      save(
        hasBackend
          ? await changeBooking(code, { action: 'reschedule', date: to.date, time: to.time, specialist: to.spec })
          : { booking: { ...cur, ...to }, masked: false },
      );
    },
    [save],
  );

  const store = useMemo<Store>(
    () => ({
      ...data,
      ready,
      draft,
      explore,
      setExplore: (e) => setExploreState((x) => ({ ...x, ...e })),
      setDraft,
      setForm: (f) => setData((d) => ({ ...d, form: { ...d.form, ...f } })),
      setOnboarded: () => setData((d) => ({ ...d, onboarded: true })),
      toggleFav: (id) => setData((d) => ({ ...d, fav: { ...d.fav, [id]: !d.fav[id] } })),
      createBooking,
      findBooking,
      refreshBookings,
      cancelBooking,
      rescheduleBooking,
      remember,
    }),
    [data, ready, draft, explore, createBooking, findBooking, refreshBookings, cancelBooking, rescheduleBooking, remember],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
}

/** The live studio catalogue (or the bundled copy until it has loaded). */
export function useCatalog() {
  const { catalog } = useStore();
  return useMemo(
    () => ({ ...catalog, cats: categories(catalog), svcOf: (id: string) => findService(catalog, id) }),
    [catalog],
  );
}

/** Bookings remembered on this device, soonest first. */
export function useSavedBookings() {
  const { bookings, seen } = useStore();
  return useMemo(
    () =>
      Object.values(bookings)
        .filter((b) => seen.includes(b.code))
        .sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time)),
    [bookings, seen],
  );
}
