# Changelog

## 2026-03-17

- Forced Prisma Client regeneration during install and build so Vercel compiles against the latest schema.
- Updated the build pipeline to run `prisma generate && next build` and added a `postinstall` hook for Prisma generation.
- Validated the full production build after the Vercel Prisma fix.