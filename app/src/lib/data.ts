export type Service = {
  id: string;
  name: string;
  cat: string;
  price: number;
  dur: number;
  rating: number;
  reviews: number;
  img: string;
  about: string;
};

export type BookingStatus = 'Confirmed' | 'Checked in' | 'Completed' | 'No-show' | 'Cancelled';

export type Booking = {
  code: string;
  serviceId: string;
  spec: string;
  date: string; // YYYY-MM-DD, local
  time: string; // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: BookingStatus;
  createdAt?: number;
  /** The confirmation email was accepted for delivery. */
  emailSent?: boolean;
};

export type Catalog = {
  services: Service[];
  specialists: string[]; // first entry is "Any available"
  slots: string[];
  studio: { name: string; address: string };
  emailEnabled: boolean;
};

// Bundled copy of the studio catalogue, used until the app has downloaded the
// live one from the admin's GET /api/catalog (the source of truth).
const SERVICES: Service[] = [
  { id: 's1', name: 'Signature Cut & Style', cat: 'Hair', price: 45, dur: 60, rating: 4.8, reviews: 212, img: 'haircut & blow-dry', about: 'Consultation, wash, precision cut and a blow-dry finish tailored to your hair type.' },
  { id: 's6', name: 'Hydrating Facial', cat: 'Facial', price: 50, dur: 60, rating: 4.9, reviews: 168, img: 'facial treatment', about: 'Deep cleanse, gentle exfoliation, hydrating mask and a face and neck massage.' },
  { id: 's3', name: 'Gel Manicure', cat: 'Nails', price: 30, dur: 45, rating: 4.7, reviews: 301, img: 'manicure close-up', about: 'Shape, cuticle care and long-wear gel colour in your choice of shade.' },
  { id: 's5', name: 'Soft Glam Makeup', cat: 'Makeup', price: 55, dur: 60, rating: 4.8, reviews: 97, img: 'makeup application', about: 'Skin prep and a soft, camera-ready look for events, shoots or a night out.' },
  { id: 's2', name: 'Silk Press', cat: 'Hair', price: 60, dur: 90, rating: 4.6, reviews: 140, img: 'silk press result', about: 'Wash, deep condition and a heat-protected press for smooth, glossy movement.' },
  { id: 's9', name: 'Root Colour Touch-up', cat: 'Hair', price: 70, dur: 100, rating: 4.7, reviews: 88, img: 'hair colouring', about: 'Colour matched to your existing shade, applied to regrowth, finished with gloss.' },
  { id: 's4', name: 'Pedicure Spa', cat: 'Nails', price: 38, dur: 50, rating: 4.8, reviews: 190, img: 'pedicure', about: 'Soak, scrub, nail and cuticle care, massage and polish.' },
  { id: 's7', name: 'Classic Lash Set', cat: 'Lashes', price: 65, dur: 90, rating: 4.9, reviews: 76, img: 'lash extensions', about: 'One extension per natural lash for a full, natural-looking set.' },
  { id: 's8', name: 'Brow Lamination', cat: 'Lashes', price: 35, dur: 40, rating: 4.7, reviews: 121, img: 'brow lamination', about: 'Lift and set brows into shape, with tint and tidy included.' },
];
export const DEFAULT_CATALOG: Catalog = {
  services: SERVICES,
  specialists: ['Any available', 'Amara O.', 'Lena K.', 'Tolu A.', 'Sofia R.'],
  slots: ['09:00', '10:00', '11:00', '12:00', '13:30', '14:30', '15:30', '16:30', '17:30'],
  studio: { name: 'Beaut Studio, Lekki', address: '14 Admiralty Way · Open 9:00–19:00' },
  emailEnabled: false,
};

/** Category chips: "All" plus each category in catalogue order. */
export const categories = (c: Catalog) => ['All', ...new Set(c.services.map((s) => s.cat))];

const UNKNOWN_SERVICE: Service = { id: '', name: 'Service', cat: '', price: 0, dur: 60, rating: 0, reviews: 0, img: 'service', about: '' };
export const findService = (c: Catalog, id: string) => c.services.find((s) => s.id === id) ?? UNKNOWN_SERVICE;
export const DEMO_CODE = 'BT-4F7Q2';

export const REVIEWS = [
  { name: 'Chioma', stars: '★★★★★', text: 'Booked in two minutes on the bus and walked in on time. Loved not having to make an account.' },
  { name: 'Funke', stars: '★★★★★', text: 'Lena was so gentle and the result lasted.' },
  { name: 'Adaeze', stars: '★★★★☆', text: 'Rescheduled with my code the night before, no stress.' },
];

export const money = (n: number) => '$' + n;

const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export const iso = (d: Date) =>
  d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
const parse = (s: string) => {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
};
export const fmtDate = (s: string) => {
  const d = parse(s);
  return DOW[d.getDay()] + ', ' + d.getDate() + ' ' + MON[d.getMonth()].slice(0, 3);
};
export const addMin = (t: string, m: number) => {
  const [h, mm] = t.split(':').map(Number);
  const x = h * 60 + mm + m;
  return String(Math.floor(x / 60)).padStart(2, '0') + ':' + String(x % 60).padStart(2, '0');
};

export type Day = { iso: string; dow: string; day: number; month: string };
// The bookable window: today plus the next 13 days.
export const days = (): Day[] => {
  const out: Day[] = [];
  const b = new Date();
  b.setHours(0, 0, 0, 0);
  for (let i = 0; i < 14; i++) {
    const d = new Date(b);
    d.setDate(b.getDate() + i);
    out.push({ iso: iso(d), dow: DOW[d.getDay()], day: d.getDate(), month: MON[d.getMonth()] + ' ' + d.getFullYear() });
  }
  return out;
};

// Mock availability for running without a backend (the prototype's pattern).
export const mockSlotTaken = (dayIndex: number, slotIndex: number) => (dayIndex + slotIndex) % 4 === 1;

export const whenLabel = (b: Pick<Booking, 'date' | 'time'>) => fmtDate(b.date) + ' · ' + b.time;

const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
export const genCode = (taken: Record<string, unknown>) => {
  let c: string;
  do {
    c = 'BT-';
    for (let i = 0; i < 5; i++) c += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  } while (taken[c]);
  return c;
};

// Accepts "bt4f7q2", "BT-4F7Q2", "4F7Q2" etc. Returns null for empty input.
export const normalizeCode = (input: string) => {
  let raw = input.toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (!raw) return null;
  if (raw.startsWith('BT')) raw = raw.slice(2);
  return 'BT-' + raw;
};

export const seedBookings = (): Record<string, Booking> => {
  const d = new Date();
  d.setDate(d.getDate() + 3);
  return {
    [DEMO_CODE]: { code: DEMO_CODE, serviceId: 's6', spec: 'Lena K.', date: iso(d), time: '11:00', name: 'Demo Guest', phone: '+234 801 234 5678', email: '', notes: '', status: 'Confirmed' },
  };
};
