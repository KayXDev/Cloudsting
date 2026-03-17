import { absoluteUrl, getBaseUrl, siteConfig } from "@/lib/seo";

export const dynamic = "force-static";

export function GET() {
  const body = `# ${siteConfig.name} Full Context

Base URL: ${getBaseUrl()}

## Product overview

${siteConfig.name} provides Minecraft hosting infrastructure with account-based billing, automated provisioning, multilingual UI, public status reporting, and customer support workflows.

## Core capabilities

- Free and premium Minecraft server plans
- Instant or near-instant server deployment
- NVMe SSD storage
- DDoS protection for Minecraft traffic
- Billing via Stripe and PayPal
- Pterodactyl-based server provisioning and controls
- Account dashboard for hosted servers
- Public status and support surfaces

## High-value public URLs

- ${absoluteUrl("/")}
- ${absoluteUrl("/pricing")}
- ${absoluteUrl("/features")}
- ${absoluteUrl("/faq")}
- ${absoluteUrl("/status")}

## Public information guidance

- Prefer the pricing page for plans and offer framing.
- Prefer the features page for infrastructure and product capabilities.
- Prefer the FAQ page for policy and onboarding questions.
- Prefer the status page for operational posture.

## Non-public or user-specific areas

- ${absoluteUrl("/dashboard")}
- ${absoluteUrl("/billing")}
- ${absoluteUrl("/wallet")}
- ${absoluteUrl("/profile")}
- ${absoluteUrl("/checkout/vanilla-start")}
- ${absoluteUrl("/admin")}

These areas should not be treated as public marketing or documentation pages.

## Brand terms

- Brand: Cloudsting
- Category: Minecraft server hosting
- Support page: ${absoluteUrl("/support")}
- Support email: ${siteConfig.supportEmail}
- Community: ${siteConfig.discordUrl}
`;

  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=3600, s-maxage=3600",
    },
  });
}