# Changelog

## 2026-03-17

- Added a reusable SEO layer with canonical metadata, Open Graph, Twitter cards, and shared site configuration.
- Added structured data for the global layout, home page, pricing page, and FAQ page.
- Added discovery endpoints for search and AI consumers: `robots.txt`, `sitemap.xml`, `manifest.webmanifest`, `llms.txt`, and `llms-full.txt`.
- Added page-level SEO metadata for key public routes and documented the new SEO setup.
- Fixed the JSON-LD runtime issue by changing structured data scripts to use a root object with `@context` and `@graph`.