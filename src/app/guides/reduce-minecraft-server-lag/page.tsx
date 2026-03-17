import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "How To Reduce Minecraft Server Lag",
    description: "A practical guide to reducing Minecraft server lag by tuning hardware expectations, plugins, chunk generation, and world management.",
    path: "/guides/reduce-minecraft-server-lag",
    keywords: ["reduce minecraft server lag", "minecraft lag guide", "minecraft server optimization"],
    hreflang: true,
  });
}

export default function ReduceMinecraftServerLagGuidePage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "Empieza por el cuello de botella correcto",
          body: "El lag no siempre es falta de RAM. A veces viene de CPU saturada, chunks nuevos, granjas mal optimizadas o plugins pesados. Antes de tocar flags o recortar view distance, conviene identificar si el problema es de software, de configuración o de recursos contratados.",
        },
        {
          title: "La generación de chunks es uno de los mayores culpables",
          body: "Cuando muchos jugadores exploran al mismo tiempo, el servidor trabaja mucho más que en un mundo ya precargado. En comunidades públicas, pregenerar mapas, moderar la distancia de simulación y revisar teleport masivos suele tener más impacto que simplemente reiniciar el nodo.",
        },
        {
          title: "Plugins y modpacks deben justificarse",
          body: "Cada plugin o mod añade complejidad, consumo y puntos de fallo. El mejor enfoque no es instalar veinte herramientas y esperar que el host lo resuelva todo. Hay que auditar qué aporta cada pieza, qué listeners crea y qué tareas repetitivas ejecuta. El software innecesario se traduce en TPS peores y debugging más lento.",
        },
        {
          title: "El hosting también pone un límite",
          body: "Cuando ya has limpiado software, ajustado chunks y ordenado backups, el cuello puede ser infraestructura. Un nodo moderno con NVMe, CPU rápida y protección de red consistente no elimina todos los problemas, pero sí crea una base mucho mejor para optimizar. Ahí es donde un proveedor serio marca diferencias reales.",
        },
      ]
    : [
        {
          title: "Start with the right bottleneck",
          body: "Lag is not always caused by insufficient RAM. Sometimes it comes from overloaded CPU, new chunk generation, inefficient farms, or heavy plugins. Before changing flags or cutting view distance, it is worth identifying whether the issue is software, configuration, or resource limits.",
        },
        {
          title: "Chunk generation is one of the biggest causes",
          body: "When multiple players explore at the same time, the server does much more work than it does inside a pre-generated world. For public communities, pre-generating maps, moderating simulation distance, and reviewing mass teleport patterns often matters more than simply restarting the node.",
        },
        {
          title: "Plugins and modpacks need to justify themselves",
          body: "Every plugin or mod adds complexity, load, and new failure points. The best approach is not to install twenty tools and hope the host absorbs the cost. Review what each piece contributes, what listeners it creates, and what recurring jobs it runs. Unnecessary software turns directly into lower TPS and slower debugging.",
        },
        {
          title: "Your host still defines the ceiling",
          body: "Once you have cleaned up software, tuned chunks, and organized backups, the bottleneck may still be infrastructure. A modern node with NVMe storage, fast CPU, and consistent network protection will not solve every issue, but it gives you a much stronger base for optimization. That is where a serious hosting provider creates real separation.",
        },
      ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isEs ? "Cómo reducir lag en un servidor de Minecraft" : "How to reduce Minecraft server lag",
    description: isEs
      ? "Guía práctica para reducir lag revisando chunks, plugins, modpacks, configuración y límites del hosting."
      : "A practical guide to reducing lag by reviewing chunks, plugins, modpacks, configuration, and hosting limits.",
    url: absoluteUrl("/guides/reduce-minecraft-server-lag"),
    author: {
      "@type": "Organization",
      name: "Cloudsting",
    },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent2)]">Guides</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Cómo reducir lag en un servidor de Minecraft" : "How to reduce Minecraft server lag"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "El objetivo no es prometer cero lag, sino explicar qué variables afectan de verdad al rendimiento para que puedas optimizar con criterio."
              : "The goal is not to promise zero lag. It is to explain which variables actually affect performance so you can optimize with better judgment."}
          </p>

          <div className="mt-8 grid gap-4">
            {sections.map((section) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{section.body}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-6 sm:p-8">
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Sigue explorando" : "Keep exploring"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Comparar planes de hosting" : "Compare hosting plans"}
              </Link>
              <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Aprender a elegir hosting" : "Learn how to choose hosting"}
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}