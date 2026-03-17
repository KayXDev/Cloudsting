import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "How To Back Up A Minecraft Server",
    description: "Learn how to back up a Minecraft server properly, reduce world data loss, and build a safer recovery workflow.",
    path: "/blog/how-to-back-up-a-minecraft-server",
    keywords: ["how to back up a minecraft server", "minecraft server backup", "backup minecraft world"],
    hreflang: true,
  });
}

export default function HowToBackUpAMinecraftServerPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isEs ? "Cómo hacer backups de un servidor de Minecraft" : "How to back up a Minecraft server",
    description: isEs
      ? "Buenas prácticas para proteger mundos de Minecraft y recuperar rápido tras errores o corrupción."
      : "Best practices for protecting Minecraft worlds and recovering quickly after errors or corruption.",
    url: absoluteUrl("/blog/how-to-back-up-a-minecraft-server"),
    author: { "@type": "Organization", name: "Cloudsting" },
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent2)]">Blog</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Cómo hacer backups de un servidor de Minecraft" : "How to back up a Minecraft server"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Aprender cómo hacer backups de un servidor de Minecraft es básico si quieres reducir pérdidas de mundos, errores de actualización y tiempos muertos. No basta con tener una copia aislada; necesitas una estrategia de recuperación coherente."
              : "Learning how to back up a Minecraft server properly is essential if you want to reduce world loss, update failures, and downtime. One isolated copy is not enough; you need a recovery strategy you can trust."}
          </p>
          <div className="mt-8 grid gap-4">
            {[isEs
              ? ["Haz backups antes de tocar nada importante", "Cualquier cambio de versión, instalación de plugin o ajuste fuerte del mundo merece una copia previa. Ese hábito evita que una decisión pequeña termine en una pérdida grande."]
              : ["Back up before major changes", "Any version change, plugin install, or meaningful world adjustment deserves a backup first. That habit prevents small decisions from turning into major data loss."],
              isEs
              ? ["Automatizar ayuda, pero probar la restauración es obligatorio", "Un backup que nunca has restaurado es una promesa, no una garantía. La recuperación real depende de que el proceso esté probado y documentado, no de que un panel muestre una etiqueta bonita."]
              : ["Automation helps, but restore testing is mandatory", "A backup you have never restored is a promise rather than a guarantee. Real recovery depends on a tested process, not on a control panel label alone."],
              isEs
              ? ["Combina backups con buena infraestructura", "Si además tienes un panel usable, almacenamiento rápido y una ruta clara de soporte, la recuperación será más limpia. La calidad del hosting influye directamente en cómo de rápido puedes volver a estar online."]
              : ["Pair backups with better infrastructure", "If you also have a usable panel, fast storage, and a clear support path, recovery becomes much cleaner. Hosting quality directly affects how quickly you can get back online."],
              isEs
              ? ["Qué leer después", "Después de esta guía, conviene revisar hosting general para Minecraft y la guía para elegir proveedor si todavía estás comparando opciones."]
              : ["What to read next", "After this guide, it makes sense to review general Minecraft hosting and the provider selection guide if you are still comparing options."]].map(([title, body]) => (
              <Card key={title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{body}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-8 p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <Link href="/minecraft-server-hosting" className="text-sm font-bold text-[color:var(--accent)]">Minecraft server hosting</Link>
              <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">How to choose Minecraft hosting</Link>
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Ver planes" : "View pricing"}</Link>
              <Link href="/blog/how-much-ram-for-minecraft-server" className="text-sm font-bold text-[color:var(--accent)]">How much RAM for a Minecraft server</Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}