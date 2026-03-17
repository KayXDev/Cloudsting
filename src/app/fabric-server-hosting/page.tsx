import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Fabric Server Hosting",
    description: "Fabric server hosting for lightweight modded Minecraft setups that still need fast CPU, NVMe storage, backups, and reliable scaling.",
    path: "/fabric-server-hosting",
    keywords: ["fabric server hosting", "minecraft fabric hosting", "fabric mod hosting"],
    hreflang: true,
  });
}

export default function FabricServerHostingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Fabric server hosting</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Fabric suele atraer a administradores que quieren flexibilidad y mods más ligeros sin renunciar a rendimiento. Aun así, sigue necesitando un host con CPU rápida, buen disco y posibilidad de escalar cuando el proyecto deja de ser pequeño."
              : "Fabric often appeals to administrators who want flexible, lighter modded stacks without giving up performance. Even so, it still benefits from fast CPU, strong storage, and a clean scaling path once the project grows beyond the early stage."}
          </p>
          <div className="mt-8 grid gap-4">
            {[isEs
              ? ["Fabric no significa infraestructura irrelevante", "Aunque Fabric pueda ser más ligero que otros stacks, sigue beneficiándose de buena CPU, backups útiles y almacenamiento rápido. Los cuellos de botella siguen existiendo cuando el mundo crece o los jugadores se multiplican."]
              : ["Fabric still benefits from strong infrastructure", "Even if Fabric is often lighter than other stacks, it still benefits from good CPU, useful backups, and fast storage. Bottlenecks still appear once the world grows or concurrency starts increasing."],
              isEs
              ? ["Cuándo tiene más sentido", "Es una buena opción para comunidades que quieren mods sin la complejidad más pesada de otros entornos. También sirve para creadores que buscan tiempos de respuesta ágiles y menos fricción operativa."]
              : ["When it makes the most sense", "It is a strong choice for communities that want mod flexibility without the heavier operational overhead of some other environments. It also fits creators who care about responsiveness and lower day-to-day friction."],
              isEs
              ? ["Qué leer después", "Después de esta landing, lo lógico es revisar Paper, Forge o la guía para elegir hosting según el tipo de servidor que vayas a montar."]
              : ["What to read next", "After this landing, the logical next step is to compare Paper, Forge, or the hosting guide based on the kind of server you plan to run."]].map(([title, body]) => (
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