// The studio catalogue: the single source of truth. The mobile app downloads it
// from GET /api/catalog (and only keeps a bundled copy for first launch / offline),
// and the server prices every booking from here.
export type Service = {
  id: string;
  name: string;
  cat: string;
  price: number;
  dur: number; // minutes
  rating: number;
  reviews: number;
  img: string;
  about: string;
};

export const SERVICES: Service[] = [
  { id: "s1", name: "Signature Cut & Style", cat: "Hair", price: 45, dur: 60, rating: 4.8, reviews: 212, img: "haircut & blow-dry", about: "Consultation, wash, precision cut and a blow-dry finish tailored to your hair type." },
  { id: "s6", name: "Hydrating Facial", cat: "Facial", price: 50, dur: 60, rating: 4.9, reviews: 168, img: "facial treatment", about: "Deep cleanse, gentle exfoliation, hydrating mask and a face and neck massage." },
  { id: "s3", name: "Gel Manicure", cat: "Nails", price: 30, dur: 45, rating: 4.7, reviews: 301, img: "manicure close-up", about: "Shape, cuticle care and long-wear gel colour in your choice of shade." },
  { id: "s5", name: "Soft Glam Makeup", cat: "Makeup", price: 55, dur: 60, rating: 4.8, reviews: 97, img: "makeup application", about: "Skin prep and a soft, camera-ready look for events, shoots or a night out." },
  { id: "s2", name: "Silk Press", cat: "Hair", price: 60, dur: 90, rating: 4.6, reviews: 140, img: "silk press result", about: "Wash, deep condition and a heat-protected press for smooth, glossy movement." },
  { id: "s9", name: "Root Colour Touch-up", cat: "Hair", price: 70, dur: 100, rating: 4.7, reviews: 88, img: "hair colouring", about: "Colour matched to your existing shade, applied to regrowth, finished with gloss." },
  { id: "s4", name: "Pedicure Spa", cat: "Nails", price: 38, dur: 50, rating: 4.8, reviews: 190, img: "pedicure", about: "Soak, scrub, nail and cuticle care, massage and polish." },
  { id: "s7", name: "Classic Lash Set", cat: "Lashes", price: 65, dur: 90, rating: 4.9, reviews: 76, img: "lash extensions", about: "One extension per natural lash for a full, natural-looking set." },
  { id: "s8", name: "Brow Lamination", cat: "Lashes", price: 35, dur: 40, rating: 4.7, reviews: 121, img: "brow lamination", about: "Lift and set brows into shape, with tint and tidy included." },
];

export const svcById = (id: string) => SERVICES.find((s) => s.id === id);

/** "Any available" is a request, not a person: the server assigns a free specialist. */
export const ANY = "Any available";
export const SPECIALISTS = ["Amara O.", "Lena K.", "Tolu A.", "Sofia R."];
export const SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:30", "14:30", "15:30", "16:30", "17:30"];

export const STUDIO = {
  name: "Beaut Studio, Lekki",
  address: "14 Admiralty Way · Open 9:00–19:00",
  // A booking must finish by closing time (a 100-min colour can't start at 17:30).
  closesAt: "19:00",
  // "Today" and "already passed" are judged in the studio's time zone.
  timeZone: process.env.STUDIO_TIMEZONE || "Africa/Lagos",
};

/** How far ahead guests can book. */
export const BOOKING_WINDOW_DAYS = 60;

export const STATUSES = ["Confirmed", "Checked in", "Completed", "No-show", "Cancelled"] as const;
export type Status = (typeof STATUSES)[number];
/** Statuses that occupy the specialist's time. */
export const ACTIVE: Status[] = ["Confirmed", "Checked in"];

export type Booking = {
  code: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMin: number;
  specialist: string;
  date: string; // YYYY-MM-DD, studio local
  time: string; // HH:MM
  name: string;
  phone: string;
  email: string;
  notes: string;
  status: Status;
  createdAt: number; // ms
  updatedAt: number; // ms
};
