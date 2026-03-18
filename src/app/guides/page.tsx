import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { getGuides } from "@/lib/guides";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Guides",
    description: "Read practical Cloudsting guides about choosing Minecraft hosting, reducing lag, planning resources, and scaling your server.",
    path: "/guides",
    keywords: ["minecraft hosting guide", "minecraft server guide", "how to choose minecraft hosting"],
    hreflang: true,
  });
}

export default function GuidesPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const guides = getGuides(lang);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_14%_12%,rgba(89,255,168,0.12),transparent_30%),radial-gradient(circle_at_84%_6%,rgba(127,162,220,0.08),transparent_20%),linear-gradient(180deg,rgba(6,7,8,0.96),rgba(6,6,6,0))]" />
      <Container className="relative py-16">
        <div className="mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-3 rounded-full border border-[#24422f] bg-[#0c1712] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8fe2b2]">
            <span className="h-2 w-2 rounded-full bg-[#1AD76F]" />
            {isEs ? "Guides hub" : "Guides hub"}
          </div>
          <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
            {isEs ? "Guías de hosting para Minecraft" : "Minecraft hosting guides"}
          </h1>
          <p className="mx-auto mt-5 max-w-3xl text-sm leading-8 text-[#b5c0c6] sm:text-base">
            {isEs
              ? "Este hub concentra contenido informativo pensado para usuarios que todavía están comparando proveedores, dimensionando recursos o intentando optimizar un servidor. Sirve como capa SEO informacional y también como ayuda real para clientes potenciales."
              : "This hub gathers informational content for users who are still comparing providers, planning resources, or trying to optimize a Minecraft server. It works as informational SEO content and as genuinely useful material for potential customers."}
          </p>
        </div>

        <div className="mx-auto mt-10 grid max-w-4xl gap-3">
          {guides.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="group rounded-[24px] border border-[#2d3338] bg-[linear-gradient(145deg,rgba(17,19,19,0.96),rgba(10,11,12,0.96))] px-6 py-6 shadow-[0_12px_26px_rgba(0,0,0,0.2)] transition hover:border-[#41674f] hover:bg-[linear-gradient(145deg,rgba(18,23,20,0.98),rgba(10,12,12,0.98))]"
            >
              <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
                <div className="min-w-0">
                  <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#87a6bb]">{guide.category}</div>
                  <h2 className="mt-2 text-2xl font-extrabold tracking-tight text-white">{guide.title}</h2>
                  <p className="mt-3 max-w-3xl text-sm leading-7 text-[#afbbc2]">{guide.description}</p>
                </div>
                <div className="flex shrink-0 items-center gap-4 text-sm font-semibold text-[#9cc0ff]">
                  <span className="text-xs uppercase tracking-[0.12em] text-[#778692]">{guide.readTime}</span>
                  <span className="transition group-hover:translate-x-1">{isEs ? "Abrir guia >" : "Open guide >"}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        <div className="mx-auto mt-10 max-w-4xl border-t border-[#23282c] pt-6 text-sm leading-8 text-[#9eabb2]">
          {isEs
            ? "Guias pensadas para explicar mejor hosting, rendimiento y decisiones tecnicas sin convertir cada pagina en una landing exagerada."
            : "Guides designed to explain hosting, performance, and technical tradeoffs more clearly without turning every page into an oversized landing page."}
        </div>
      </Container>
    </main>
  );
}