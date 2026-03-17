import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Europe",
    description: "European Minecraft hosting with low latency for EU players, NVMe storage, backups, and infrastructure designed for stable multiplayer servers.",
    path: "/minecraft-hosting-europe",
    keywords: ["minecraft hosting europe", "eu minecraft hosting", "minecraft server hosting europe"],
    hreflang: true,
  });
}

export default function MinecraftHostingEuropePage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const faqItems = isEs
    ? [
        ["¿Por qué elegir hosting de Minecraft en Europa?", "Para jugadores europeos, alojar en Europa suele reducir latencia, mejorar la sensación en combate y hacer más estable la experiencia multijugador. También puede simplificar horarios de soporte y expectativas regulatorias para proyectos con base en la UE."],
        ["¿El hosting europeo mejora siempre el rendimiento?", "Mejora sobre todo la parte de latencia para usuarios cercanos, pero el rendimiento total sigue dependiendo de CPU, disco, configuración del servidor y software usado. Una buena ubicación ayuda, pero no sustituye una infraestructura bien dimensionada."],
        ["¿Qué tipo de servidores se benefician más?", "Comunidades con base en España, Francia, Alemania, Países Bajos u otros países europeos suelen notar ventaja. También proyectos competitivos o con jugadores concurrentes sensibles al ping."],
      ]
    : [
        ["Why choose Minecraft hosting in Europe?", "For European players, hosting in Europe usually lowers latency, improves responsiveness during gameplay, and creates a more consistent multiplayer experience. It can also align better with support expectations and regional operational needs."],
        ["Does European hosting always improve performance?", "It mostly improves latency for nearby players, but total performance still depends on CPU quality, storage speed, server settings, and software choice. Good location helps, but it does not replace well-sized infrastructure."],
        ["Which servers benefit the most?", "Communities based in Spain, France, Germany, the Netherlands, or nearby European regions usually see the clearest advantage. Competitive or higher-concurrency servers tend to feel the difference fastest."],
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
    url: absoluteUrl("/minecraft-hosting-europe"),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Hosting de Minecraft en Europa" : "Minecraft hosting in Europe"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Esta página ataca búsquedas geolocalizadas para usuarios que priorizan baja latencia en Europa. La keyword principal aparece en título, descripción, H1 y apertura para dejar clara la intención de la página."
              : "This page targets geo-specific searches from users who care about low latency for European players. The main keyword is reflected in the title, description, H1, and opening copy to make the page intent clear."}
          </p>

          <div className="mt-8 grid gap-4">
            {[isEs
              ? {
                  title: "Baja latencia para jugadores europeos",
                  body: "La ubicación del servidor importa cuando la comunidad está concentrada en Europa. Un mejor ping ayuda a que el movimiento, el combate y las interacciones en tiempo real se sientan más consistentes. Esto no solo afecta PvP; también mejora la experiencia general de servidores cooperativos y comunidades activas con varios jugadores simultáneos.",
                }
              : {
                  title: "Lower latency for European players",
                  body: "Server location matters when your community is concentrated in Europe. Better ping improves responsiveness in movement, combat, and real-time interactions. This is not only relevant for PvP; it also improves the feel of cooperative servers and active communities with multiple concurrent players.",
                },
              isEs
              ? {
                  title: "Infraestructura y operación siguen siendo clave",
                  body: "La localización europea ayuda, pero el resultado final depende igualmente de la calidad del nodo. CPU moderna, NVMe, control del panel y backups siguen siendo los factores que separan un servicio estable de uno que falla cuando el proyecto empieza a crecer.",
                }
              : {
                  title: "Infrastructure quality still matters",
                  body: "European location helps, but the final experience still depends on node quality. Modern CPU, NVMe storage, control panel usability, and backups are the factors that separate a stable service from one that breaks down as the project grows.",
                },
              isEs
              ? {
                  title: "Cuándo tiene más sentido esta opción",
                  body: "Si la mayoría de tus jugadores está en España, Francia, Alemania, Países Bajos o regiones cercanas, esta landing responde mejor a tu caso que una página genérica de hosting. También es útil para proyectos que quieren comunicar una orientación clara hacia el mercado europeo.",
                }
              : {
                  title: "When this option makes the most sense",
                  body: "If most of your players are in Spain, France, Germany, the Netherlands, or nearby regions, this page answers your use case better than a generic hosting page. It is also useful for projects that want a clear Europe-focused positioning.",
                }].map((section) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{section.body}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Enlaces recomendados" : "Recommended links"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Comparar planes" : "Compare plans"}</Link>
              <Link href="/minecraft-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Minecraft server hosting</Link>
              <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">How to choose Minecraft hosting</Link>
              <Link href="/blog/how-much-ram-for-minecraft-server" className="text-sm font-bold text-[color:var(--accent)]">How much RAM for a Minecraft server</Link>
            </div>
          </Card>

          <div className="mt-8 grid gap-4">
            {faqItems.map(([question, answer]) => (
              <Card key={question} className="p-6">
                <h2 className="text-xl font-extrabold tracking-tight">{question}</h2>
                <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">{answer}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}