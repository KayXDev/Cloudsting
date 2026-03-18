import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Blog",
    description: "Technical Minecraft hosting articles about RAM sizing, backups, Forge vs Fabric, and choosing the right server setup.",
    path: "/blog",
    keywords: ["minecraft hosting blog", "minecraft server articles", "minecraft hosting tips"],
    hreflang: true,
  });
}

export default function BlogPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const posts = isEs
    ? [
        {
          href: "/blog/how-to-create-a-minecraft-server",
          title: "Como crear un servidor de Minecraft",
          description: "Articulo base para usuarios que todavia estan montando su primer servidor y necesitan una ruta clara.",
        },
        {
          href: "/blog/how-much-ram-for-minecraft-server",
          title: "Cuánta RAM necesita un servidor de Minecraft",
          description: "Guía práctica para dimensionar memoria según jugadores, software, plugins y modpacks.",
        },
        {
          href: "/blog/forge-vs-fabric-for-server-owners",
          title: "Forge vs Fabric para admins de servidores",
          description: "Comparativa enfocada en rendimiento, complejidad operativa y tipo de comunidad.",
        },
        {
          href: "/blog/how-to-back-up-a-minecraft-server",
          title: "Cómo hacer backups de un servidor de Minecraft",
          description: "Buenas prácticas para proteger mundos, restaurar rápido y reducir pérdidas de datos.",
        },
      ]
    : [
        {
          href: "/blog/how-to-create-a-minecraft-server",
          title: "How to create a Minecraft server",
          description: "A foundational article for users still setting up their first server and comparing early decisions.",
        },
        {
          href: "/blog/how-much-ram-for-minecraft-server",
          title: "How much RAM does a Minecraft server need",
          description: "A practical guide to sizing memory based on player counts, software, plugins, and modpacks.",
        },
        {
          href: "/blog/forge-vs-fabric-for-server-owners",
          title: "Forge vs Fabric for server owners",
          description: "A comparison focused on performance, operational complexity, and community fit.",
        },
        {
          href: "/blog/how-to-back-up-a-minecraft-server",
          title: "How to back up a Minecraft server",
          description: "Best practices for protecting worlds, restoring quickly, and reducing data loss risk.",
        },
      ];

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">{isEs ? "Blog de hosting para Minecraft" : "Minecraft hosting blog"}</h1>
          <p className="mx-auto mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Este blog complementa las landings comerciales con artículos que responden dudas muy concretas antes de la compra. Esa capa informativa ayuda al SEO y también mejora la confianza del usuario durante la comparación."
              : "This blog complements the commercial landing pages with articles that answer specific questions before purchase. That informational layer improves SEO and also builds trust while visitors compare options."}
          </p>
        </div>
        <div className="mt-10 grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
          {posts.map((post) => (
            <Link key={post.href} href={post.href}>
              <Card className="h-full p-6 transition hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--surface2)]">
                <h2 className="text-xl font-extrabold text-[color:var(--text)]">{post.title}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{post.description}</p>
              </Card>
            </Link>
          ))}
        </div>
      </Container>
    </main>
  );
}