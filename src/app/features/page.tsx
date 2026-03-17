import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export const metadata: Metadata = createMetadata({
  title: "Minecraft Hosting Features",
  description:
    "Explore Cloudsting features including Ryzen-powered nodes, NVMe SSD storage, DDoS protection, backups, monitoring, and support.",
  path: "/features",
  keywords: ["minecraft hosting features", "ryzen minecraft hosting", "ddos protected minecraft hosting"],
});

export default function FeaturesPage() {
  const lang = getLanguageFromCookies();

  const features = [
    { titleKey: "features.items.instant.title", descKey: "features.items.instant.desc" },
    { titleKey: "features.items.cpu.title", descKey: "features.items.cpu.desc" },
    { titleKey: "features.items.nvme.title", descKey: "features.items.nvme.desc" },
    { titleKey: "features.items.ddos.title", descKey: "features.items.ddos.desc" },
    { titleKey: "features.items.stack.title", descKey: "features.items.stack.desc" },
    { titleKey: "features.items.backups.title", descKey: "features.items.backups.desc" },
    { titleKey: "features.items.monitoring.title", descKey: "features.items.monitoring.desc" },
    { titleKey: "features.items.support.title", descKey: "features.items.support.desc" },
  ];

  return (
    <main>
      <Container className="py-16">
        <div className="rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface1)] p-8">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-[color:var(--accent2)]">{t(lang, "features.kicker")}</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight">{t(lang, "features.title")}</h1>
          <p className="mt-3 max-w-2xl text-sm text-[color:var(--muted)]">
            {t(lang, "features.subtitle")}
          </p>
        </div>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <Card key={f.titleKey} className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{t(lang, f.titleKey)}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, f.descKey)}</div>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
