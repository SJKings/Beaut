// Studio catalogue. Matches the mobile app's list (app/src/lib/data.ts); the
// server prices bookings from here rather than trusting what the app sends.
export const SERVICES: Record<string, { name: string; price: number; dur: number }> = {
  s1: { name: "Signature Cut & Style", price: 45, dur: 60 },
  s6: { name: "Hydrating Facial", price: 50, dur: 60 },
  s3: { name: "Gel Manicure", price: 30, dur: 45 },
  s5: { name: "Soft Glam Makeup", price: 55, dur: 60 },
  s2: { name: "Silk Press", price: 60, dur: 90 },
  s9: { name: "Root Colour Touch-up", price: 70, dur: 100 },
  s4: { name: "Pedicure Spa", price: 38, dur: 50 },
  s7: { name: "Classic Lash Set", price: 65, dur: 90 },
  s8: { name: "Brow Lamination", price: 35, dur: 40 },
};

export const SPECIALISTS = ["Any available", "Amara O.", "Lena K.", "Tolu A.", "Sofia R."];

export const STATUSES = ["Confirmed", "Checked in", "Completed", "No-show", "Cancelled"] as const;
export type Status = (typeof STATUSES)[number];

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
