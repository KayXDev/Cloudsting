import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Guides",
    description: "Read practical Cloudsting guides about choosing Minecraft hosting, reducing lag, planning resources, and scaling your server.",
    path: "/guides",
    keywords: ["minecraft hosting guide", "minecraft server guide", "how to choose minecraft hosting"],
    hreflang: true,
  });
}

export default function GuidesPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const guides = isEs
    ? [
        {
          href: "/guides/choose-minecraft-hosting",
          title: "Cómo elegir un hosting de Minecraft",
          description: "Aprende a comparar RAM, CPU, panel, backups, mitigación DDoS y posibilidades reales de escalado.",
        },
        {
          href: "/guides/reduce-minecraft-server-lag",
          title: "Cómo reducir lag en un servidor de Minecraft",
          description: "Checklist práctica para optimizar ticks, generación de chunks, plugins, modpacks y recursos del nodo.",
        },
      ]
    : [
        {
          href: "/guides/choose-minecraft-hosting",
          title: "How to choose Minecraft hosting",
          description: "Learn how to compare RAM, CPU, control panel quality, backups, DDoS mitigation, and realistic scaling.",
        },
        {
          href: "/guides/reduce-minecraft-server-lag",
          title: "How to reduce Minecraft server lag",
          description: "A practical checklist for optimizing ticks, chunk generation, plugins, modpacks, and infrastructure limits.",
        },
      ];

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Guías de hosting para Minecraft" : "Minecraft hosting guides"}
          </h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Este hub concentra contenido informativo pensado para usuarios que todavía están comparando proveedores, dimensionando recursos o intentando optimizar un servidor. Sirve como capa SEO informacional y también como ayuda real para clientes potenciales."
              : "This hub gathers informational content for users who are still comparing providers, planning resources, or trying to optimize a Minecraft server. It works as informational SEO content and as genuinely useful material for potential customers."}
          </p>
        </div>

        <div className="mt-10 grid gap-4 lg:grid-cols-2">
          {guides.map((guide) => (
            <Link key={guide.href} href={guide.href}>
              <Card className="h-full p-6 transition hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--surface2)]">
                <h2 className="text-xl font-extrabold text-[color:var(--text)]">{guide.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{guide.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}