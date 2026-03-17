import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export const metadata: Metadata = createMetadata({
  title: "Minecraft Hosting FAQ",
  description:
    "Find answers about deployment times, backups, mods, panel access, and how Cloudsting Minecraft hosting works.",
  path: "/faq",
  keywords: ["minecraft hosting faq", "minecraft hosting support", "modded server hosting faq"],
});

export default function FaqPage() {
  const lang = getLanguageFromCookies();

  const items = [
    { qKey: "faq.items.deploy.q", aKey: "faq.items.deploy.a" },
    { qKey: "faq.items.backups.q", aKey: "faq.items.backups.a" },
    { qKey: "faq.items.mods.q", aKey: "faq.items.mods.a" },
    { qKey: "faq.items.access.q", aKey: "faq.items.access.a" },
  ];
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: t(lang, item.qKey),
      acceptedAnswer: {
        "@type": "Answer",
        text: t(lang, item.aKey),
      },
    })),
    url: absoluteUrl("/faq"),
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <Container className="py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "faq.title")}</h1>
        <div className="mt-10 grid gap-3">
          {items.map((i) => (
            <Card key={i.qKey} className="p-6">
              <div className="text-sm font-extrabold">{t(lang, i.qKey)}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, i.aKey)}</div>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
