import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Free Minecraft Hosting",
    description: "Understand when free Minecraft hosting is enough, what limits to expect, and when it makes sense to move to a paid plan.",
    path: "/free-minecraft-hosting",
    keywords: ["free minecraft hosting", "best free minecraft hosting", "minecraft hosting free plan"],
    hreflang: true,
  });
}

export default function FreeMinecraftHostingPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "Cuándo el hosting gratis sí tiene sentido",
          body: "El hosting gratis de Minecraft es útil para aprender, probar plugins, jugar con amigos o validar una idea antes de gastar. También es un buen punto de entrada para usuarios que todavía no saben si su proyecto va a durar o crecer. El error está en esperar la misma estabilidad, soporte o margen de recursos que ofrece una infraestructura premium.",
        },
        {
          title: "Los límites normales de un plan gratis",
          body: "Un plan gratuito suele implicar límites en RAM, CPU, almacenamiento, copias de seguridad o prioridad del nodo. No es necesariamente malo si el caso de uso es pequeño, pero conviene ser claro con la expectativa. Si el servidor empieza a tener más jugadores, plugins exigentes o necesidad de uptime consistente, lo normal es que el plan gratuito se quede corto.",
        },
        {
          title: "Cómo escalar sin romper el proyecto",
          body: "La transición ideal es pasar de un entorno gratuito a un plan de pago sin cambiar de panel, estructura ni hábitos de gestión. Por eso conviene elegir una plataforma que no te obligue a reaprender todo cuando das el salto. En esa fase, más que pagar por pagar, lo importante es comprar continuidad, soporte y margen técnico real.",
        },
      ]
    : [
        {
          title: "When free Minecraft hosting makes sense",
          body: "Free Minecraft hosting is useful for learning, testing plugins, playing with friends, or validating an idea before spending money. It is also a good entry point for users who do not yet know whether their project will last or grow. The mistake is expecting the same stability, support, or performance headroom as a premium stack.",
        },
        {
          title: "The usual limits of a free plan",
          body: "A free plan normally means limits around RAM, CPU, storage, backups, or node priority. That is not inherently bad for a very small use case, but expectations need to be realistic. Once player counts increase, plugin load grows, or uptime becomes important, free hosting usually becomes the bottleneck.",
        },
        {
          title: "How to scale without breaking the project",
          body: "The ideal path is moving from a free environment to a paid plan without changing your workflow, panel, or management habits. That is why it helps to choose a platform that does not force you to relearn everything later. At that point, the real value is continuity, support, and technical headroom rather than simply paying for the sake of it.",
        },
      ];

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Hosting gratis de Minecraft" : "Free Minecraft hosting"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Esta página está orientada a usuarios que buscan un punto de entrada económico o gratuito. La idea es responder esa intención sin vender humo sobre los límites reales del producto."
              : "This page is designed for users looking for a lower-cost or free entry point. The goal is to answer that intent honestly without hiding the practical limits of a free plan."}
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
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Si el proyecto empieza a crecer" : "If the project starts growing"}</h2>
            <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">
              {isEs
                ? "Cuando el servidor deja de ser una prueba y empieza a ser comunidad, toca priorizar estabilidad, backups y recursos previsibles."
                : "When the server stops being a test and starts becoming a real community, stability, backups, and predictable resources matter more than headline pricing."}
            </p>
            <div className="mt-5 flex flex-wrap gap-4">
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Comparar planes premium" : "Compare premium plans"}
              </Link>
              <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">
                {isEs ? "Aprender a elegir mejor" : "Learn how to choose better"}
              </Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}