# Changelog

## 2026-03-18

- Fixed Pterodactyl provisioning for existing accounts by linking panel users by email before trying to create a new panel account.
- Added a relink utility script to backfill `pterodactylUserId` for older local users that already exist in Pterodactyl.
- Validated the current production build successfully before pushing.