import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "How To Choose Minecraft Hosting",
    description: "A practical guide to choosing Minecraft hosting based on CPU, RAM, panel quality, backups, DDoS protection, and future scaling.",
    path: "/guides/choose-minecraft-hosting",
    keywords: ["how to choose minecraft hosting", "minecraft hosting guide", "best minecraft hosting checklist"],
    hreflang: true,
  });
}

export default function ChooseMinecraftHostingGuidePage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "1. No compres solo por RAM",
          body: "Una de las comparaciones más comunes en hosting de Minecraft es cuánta RAM ofrece cada plan. El problema es que la RAM sola no define el rendimiento. Para un servidor con plugins, modpacks o mucha generación de chunks, la CPU y la velocidad del disco importan tanto como la memoria. Si el proveedor ofrece mucha RAM sobre nodos lentos, el TPS caerá igual en horas punta.",
        },
        {
          title: "2. Revisa si el panel ahorra tiempo o crea fricción",
          body: "Cuando administras un servidor, haces tareas repetidas: reiniciar, restaurar backups, mirar logs, cambiar versión, subir archivos o tocar variables de arranque. Un panel pobre convierte tareas simples en soporte manual. Un panel bien resuelto reduce churn y también mejora la percepción del servicio, especialmente en usuarios que todavía no son expertos.",
        },
        {
          title: "3. Backups, mitigación DDoS y soporte no son extras",
          body: "Muchos proyectos pequeños solo valoran el hardware hasta que sufren su primer problema real. Una mala actualización, una corrupción del mundo o un ataque básico cambia por completo la evaluación del proveedor. Si estás comparando opciones, trata backups automáticos, protección DDoS y soporte competente como parte del producto, no como adornos de marketing.",
        },
        {
          title: "4. Piensa en la siguiente etapa, no solo en hoy",
          body: "Un servidor para jugar entre amigos y un servidor para una comunidad abierta no tienen el mismo ciclo de vida. Si crees que vas a escalar, mira facilidad de upgrade, continuidad del panel, flexibilidad del software y si la migración entre planes es limpia. Elegir bien desde el principio evita rehacer IP, archivos y procesos cuando el proyecto empieza a crecer.",
        },
      ]
    : [
        {
          title: "1. Do not buy based on RAM alone",
          body: "One of the most common Minecraft hosting comparisons is how much RAM each plan offers. The problem is that RAM alone does not define performance. For servers with plugins, modpacks, or heavy chunk generation, CPU quality and storage speed matter just as much. If a provider sells large memory allocations on slow nodes, TPS will still collapse during peak load.",
        },
        {
          title: "2. Check whether the panel saves time or creates friction",
          body: "When you manage a server, you repeat the same tasks: restart, restore backups, inspect logs, change versions, upload files, or update startup variables. A poor panel turns simple operations into support tickets. A strong panel reduces friction and improves retention, especially for customers who are not infrastructure experts.",
        },
        {
          title: "3. Backups, DDoS mitigation, and support are core features",
          body: "Small projects often value hardware until they hit a real incident. A bad update, a corrupted world, or a simple attack changes how they judge a host overnight. When comparing providers, treat automated backups, DDoS protection, and competent support as part of the core product rather than decorative marketing extras.",
        },
        {
          title: "4. Choose for your next stage, not just your current size",
          body: "A server for friends and a server for an open community do not share the same lifecycle. If growth is realistic, look at upgrade paths, panel continuity, software flexibility, and how cleanly the host supports scaling. Choosing well early prevents painful rework later when the project starts gaining traction.",
        },
      ];

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isEs ? "Cómo elegir un hosting de Minecraft" : "How to choose Minecraft hosting",
    description: isEs
      ? "Guía práctica para comparar recursos, panel, backups, protección DDoS y soporte al elegir hosting para Minecraft."
      : "A practical guide to comparing resources, panel quality, backups, DDoS protection, and support when choosing Minecraft hosting.",
    url: absoluteUrl("/guides/choose-minecraft-hosting"),
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
            {isEs ? "Cómo elegir un hosting de Minecraft" : "How to choose Minecraft hosting"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Esta guía está pensada para usuarios que comparan proveedores y quieren separar el marketing superficial de las señales que realmente afectan rendimiento, estabilidad y escalabilidad."
              : "This guide is designed for buyers comparing providers and trying to separate shallow marketing claims from the signals that actually affect performance, stability, and growth."}
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
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Siguiente lectura recomendada" : "Recommended next reading"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link href="/modded-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Ver hosting para servidores modded" : "See modded Minecraft hosting"}
              </Link>
              <Link href="/guides/reduce-minecraft-server-lag" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Leer guía para reducir lag" : "Read the server lag guide"}
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}