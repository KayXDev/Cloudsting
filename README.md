# 🚀 KayX Hosting (Cloudsting)

Production-ready Minecraft server hosting platform (SaaS) built for automated provisioning, modern billing, and a clean admin workflow.

## ✨ Highlights

- 🧱 **Minecraft hosting SaaS**: plans → checkout → provisioning → dashboard.
- ⚡ **Fast UI**: Next.js App Router + React + TypeScript + Tailwind.
- 🗄️ **MongoDB + Prisma** (Mongo replica set ready).
- 🧰 **Admin module**: users, plans, servers, infra, billing.
- 🧾 **Payments**: Stripe + PayPal (success callbacks + webhooks).
- 🐉 **Pterodactyl integration**: provisioning + node sync + power controls.
- 🌍 **i18n**: cookie-based language switching across the app.
- 🧱 **Minecraft-inspired branding**: pixel mark + hosting motif.

## 🧩 Tech Stack

- **Web**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **DB**: MongoDB
- **ORM**: Prisma
- **Cache/Rate limit**: Redis (optional but recommended)
- **Payments**: Stripe + PayPal
- **Provisioning/Panel**: Pterodactyl
- **Email**: Nodemailer (SMTP)

## ✅ Requirements

- Node.js (LTS recommended)
- Docker (optional, for local MongoDB replica set + Redis)

## 🧪 Quick Start (Local)

### 1) Install dependencies

```bash
npm install
```

### 2) Start local DB/Redis (recommended)

This repo includes a local MongoDB replica set and Redis via Docker:

```bash
docker compose up -d
```

### 3) Configure environment

Create a `.env` file from `.env.example`:

```bash
cp .env.example .env
```

For Docker local MongoDB replica set, a good default is:

- `DATABASE_URL=mongodb://127.0.0.1:27017/kayxhosting?replicaSet=rs0`
- `REDIS_URL=redis://127.0.0.1:6379`

### 4) Prisma

Generate Prisma client:

```bash
npm run prisma:generate
```

Push schema to MongoDB:

```bash
npm run prisma:push
```

Seed default plans (optionally seeds an admin if you set `ADMIN_EMAIL`/`ADMIN_PASSWORD` in `.env`):

```bash
npm run prisma:seed
```

### 5) Run dev server

```bash
npm run dev
```

Open http://localhost:3000

## 🔐 Environment Variables

See `.env.example` for the canonical list.

### Required

- `DATABASE_URL` — MongoDB connection string (replica set recommended)
- `JWT_ACCESS_SECRET` — min 32 chars
- `JWT_REFRESH_SECRET` — min 32 chars

### Recommended

- `REDIS_URL` — enables rate limiting + caching
- `APP_URL` — used for absolute redirects/callbacks (defaults to `http://localhost:3000`)

### Minecraft public stats (optional)

- `MC_PUBLIC_HOST_SUFFIX` — suffix appended to `pterodactylIdentifier` for pinging (default: `.mcsh.io`)
- `MC_PUBLIC_DEFAULT_PORT` — port used for pinging (default: `25565`)

### Payments (optional)

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `PAYPAL_CLIENT_ID`
- `PAYPAL_CLIENT_SECRET`
- `PAYPAL_WEBHOOK_ID`
- `PAYPAL_ENV` (`sandbox` | `live`)

### Authentication (optional)

- `GOOGLE_CLIENT_ID`
- `NEXT_PUBLIC_GOOGLE_CLIENT_ID` — same Google OAuth client id exposed to the browser for the Google sign-in button

### Email / Support (optional)

- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`
- `SUPPORT_INBOX` — where support messages are delivered
- `DISCORD_PURCHASE_WEBHOOK_URL` — Discord webhook used to post a detailed embed whenever an order is paid

### Pterodactyl (optional)

- `PTERO_URL`
- `PTERO_APPLICATION_API_KEY`
- `PTERO_CLIENT_API_KEY` — required for dashboard power controls
- `PTERO_AUTO_CREATE_USER` (`true`/`false`)
- `PTERO_DEFAULT_EGG_ID`
- `PTERO_DEFAULT_DOCKER_IMAGE`
- `PTERO_DEFAULT_STARTUP`
- `PTERO_DEFAULT_ENV`
- `NEXT_PUBLIC_PTERO_PANEL_URL` — used for UI link-outs to panel

If you already have users created in Pterodactyl and some local accounts still have no `pterodactylUserId`, you can relink them by email with:

```bash
npm run ptero:relink-users
```

### Paymenter sync (optional)

If you use Paymenter as an external billing/admin panel and want orders to sync as “Services”:

- `PAYMENTER_URL`
- `PAYMENTER_API_KEY`
- `PAYMENTER_CURRENCY_CODE` (default `USD`)
- `PAYMENTER_SERVICE_MAPPING` (JSON string)

Example:

```json
{"vanilla-start":{"productId":1,"planId":2}}
```

## 🧭 App Routes (UI)

### Public

- `/` — Home
- `/pricing` — Pricing & plans
- `/features` — Features
- `/faq` — FAQ
- `/status` — Platform status
- `/support` — Support contact
- `/login` — Login
- `/register` — Register

### Authenticated

- `/dashboard` — User dashboard (servers list + actions)
- `/profile` — Profile settings
- `/cart` — Persisted shopping cart for plan selections
- `/checkout/[planSlug]` — Checkout for a plan

### Community

- `/community/forum` — Community forum
- `/community/reviews` — Public hosting reviews
- `/community/search` — Community search placeholder
- `/community/server-list` — Public server list (DB must be configured)

### Admin

- `/admin` — Admin entry
- `/admin/overview`
- `/admin/users`
- `/admin/servers`
- `/admin/plans`
- `/admin/infra`
- `/admin/billing`
- `/admin/forum`

## 🔌 API Routes

All API endpoints are implemented via Next.js App Router route handlers.

### Auth

- `POST /api/auth/register` — create account
- `POST /api/auth/login` — login (sets session cookie)
- `POST /api/auth/logout` — logout
- `GET /api/auth/me` — current session

### Plans & Servers

- `GET /api/plans` — list active plans
- `GET /api/servers` — list user servers
- `POST /api/servers/[id]/power` — power action (start/stop/restart/kill)

### Checkout

- `POST /api/checkout/stripe`
- `GET /api/checkout/stripe/success`
- `POST /api/checkout/paypal`
- `GET /api/checkout/paypal/success`

### Webhooks

- `POST /api/webhooks/stripe`
- `POST /api/webhooks/paypal`

### Admin

- `GET,POST /api/admin/nodes` — node sync/list
- `GET /api/admin/plans` — list plans
- `PATCH /api/admin/plans/[slug]` — edit plan
- `GET /api/admin/servers` — list servers
- `DELETE /api/admin/servers/[id]` — delete server record (hide from platform)
- `POST /api/admin/servers/[id]/suspend` — suspend
- `POST /api/admin/servers/[id]/unsuspend` — unsuspend
- `PATCH /api/admin/servers/bulk` — bulk actions
- `GET /api/admin/users` — list users
- `PATCH /api/admin/users/[id]` — update user

### Misc

- `GET /api/health` — health check
- `GET /api/minecraft/versions` — available versions for checkout selector
- `PATCH /api/profile` — update profile
- `POST /api/reviews` — create or update the current user's public hosting review
- `POST /api/support` — submit support form
- `POST /api/i18n/language` — set language cookie

## 🌍 i18n / Language

- Language is stored in the `kx_lang` cookie.
- Server components read the cookie and render translated content.
- Client components use `LanguageProvider` and `t(lang, key)`.

## 🍪 Cookie Consent

- A cookie consent banner is displayed to visitors until they accept, reject, or customize categories.
- Essential cookies remain active because authentication, checkout continuity, and account security depend on them.
- Consent state is stored in the `kx_cookie_consent` cookie.
- A human-readable policy page is available at `/cookies`.

## 🔎 SEO / AI discovery

- Global metadata now includes canonical URLs, Open Graph, Twitter cards, and richer robots directives.
- Public discovery endpoints are available at `/robots.txt`, `/sitemap.xml`, `/manifest.webmanifest`, `/llms.txt`, and `/llms-full.txt`.
- Public-facing marketing pages expose structured data for search engines and AI systems.
- Set `APP_URL` to the production domain so canonical URLs, sitemap entries, and AI discovery files point to the live site.

## 🧾 Payments + Provisioning Flow

1. User selects a plan from pricing or saves it to `/cart`
2. App creates checkout session (Stripe/PayPal)
3. Success callback +/or webhooks mark order as paid
4. App provisions a server in Pterodactyl (if configured)
5. User manages servers from `/dashboard`

## 🛠️ Scripts

- `npm run dev` — dev server
- `npm run build` — production build (includes lint + typecheck)
- `npm run start` — start production server
- `npm run lint` — lint
- `npm run prisma:generate` — prisma generate
- `npm run prisma:push` — prisma db push
- `npm run prisma:seed` — seed plans (+ optional admin)

## 🧯 Troubleshooting

- **Prisma + MongoDB**: Prisma transactions require MongoDB replica set. Use `docker compose up -d` provided here.
- **No servers show in community list**: ensure `DATABASE_URL` is configured.
- **Webhooks failing**: verify webhook secrets and that your server is reachable from Stripe/PayPal.

## 📄 License

Internal / private project (adjust as needed).

