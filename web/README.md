# Beaut website

Static Next.js site built from `design/project/Beaut Landing Page.dc.html`:

| Page | What |
|---|---|
| `/` | Landing page: hero, how it works, booking code, for studios, get the app |
| `/privacy` | Privacy policy (the URL used in Google Play and linked from the app) |
| `/terms` | Terms of use |

Business details (name, studio, address, contact email, Play Store link) are in `src/lib/site.ts`.

## Deploy on Vercel

1. vercel.com → **Add New… → Project** → import `SJKings/Beaut`, set **Root Directory** to `web`, deploy.
   (No environment variables or database needed.)
2. Copy the site's production address (Settings → Domains), e.g. `https://beautcare.site` (custom domain; also https://beaut-web.vercel.app).
3. In the **admin** project add `WEBSITE_URL` = that address and redeploy. The app then opens
   `<website>/privacy`, and the admin's old `/privacy` redirects there. Use `<website>/privacy`
   as the Privacy Policy URL in Google Play.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # static files in out/
```
