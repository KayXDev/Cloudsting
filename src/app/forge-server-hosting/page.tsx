import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Forge Server Hosting",
    description: "Forge server hosting with the performance headroom, NVMe storage, backups, and control needed for heavier Minecraft modpacks.",
    path: "/forge-server-hosting",
    keywords: ["forge server hosting", "minecraft forge hosting", "forge modpack hosting"],
    hreflang: true,
  });
}

export default function ForgeServerHostingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Forge server hosting</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Forge requiere más cuidado en recursos, actualizaciones y estabilidad que un servidor vanilla básico. Esta landing está orientada a usuarios que buscan hosting para packs con más carga y más dependencia de CPU, memoria y disco."
              : "Forge requires more care around resources, updates, and stability than a basic vanilla server. This landing is designed for users looking for hosting that can support heavier modded stacks with more demand on CPU, memory, and storage."}
          </p>
          <div className="mt-8 grid gap-4">
            {[isEs
              ? ["Forge y los modpacks castigan mal sizing", "Muchos packs de Forge añaden automatización, generación de estructuras, máquinas y lógica persistente. Eso sube el consumo real del servidor. Si eliges mal, los problemas aparecen en arranque, TPS o guardados."]
              : ["Forge and modpacks punish poor sizing", "Many Forge packs add automation, structures, machine logic, and persistent world activity. That raises real server load. If the host is undersized, the problems show up in boot times, TPS, and save operations."],
              isEs
              ? ["Qué deberías mirar antes del precio", "CPU, NVMe, backups y facilidad para tocar el entorno pesan más aquí que una oferta aparentemente barata. Modded no perdona tan bien las decisiones débiles de infraestructura."]
              : ["What to evaluate before price", "CPU quality, NVMe performance, backups, and environment flexibility matter more here than a superficially cheap offer. Modded hosting does not tolerate weak infrastructure as easily."],
              isEs
              ? ["Siguiente paso", "Si vas a montar Forge serio, revisa también modded Minecraft hosting y la guía sobre cuánto RAM necesita un servidor antes de comprar el plan final."]
              : ["Next step", "If you plan to run serious Forge stacks, also review the modded Minecraft hosting page and the RAM sizing article before selecting your final plan."]].map(([title, body]) => (
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