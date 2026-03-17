# Changelog

## 2026-03-17

- Added a persistent wallet system with balance tracking, wallet transaction history, Stripe and PayPal top-ups, and wallet-funded hosting checkout.
- Extended checkout, wallet, and navbar flows so users can add funds, see available balance, and pay hosting plans directly from wallet credit.
- Hardened wallet and session handling against legacy null transaction fields and transient development-time API 404s in the navbar.
- Restored the dashboard to a card-based server list and added direct panel access buttons with a slimmer multi-server friendly layout.
- Validated the production build after the wallet, dashboard, and auth resilience changes.