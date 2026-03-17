import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Modded Minecraft Hosting",
    description: "Learn what modded Minecraft hosting needs in terms of RAM, CPU, NVMe storage, backups, and panel flexibility for Forge and Fabric servers.",
    path: "/modded-minecraft-hosting",
    keywords: ["modded minecraft hosting", "forge hosting", "fabric hosting", "minecraft modpack hosting"],
    hreflang: true,
  });
}

export default function ModdedMinecraftHostingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "Los servidores modded castigan errores de sizing",
          body: "En vanilla puedes tolerar decisiones mediocres durante más tiempo. En modded no tanto. Forge, Fabric y los packs pesados tienden a multiplicar carga de arranque, consumo de RAM, operaciones de disco y sensibilidad a la CPU. Por eso una página pensada para modded debe explicar recursos y no quedarse en slogans genéricos.",
        },
        {
          title: "RAM, CPU y NVMe trabajan juntos",
          body: "Un modpack con mucha automatización o exploración masiva puede disparar tanto uso de memoria como operaciones de lectura y escritura. Si el host falla en CPU o disco, añadir solo más RAM no arregla el problema. La mejor base para modded combina frecuencia de CPU alta, NVMe estable y espacio suficiente para backups y archivos del pack.",
        },
        {
          title: "Necesitas un panel flexible y backups rápidos",
          body: "Los servidores modded cambian más: actualizaciones de pack, pruebas, reinicios, restauraciones y ajustes de Java. Un panel cómodo y una política clara de backups reducen errores humanos y aceleran la recuperación. Eso importa tanto para administradores experimentados como para creadores que no quieren convertirse en técnicos a tiempo completo.",
        },
      ]
    : [
        {
          title: "Modded servers punish sizing mistakes",
          body: "In vanilla, mediocre infrastructure decisions can survive longer. In modded, they do not. Forge, Fabric, and heavier packs multiply startup load, memory pressure, storage activity, and CPU sensitivity. That is why a page targeting modded hosting needs to explain resources clearly instead of relying on generic marketing promises.",
        },
        {
          title: "RAM, CPU, and NVMe work together",
          body: "A modpack with heavy automation or large exploration patterns can increase both memory use and storage operations. If the host is weak on CPU or disk, adding more RAM alone does not fix the problem. The best base for modded communities combines strong CPU frequency, stable NVMe performance, and enough room for backups and pack files.",
        },
        {
          title: "You need a flexible panel and fast backups",
          body: "Modded servers change more often: pack updates, test builds, restarts, restores, and Java tuning. A practical control panel and a clear backup strategy reduce human error and speed up recovery. That matters both for experienced administrators and for creators who do not want to become full-time infrastructure operators.",
        },
      ];

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Hosting para Minecraft modded" : "Modded Minecraft hosting"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Esta landing está orientada a búsquedas con intención comercial alta relacionadas con modpacks, Forge y Fabric. La idea es explicar por qué el dimensionamiento correcto importa más aquí que en vanilla."
              : "This landing page targets high-intent searches around modpacks, Forge, and Fabric. Its role is to explain why correct infrastructure sizing matters even more here than it does for vanilla servers."}
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
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Recursos relacionados" : "Related resources"}</h2>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Ver planes" : "View plans"}
              </Link>
              <Link href="/guides/reduce-minecraft-server-lag" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Reducir lag en un servidor" : "Reduce server lag"}
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}