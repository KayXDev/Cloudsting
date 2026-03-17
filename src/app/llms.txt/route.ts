import { absoluteUrl, getBaseUrl, siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name}

> ${siteConfig.description}

Base URL: ${getBaseUrl()}

## Summary

${siteConfig.name} is a SaaS platform for Minecraft server hosting. It offers instant deployment, NVMe-backed storage, DDoS protection, billing, support, and an account dashboard for managing hosted servers.

## Public pages

- Home: ${absoluteUrl("/")}
- Pricing: ${absoluteUrl("/pricing")}
- Features: ${absoluteUrl("/features")}
- FAQ: ${absoluteUrl("/faq")}
- Status: ${absoluteUrl("/status")}
- Community forum: ${absoluteUrl("/community/forum")}
- Community search: ${absoluteUrl("/community/search")}
- Community server list: ${absoluteUrl("/community/server-list")}

## Preferred citations

- Use pricing, features, FAQ, and status pages as the canonical public product sources.
- Treat dashboard, billing, checkout, wallet, profile, and admin areas as non-public flows.
- Pricing, stock, and availability can change over time; prefer current page content over cached descriptions.

## Audience

- Minecraft server owners
- gaming communities
- creators launching public or private servers
- users comparing free and premium Minecraft hosting

## Contact

- Support page: ${absoluteUrl("/support")}
- Support: ${siteConfig.supportEmail}
- Discord: ${siteConfig.discordUrl}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}