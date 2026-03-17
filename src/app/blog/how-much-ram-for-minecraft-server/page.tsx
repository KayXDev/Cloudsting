import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "How Much RAM For A Minecraft Server",
    description: "Learn how much RAM a Minecraft server needs based on player count, server software, plugins, and modpacks.",
    path: "/blog/how-much-ram-for-minecraft-server",
    keywords: ["how much ram for minecraft server", "minecraft server ram", "minecraft hosting ram guide"],
    hreflang: true,
  });
}

export default function HowMuchRamForMinecraftServerPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isEs ? "Cuánta RAM necesita un servidor de Minecraft" : "How much RAM does a Minecraft server need",
    description: isEs
      ? "Guía para estimar RAM según jugadores, tipo de software, plugins y modpacks."
      : "A guide to estimating RAM requirements based on player counts, software type, plugins, and modpacks.",
    url: absoluteUrl("/blog/how-much-ram-for-minecraft-server"),
    author: { "@type": "Organization", name: "Cloudsting" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent2)]">Blog</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Cuánta RAM necesita un servidor de Minecraft" : "How much RAM does a Minecraft server need"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Saber cuánta RAM necesita un servidor de Minecraft es una de las preguntas más comunes antes de contratar hosting. La respuesta depende de jugadores, software, plugins y modpacks, no de un número fijo universal."
              : "Figuring out how much RAM a Minecraft server needs is one of the most common questions before choosing hosting. The answer depends on player counts, software type, plugins, and modpacks rather than one universal number."}
          </p>
          <div className="mt-8 grid gap-4">
            {[isEs
              ? ["No todos los servidores consumen igual", "Un vanilla pequeño con amigos no pide lo mismo que un Paper con plugins o un Forge con modpacks pesados. La RAM necesaria sube cuando el software añade más lógica, más entidades o más datos persistentes."]
              : ["Not every server consumes memory the same way", "A small vanilla server for friends does not behave like a Paper stack with many plugins or a Forge server with heavier modpacks. RAM requirements increase as the software adds more logic, more entities, and more persistent data."],
              isEs
              ? ["La CPU importa junto a la RAM", "Es común pensar que más memoria arregla todo, pero muchos problemas de TPS vienen de CPU o generación de chunks. Si la CPU es floja, subir RAM no solucionará toda la experiencia." ]
              : ["CPU matters alongside RAM", "It is common to assume that more memory fixes everything, but many TPS problems actually come from CPU constraints or chunk generation. If CPU quality is weak, adding RAM alone will not solve the experience."],
              isEs
              ? ["Guía práctica de sizing", "Para proyectos pequeños puedes empezar con menos recursos, pero si prevés crecimiento, conviene dejar margen. Paper con plugins suele necesitar una base razonable. Forge o modpacks pesados piden todavía más atención en memoria y almacenamiento."]
              : ["A practical sizing approach", "Smaller projects can start with fewer resources, but growth needs headroom. Plugin-heavy Paper setups usually need a healthier base. Forge or heavier modpacks demand even more attention around memory and storage."],
              isEs
              ? ["Qué hacer antes de contratar", "Cruza el número estimado de jugadores con el software que vas a usar y con tus expectativas de crecimiento. Después compara hosting que ofrezca upgrades limpios, buenos backups y control suficiente para ajustar el entorno sin fricción."]
              : ["What to do before buying", "Map expected player counts against the software you plan to use and your growth expectations. Then compare hosts that offer clean upgrades, reliable backups, and enough control to adjust the environment without friction." ]].map(([title, body]) => (
              <Card key={title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{body}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Sigue leyendo" : "Keep reading"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link href="/minecraft-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Minecraft server hosting</Link>
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Comparar planes" : "Compare pricing"}</Link>
              <Link href="/forge-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Forge server hosting</Link>
              <Link href="/fabric-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Fabric server hosting</Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}