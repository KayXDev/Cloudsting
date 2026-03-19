# Changelog

## 2026-03-19

- Localized panel access emails and purchase receipts using the user's stored language preference, plus persisted language capture across login, registration, Google auth, and checkout.
- Added premium Discord purchase webhook notifications with idempotent delivery, provider-specific embeds, admin test sending, live/test variants, and richer plan, node, and provisioning details.
- Added cookie consent management with a banner, a dedicated cookie policy page, and footer navigation.
- Improved paid checkout redirects so users land directly on the newly purchased server in the dashboard.
- Added Pterodactyl deletion reconciliation so removed panel servers are reflected locally.
- Added a resend utility for paid orders missing receipt delivery and validated the production build successfully before pushing.
- Added a Prisma diagnostic script to list orphaned orders and servers, including missing user, plan, and order relations.
- Added a safe Prisma cleanup script that deletes only orphaned `FAILED` orders and orphaned `DELETED` servers, with dry-run mode by default.