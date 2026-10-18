# Beaut Studio — admin dashboard + booking API

Next.js 16 app built from `design/project/Beaut Studio Dashboard.dc.html`. It is both the studio's
bookings dashboard and the backend the Beaut mobile app talks to.

## What's in it

| Path | What |
|---|---|
| `/` | Dashboard (password protected): Today / Upcoming / Past / Cancelled / All, search by code, name or phone, booking detail with check-in, no-show, complete, cancel, reinstate, call guest. Polls every 4 s and pops a "New booking" alert. |
| `/login` | Studio password sign-in |
| `POST /api/bookings` | App creates a booking. Price and duration come from `src/lib/catalog.ts`. `409` = code taken (the app retries with a new code). |
| `GET /api/bookings/:code` | App looks a booking up by code |
| `PATCH /api/bookings/:code` | Guest `{ "action": "cancel" }` or `{ "action": "reschedule", date, time, specialist }` (only while Confirmed) |
| `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:code` | Dashboard data and status changes (signed-in only) |

Bookings are stored in Postgres; the table is created automatically on first use.

## Deploy on Vercel (works from an iPad browser)

1. vercel.com → **Add New… → Project** → import `SJKings/Beaut`.
2. Set **Root Directory** to `admin` (Framework: Next.js is detected). Don't deploy yet.
3. Add a database: in the project, **Storage → Create Database → Neon (Postgres)** (or Supabase),
   and connect it to the project. This adds `DATABASE_URL` / `POSTGRES_URL` for you.
4. **Settings → Environment Variables** → add `ADMIN_PASSWORD` (the studio's dashboard password).
5. Deploy. Your address is shown on the project page, e.g. `https://beaut-studio.vercel.app`.
6. Put that address in `app/eas.json` as `EXPO_PUBLIC_API_URL` (see `app/README.md`) and push;
   the next Android build sends bookings here.

## Local development

```bash
npm install
npm run dev        # http://localhost:3000, in-memory sample bookings when no DATABASE_URL
```

Set `ADMIN_PASSWORD` (e.g. in `.env.local`) to sign in. Without a database, production refuses to
start serving bookings (503) rather than silently losing them.

## Known gaps

- Slot availability isn't checked: two guests can book the same specialist and time.
- Anyone holding a booking code can view and change that booking (that's the app's design);
  there's no rate limiting on code lookups yet.
- The service catalogue is duplicated in `app/src/lib/data.ts`; keep both in step.
