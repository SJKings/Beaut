# Beaut Studio — admin dashboard + booking API

Next.js 16 app built from `design/project/Beaut Studio Dashboard.dc.html`. It is both the studio's
bookings dashboard and the backend the Beaut mobile app talks to.

## What's in it

| Path | What |
|---|---|
| `/` | Dashboard (password protected): Today / Upcoming / Past / Cancelled / All, search by code, name or phone, booking detail with check-in, no-show, complete, cancel, reinstate, call guest. Polls every 4 s and pops a "New booking" alert. |
| `/login` | Studio password sign-in |
| `GET /api/catalog` | Services, prices, specialists, slots and whether email is on. **The app downloads this on every launch**, so `src/lib/catalog.ts` is the only place to change the menu. |
| `GET /api/availability?date&serviceId` | Free specialists per slot (past times and full slots come back empty) |
| `POST /api/bookings` | App creates a booking. Price and duration come from the catalogue; "Any available" is assigned a free specialist. `409` with `reason: "code_taken"` (app retries with a new code) or `"slot_taken"`. Emails the code when email is set up. |
| `GET /api/bookings/:code` | App looks a booking up by code. Name, phone, email and notes come back partly hidden. |
| `PATCH /api/bookings/:code` | Guest `{ "action": "cancel" }` or `{ "action": "reschedule", date, time, specialist }` (only while Confirmed, re-checks availability) |
| `GET /api/admin/bookings`, `PATCH /api/admin/bookings/:code` | Dashboard data and status changes (signed-in only) |

## Database (Prisma + Vercel Postgres)

- Schema: `prisma/schema.prisma` (`Booking`, `BookingStatus`, `RateLimit`); client generated to
  `src/generated/prisma` on install. Connection settings: `prisma.config.ts` (migrations) and
  `src/lib/prisma.ts` (runtime, via `@prisma/adapter-pg`).
- Environment: see `.env.example`. At runtime the app uses `POSTGRES_PRISMA_URL` (pooled);
  migrations use `POSTGRES_URL_NON_POOLING` (direct). `DATABASE_URL` works for both locally.
- **Migrations run automatically on every Vercel deploy** (`npm run build` runs
  `prisma migrate deploy` when a database is configured).

| Command | What it does |
|---|---|
| `npx prisma migrate dev --name <change>` | After editing the schema: creates a migration in `prisma/migrations/` and applies it to your local database |
| `npm run db:deploy` | Applies pending migrations (what the Vercel build does) |
| `npx prisma migrate status` | Shows which migrations a database has |
| `npm run db:studio` | Opens Prisma Studio to browse the data |

Booking fields: `code` (the id, e.g. `BT-4F7Q2`), `name`/`phone`/`email`/`notes` (the customer),
`serviceId`/`serviceName`/`price`/`durationMin` (the service type, copied at booking time),
`specialist`, `date` + `time` (studio-local), `status`
(`Confirmed`, `Checked in`, `Completed`, `No-show`, `Cancelled`), `createdAt`, `updatedAt`.

**Double bookings:** each specialist can only have one active (Confirmed / Checked in) booking
overlapping a given time, using each service's duration. Writes for a day are serialised with a
Postgres advisory lock, so two guests tapping "Confirm" at once can't both get the slot. Reinstating
a cancelled booking in the dashboard re-checks the slot too.

**Booking codes:** an IP that enters 10 wrong codes in 15 minutes is blocked from lookups for
15 minutes; one IP can create at most 20 bookings an hour. Code lookups hide contact details
(`Ada O.`, `+••• ••• ••• 2222`); the phone that made the booking keeps its full copy.

## Deploy on Vercel (works from an iPad browser)

1. vercel.com → **Add New… → Project** → import `SJKings/Beaut`.
2. Set **Root Directory** to `admin` (Framework: Next.js is detected). Don't deploy yet.
3. Add a database: in the project, **Storage → Create Database → Neon (Postgres)** and connect it
   to the project. This adds `POSTGRES_PRISMA_URL`, `POSTGRES_URL_NON_POOLING` and friends for you;
   the first deploy creates the tables.
4. **Settings → Environment Variables** → add `ADMIN_PASSWORD` (the studio's dashboard password).
   Optional:
   - `RESEND_API_KEY` and `EMAIL_FROM` to email guests their code (see below).
   - `STUDIO_TIMEZONE` if the studio isn't in Lagos (default `Africa/Lagos`).
   - `BUSINESS_NAME` and `CONTACT_EMAIL`: shown on the privacy policy at `/privacy` (use that
     address as the Privacy Policy URL in Google Play). Redeploy after changing them.
5. Deploy. Your address is shown on the project page, e.g. `https://beaut-studio.vercel.app`.
6. Put that address in `app/eas.json` as `EXPO_PUBLIC_API_URL` (see `app/README.md`) and push;
   the next Android build sends bookings here.

## Emailing booking codes

Uses [Resend](https://resend.com) (free tier: 3,000 emails/month):

1. Sign up, then **Domains → Add domain** and add the DNS records it shows at your domain provider.
2. **API Keys → Create API key**.
3. In Vercel add `RESEND_API_KEY` (the key) and `EMAIL_FROM`, e.g. `Beaut Studio <bookings@yourdomain.com>`
   (must be on the verified domain), then redeploy.

Until both are set, no email is sent, the app's email field just says "optional", and the
confirmation screen never claims a copy was sent. If sending fails the booking still goes through.

## Local development

```bash
npm install
cp .env.example .env    # fill in, or remove the database lines to use in-memory sample data
npx prisma migrate dev  # with a local DATABASE_URL: creates the tables
npm run dev             # http://localhost:3000
```

Set `ADMIN_PASSWORD` (e.g. in `.env.local`) to sign in. Without a database, production refuses to
start serving bookings (503) rather than silently losing them.

## Notes

- Changing services, prices, specialists or slots: edit `src/lib/catalog.ts` and push. Vercel
  redeploys and the app picks the new catalogue up next time it opens. The copy in
  `app/src/lib/data.ts` is only a fallback for the very first launch without internet.
- Rate limits are per IP address, so guests sharing one network share a limit.
