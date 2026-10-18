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

## Backend

"Confirm booking" POSTs the booking as JSON to `{EXPO_PUBLIC_API_URL}/api/bookings`
(`src/lib/api.ts`). The booking is only saved and the code shown once the server answers 2xx;
otherwise the guest sees "Couldn't send your booking" and can retry.

Set the server address in `eas.json` by adding an `env` block to the `base` profile:

```json
"base": {
  "node": "22.22.0",
  "env": { "EXPO_PUBLIC_API_URL": "https://beaut-studio.vercel.app" }
}
```

Without it, bookings stay on the device. EAS rejects an empty value, so leave the block out
until the real address is known.

Body: `code, serviceId, serviceName, price, durationMin, specialist, date (YYYY-MM-DD), time (HH:MM),
name, phone, email, notes, status, createdAt (ms)`.

## Android build (no laptop needed)

`.github/workflows/build.yml` starts an EAS production build (`.aab` for Google Play) on every push
to `main` that touches `app/`, or from GitHub → Actions → "Android production build" → Run workflow.
Expo creates and stores the Android signing key on the first build (`credentialsSource: remote`).

One-time setup:
1. Create a free account at expo.dev. Under Account settings → Access tokens, create a token.
2. In GitHub: repo Settings → Secrets and variables → Actions → New repository secret.
   Add `EXPO_TOKEN` (the token). Optional: `EXPO_USERNAME`, only if the project should belong to
   a different Expo account or organisation than the token's.
3. Run the workflow. The finished `.aab` is at expo.dev → your project → Builds.

Android package name: `com.sjkings.beaut`. Google Play ties the listing to it permanently, so
change it in `app.json` before the first upload if you want a different one.

## Not wired up yet

- **Backend reads.** Looking up a code, rescheduling and cancelling still use on-device data
  only; they need matching API endpoints.
- **Email.** The confirmation says a copy was sent when an email is given; nothing is sent yet.
- **Availability.** Taken slots use the prototype's mock pattern (`slotTaken` in `data.ts`).
- **Photos.** Striped placeholders stand in for salon and service photography.
- Studio name, address, prices and specialists are the prototype's sample data.
