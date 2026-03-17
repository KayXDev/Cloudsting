import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Forge Vs Fabric For Server Owners",
    description: "Understand the differences between Forge and Fabric from a server owner's perspective, including performance, complexity, and mod compatibility.",
    path: "/blog/forge-vs-fabric-for-server-owners",
    keywords: ["forge vs fabric", "forge vs fabric server", "minecraft modded server comparison"],
    hreflang: true,
  });
}

export default function ForgeVsFabricForServerOwnersPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isEs ? "Forge vs Fabric para administradores de servidores" : "Forge vs Fabric for server owners",
    description: isEs
      ? "Comparativa entre Forge y Fabric centrada en rendimiento, mantenimiento y tipo de comunidad."
      : "A Forge versus Fabric comparison focused on performance, maintenance, and community fit.",
    url: absoluteUrl("/blog/forge-vs-fabric-for-server-owners"),
    author: { "@type": "Organization", name: "Cloudsting" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent2)]">Blog</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Forge vs Fabric para administradores de servidores" : "Forge vs Fabric for server owners"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Comparar Forge vs Fabric es una decisión habitual cuando vas a lanzar un servidor modded. No se trata solo de mods disponibles: también importa la complejidad operativa, el rendimiento y el tipo de comunidad que quieres construir."
              : "Comparing Forge versus Fabric is a common decision when launching a modded server. It is not only about available mods; operational complexity, performance, and community fit matter as well."}
          </p>
          <div className="mt-8 grid gap-4">
            {[isEs
              ? ["Forge suele ser más pesado", "Forge es muy popular y compatible con muchos packs, pero también suele implicar entornos más pesados. Eso afecta recursos, tiempos de arranque y mantenimiento."]
              : ["Forge is often heavier", "Forge is extremely popular and compatible with many packs, but it often comes with a heavier operating footprint. That affects resources, startup times, and maintenance."],
              isEs
              ? ["Fabric suele priorizar agilidad", "Fabric puede resultar más atractivo si buscas un entorno modded más ligero o una experiencia más ágil. No siempre sustituye a Forge, pero en ciertos proyectos puede simplificar bastante la operación."]
              : ["Fabric often prioritizes agility", "Fabric can be more attractive if you want a lighter modded environment or a faster operational experience. It does not replace Forge in every case, but it can simplify day-to-day management for some projects."],
              isEs
              ? ["La elección depende del proyecto", "Si el modpack o la comunidad ya están definidos, probablemente la decisión venga marcada. Si aún estás explorando, conviene pensar en rendimiento, soporte esperado, ritmo de cambios y cuánto margen técnico tendrás para gestionar incidencias."]
              : ["The right answer depends on the project", "If the modpack or community style is already defined, the decision may effectively be made for you. If you are still exploring, think about performance, support expectations, update cadence, and how much technical headroom you will have to handle issues."],
              isEs
              ? ["Qué mirar después", "Después de elegir stack, lo lógico es revisar páginas de hosting para Forge, Fabric y modded Minecraft, además del sizing de RAM necesario para ese tipo de servidor."]
              : ["What to review next", "Once you choose the stack, the next logical step is reviewing Forge hosting, Fabric hosting, and modded Minecraft hosting pages, along with RAM sizing guidance for that type of server." ]].map(([title, body]) => (
              <Card key={title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{body}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-8 p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/forge-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Forge server hosting</Link>
              <Link href="/fabric-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Fabric server hosting</Link>
              <Link href="/modded-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">Modded Minecraft hosting</Link>
              <Link href="/blog/how-much-ram-for-minecraft-server" className="text-sm font-bold text-[color:var(--accent)]">How much RAM for a Minecraft server</Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}