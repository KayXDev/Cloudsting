import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Server Hosting",
    description: "Professional Minecraft server hosting with fast deployment, NVMe storage, backups, DDoS protection, and flexible scaling for growing communities.",
    path: "/minecraft-server-hosting",
    keywords: ["minecraft server hosting", "best minecraft hosting", "professional minecraft hosting"],
    hreflang: true,
  });
}

export default function MinecraftServerHostingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "Qué define un buen hosting para servidores de Minecraft",
          body: "Un buen hosting para Minecraft no se resume en vender RAM. Si el nodo tiene CPU floja, disco lento o mala red, la experiencia se resentirá igual. Lo importante es la combinación entre frecuencia de CPU, NVMe, panel usable, backups y una ruta clara para crecer sin rehacer el proyecto cuando llegan más jugadores.",
        },
        {
          title: "Infraestructura pensada para comunidades reales",
          body: "Cuando una comunidad empieza a moverse de verdad, aparecen las necesidades serias: reinicios rápidos, logs accesibles, restauración de mundos, upgrades sin fricción y estabilidad durante horas punta. Un proveedor orientado a Minecraft debe pensar en ese ciclo de vida completo, no solo en el momento del checkout.",
        },
        {
          title: "Soporte, seguridad y recuperación cuentan tanto como el rendimiento",
          body: "Muchos administradores valoran solo la potencia hasta que sufren el primer problema real. Una mala actualización, un plugin roto o una corrupción de datos cambian por completo la experiencia. Backups, mitigación DDoS y soporte competente reducen el impacto de esos fallos y hacen que el servicio sea mucho más defendible a largo plazo.",
        },
        {
          title: "Cómo elegir si todavía estás comparando opciones",
          body: "Si aún no sabes qué plan o proveedor encaja contigo, empieza por el tipo de servidor que vas a montar: vanilla, Paper, Forge, Fabric o modpacks más pesados. Después cruza eso con jugadores estimados, presupuesto y necesidad de uptime. Ese enfoque es mucho más útil que comparar tablas de recursos sin contexto.",
        },
      ]
    : [
        {
          title: "What defines strong Minecraft server hosting",
          body: "Strong Minecraft hosting is not just about selling more RAM. If the node runs on weak CPU, slow storage, or poor networking, the player experience will still degrade. What matters is the combination of CPU frequency, NVMe performance, usable controls, backups, and a realistic scaling path as your community grows.",
        },
        {
          title: "Infrastructure built for real communities",
          body: "Once a server starts gaining traction, the serious needs appear quickly: fast restarts, usable logs, world recovery, clean upgrades, and stable performance during peak hours. A provider focused on Minecraft should be designed for that entire lifecycle rather than the checkout moment alone.",
        },
        {
          title: "Support, security, and recovery matter as much as raw speed",
          body: "Many administrators only value performance until they hit the first real incident. A broken plugin, a failed update, or corrupted data changes how a provider is judged overnight. Backups, DDoS mitigation, and competent support reduce the blast radius and make the service much more reliable over time.",
        },
        {
          title: "How to choose when you are still comparing hosts",
          body: "If you are still evaluating options, start with the software stack you plan to run: vanilla, Paper, Forge, Fabric, or heavier modpacks. Then map that to expected player counts, budget, and uptime needs. That gives you a much better buying framework than comparing resource tables without context.",
        },
      ];

  const faqItems = isEs
    ? [
        ["¿Qué es el hosting para servidores de Minecraft?", "Es un servicio pensado para alojar mundos multijugador con recursos, panel y herramientas adaptadas a software como vanilla, Paper, Forge o Fabric. La diferencia real está en la calidad del nodo, la red, la facilidad de gestión y la capacidad de recuperación."],
        ["¿Cuánta RAM necesito para un servidor de Minecraft?", "Depende del número de jugadores, el software y los plugins o mods. Un servidor pequeño puede funcionar con poca memoria, pero comunidades activas, Paper cargado o modpacks necesitan más margen y mejor CPU para mantener TPS estables."],
        ["¿Es mejor elegir un proveedor especializado en Minecraft?", "Normalmente sí, porque entiende mejor el ciclo de vida del producto: panel, backups, reinicios, soporte y sizing por tipo de software. Un proveedor generalista puede servir, pero suele exigir más trabajo técnico por parte del cliente."],
      ]
    : [
        ["What is Minecraft server hosting?", "It is infrastructure designed to run multiplayer Minecraft worlds with resources, control tooling, and support aligned with vanilla, Paper, Forge, or Fabric use cases. The real difference comes from node quality, networking, usability, and recovery options."],
        ["How much RAM do I need for a Minecraft server?", "It depends on player counts, software choice, and how heavily you rely on plugins or mods. Small servers can run on limited memory, but active communities, plugin-heavy Paper stacks, or modpacks need more headroom and stronger CPU."],
        ["Is it better to choose a provider specialized in Minecraft?", "Usually yes, because a specialist understands the hosting lifecycle better: control panel quality, backups, fast restarts, support expectations, and how different server types behave under load."],
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: {
        "@type": "Answer",
        text: answer,
      },
    })),
    url: absoluteUrl("/minecraft-server-hosting"),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Hosting para servidores de Minecraft" : "Minecraft server hosting"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Esta es la landing principal del cluster comercial de Cloudsting. Su función es captar búsquedas amplias como hosting para servidores de Minecraft y conducir al usuario hacia pricing, tipos de software y guías comparativas."
              : "This is the main commercial landing page in the Cloudsting cluster. Its job is to capture broad searches around Minecraft server hosting and route visitors toward pricing, software-specific pages, and comparison guides."}
          </p>

          <div className="mt-8 grid gap-4">
            {sections.map((section) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{section.body}</p>
              </Card>
            ))}
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Sigue por software" : "Continue by software type"}</h2>
              <div className="mt-5 grid gap-3">
                <Link href="/paper-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Paper server hosting</Link>
                <Link href="/forge-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Forge server hosting</Link>
                <Link href="/fabric-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Fabric server hosting</Link>
              </div>
            </Card>
            <Card className="p-6">
              <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Aprende antes de comprar" : "Learn before you buy"}</h2>
              <div className="mt-5 grid gap-3">
                <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">How to choose Minecraft hosting</Link>
                <Link href="/blog/how-much-ram-for-minecraft-server" className="text-sm font-bold text-[color:var(--accent)]">How much RAM for a Minecraft server</Link>
                <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Ver planes" : "View pricing"}</Link>
              </div>
            </Card>
          </div>

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