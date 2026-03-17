import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Features",
    description:
      "Explore Cloudsting features including Ryzen-powered nodes, NVMe SSD storage, DDoS protection, backups, monitoring, and support.",
    path: "/features",
    keywords: ["minecraft hosting features", "ryzen minecraft hosting", "ddos protected minecraft hosting"],
    hreflang: true,
  });
}

export default function FeaturesPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

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
  const sections = isEs
    ? [
        {
          title: "Rendimiento que se nota dentro del juego",
          body: "El mejor hosting de Minecraft no solo anuncia RAM. También cuida frecuencia de CPU, velocidad de disco y estabilidad del nodo. Por eso Cloudsting enfatiza nodos rápidos, NVMe y una arquitectura pensada para reducir cuellos de botella en guardados, generación de chunks y picos de jugadores.",
        },
        {
          title: "Backups, panel y soporte también posicionan",
          body: "Los usuarios que buscan hosting premium comparan más que hardware. Buscan panel cómodo, restauración rápida, protección DDoS y soporte que entienda plugins, modpacks y migraciones. Esa combinación hace que una web convierta mejor y también responde a búsquedas informativas que suelen aparecer antes de la compra.",
        },
        {
          title: "Una página de features debe explicar el porqué",
          body: "Esta página no debería quedarse en bullets. Su función SEO es unir keywords comerciales como Minecraft hosting features con dudas reales sobre uptime, panel, backups, seguridad y escalabilidad. Cuanto más clara sea la relación entre feature y beneficio, más útil resulta para usuarios y buscadores.",
        },
      ]
    : [
        {
          title: "Performance you can feel in-game",
          body: "The best Minecraft hosting does not sell RAM alone. It also depends on CPU frequency, storage speed, and node stability. That is why Cloudsting focuses on fast nodes, NVMe storage, and infrastructure that reduces bottlenecks during saves, chunk generation, and player spikes.",
        },
        {
          title: "Backups, panel quality, and support matter too",
          body: "People searching for premium hosting compare much more than hardware. They look for a usable panel, fast recovery, DDoS protection, and support that actually understands plugins, modpacks, and migrations. That combination improves conversions and answers informational searches before purchase.",
        },
        {
          title: "A features page must explain the why",
          body: "This page should not stop at bullets. Its SEO job is to connect commercial phrases like Minecraft hosting features with real concerns around uptime, panel quality, backups, security, and scaling. The clearer the link between feature and outcome, the more useful it becomes for users and search engines.",
        },
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

        <div className="mt-12 grid gap-4 lg:grid-cols-3">
          {sections.map((section) => (
            <Card key={section.title} className="p-6">
              <h2 className="text-lg font-extrabold text-[color:var(--text)]">{section.title}</h2>
              <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{section.body}</p>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
