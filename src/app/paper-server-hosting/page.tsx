import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Paper Server Hosting",
    description: "Paper server hosting for Minecraft communities that want optimized performance, plugin flexibility, backups, and scalable infrastructure.",
    path: "/paper-server-hosting",
    keywords: ["paper server hosting", "minecraft paper hosting", "paper minecraft server"],
    hreflang: true,
  });
}

export default function PaperServerHostingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Paper server hosting</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Paper es uno de los entornos más comunes para comunidades que quieren plugins y rendimiento mejorado. Esta landing ayuda a captar búsquedas específicas de usuarios que ya saben qué software van a usar y están más cerca de convertir."
              : "Paper is one of the most common environments for communities that want plugin flexibility and improved performance. This landing targets more specific searches from users who already know the software they plan to run and are closer to converting."}
          </p>
          <div className="mt-8 grid gap-4">
            {[isEs
              ? ["Paper y optimización van de la mano", "Muchas comunidades eligen Paper porque ofrece una base más optimizable para servidores públicos y privados. Aun así, el host sigue siendo importante: una mala CPU o almacenamiento lento limitan lo que Paper puede aprovechar."]
              : ["Paper and optimization go together", "Many communities choose Paper because it provides a more tunable base for public and private servers. Even so, the host still matters: weak CPU or slow storage limits what Paper can actually deliver."],
              isEs
              ? ["Plugins, backups y gestión", "Paper suele convivir con ecosistemas de plugins más amplios, lo que hace todavía más importante contar con backups y un panel cómodo para logs, reinicios y ajustes. El tiempo ahorrado en operación acaba pesando tanto como el rendimiento bruto."]
              : ["Plugins, backups, and management", "Paper often sits alongside larger plugin ecosystems, which makes backups and control panel quality even more important for logs, restarts, and tuning. Operational time saved can matter as much as raw performance."],
              isEs
              ? ["Relación con otras páginas del cluster", "Esta página enlaza naturalmente con pricing, hosting general de Minecraft y la guía sobre RAM. Esa conexión ayuda a cubrir mejor intenciones tanto comerciales como informativas dentro del mismo tema." ]
              : ["How this fits the wider cluster", "This page naturally connects with pricing, general Minecraft hosting, and the RAM guide. That relationship helps cover both commercial and informational intent within the same topic." ]].map(([title, body]) => (
              <Card key={title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{body}</p>
              </Card>
            ))}
          </div>
        </div>
      </Container>
    </main>
  );
}