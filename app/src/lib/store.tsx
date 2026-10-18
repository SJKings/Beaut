import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { submitBooking } from './api';
import { DEMO_CODE, genCode, seedBookings, type Booking } from './data';

// Bookings live on the device for now. Everything goes through this store so a
// backend (shared with the studio dashboard) can replace AsyncStorage later
// without touching the screens.
const KEY = 'beaut_v1';

export type GuestForm = { name: string; phone: string; email: string; notes: string };
export type Draft = { serviceId: string; spec: string; date: string; time: string };

type Persisted = {
  bookings: Record<string, Booking>;
  seen: string[]; // codes made or looked up on this device, newest first
  fav: Record<string, boolean>;
  onboarded: boolean;
  form: GuestForm;
};

const initial = (): Persisted => ({
  bookings: seedBookings(),
  seen: [DEMO_CODE],
  fav: {},
  onboarded: false,
  form: { name: '', phone: '', email: '', notes: '' },
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
  updateBooking: (code: string, patch: Partial<Booking>) => void;
  /** Looks up a code and remembers it on this device. */
  findBooking: (code: string) => Booking | null;
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
  }, []);

  useEffect(() => {
    if (ready) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, ready]);

  const remember = useCallback((code: string) => {
    setData((d) => (d.seen.includes(code) ? d : { ...d, seen: [code, ...d.seen] }));
  }, []);

  // Sends the booking to the backend first and only keeps it on the device once
  // the server has accepted it, so a guest never holds a code the studio lacks.
  const createBooking = useCallback(async () => {
    const d = dataRef.current;
    if (!draft) throw new Error('No booking in progress');
    const code = genCode(d.bookings);
    const b: Booking = { code, ...draft, ...d.form, status: 'Confirmed', createdAt: Date.now() };
    await submitBooking(b);
    setData((cur) => ({ ...cur, bookings: { ...cur.bookings, [code]: b }, seen: [code, ...cur.seen] }));
    return b;
  }, [draft]);

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
      updateBooking: (code, patch) =>
        setData((d) => ({ ...d, bookings: { ...d.bookings, [code]: { ...d.bookings[code], ...patch } } })),
      findBooking: (code) => {
        const b = dataRef.current.bookings[code] ?? null;
        if (b) remember(code);
        return b;
      },
      remember,
    }),
    [data, ready, draft, explore, createBooking, remember],
  );

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useStore() {
  const s = useContext(Ctx);
  if (!s) throw new Error('useStore must be used inside StoreProvider');
  return s;
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
