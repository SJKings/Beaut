# Beaut — guest booking app

Expo (SDK 58) + Expo Router implementation of `project/Beaut App.dc.html`.
No sign-up: each booking gets a unique code (e.g. `BT-4F7Q2`) used to find, reschedule or cancel it.

```bash
npm install
npx expo start      # then press i / a / w, or scan with Expo Go
npm run typecheck
```

## Structure

| Path | What |
|---|---|
| `src/app/index.tsx` | Welcome (shown until "Get started" / "I have a booking code") |
| `src/app/(tabs)/` | Home, Explore, Find by code, Bookings on this device + floating pill tab bar |
| `src/app/service/[id].tsx` | Service page: specialist, date strip, time slots, About/Reviews tabs. `?reschedule=CODE` reuses it to move a booking |
| `src/app/details.tsx` → `review.tsx` → `confirmed.tsx` | Guest details (name + phone required), review, confirmation with code |
| `src/app/booking/[code].tsx` | Booking detail, copy code, reschedule, cancel sheet |
| `src/lib/store.tsx` | Bookings, device history, favourites and the guest form, persisted with AsyncStorage |
| `src/lib/data.ts` | Services, specialists, slots, date helpers, code generation |
| `src/lib/theme.ts` | Colours, fonts (Outfit, JetBrains Mono) and the status colours shared with the studio dashboard |

## Not wired up yet

- **Backend.** Bookings are stored on the device only, so a code only resolves on the phone that
  made or looked it up, and the studio dashboard can't see them. All reads/writes go through
  `src/lib/store.tsx`, which is the single place to swap in an API.
- **Email.** The confirmation says a copy was sent when an email is given; nothing is sent yet.
- **Availability.** Taken slots use the prototype's mock pattern (`slotTaken` in `data.ts`).
- **Photos.** Striped placeholders stand in for salon and service photography.
- Studio name, address, prices and specialists are the prototype's sample data.
