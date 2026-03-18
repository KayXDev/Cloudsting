import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Minecraft Hosting Spain",
    description: "Minecraft hosting in Spain with low-latency delivery for Spanish players, 24/7 uptime, NVMe storage, DDoS protection, and scalable plans.",
    path: "/minecraft-hosting-spain",
    keywords: ["minecraft hosting spain", "minecraft server hosting spain", "spanish minecraft hosting"],
    hreflang: true,
  });
}

export default function MinecraftHostingSpainPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  const sections = isEs
    ? [
        {
          title: "Por que crear una pagina de hosting de Minecraft en Espana",
          body: "No toda busqueda geolocalizada tiene la misma intencion. Quien busca hosting de Minecraft en Espana suele querer dos cosas claras: menor latencia para jugadores espanoles y una propuesta que encaje mejor con idioma, horarios y contexto local. Esta pagina responde a esa intencion sin forzar la home principal.",
        },
        {
          title: "Latencia, soporte y expectativas reales",
          body: "Si tu comunidad juega desde Espana, una infraestructura bien conectada en Europa suele ser suficiente para ofrecer una experiencia consistente. Lo importante no es solo el pais exacto del datacenter, sino la calidad de la red, la CPU, el almacenamiento NVMe y la estabilidad del nodo. A eso se suma que una pagina orientada a Espana puede explicar mejor el valor para ese publico.",
        },
        {
          title: "Cuando esta landing tiene sentido",
          body: "Tiene sentido si quieres captar comunidades espanolas, proyectos educativos, servidores privados entre amigos o comunidades publicas que comparan proveedores desde una busqueda local. Tambien sirve para enlazar internamente desde guias y articulos sin duplicar el mensaje de una landing europea mas amplia.",
        },
        {
          title: "Que debe convencer al usuario",
          body: "La propuesta no deberia basarse en repetir Espana veinte veces. Debe apoyarse en velocidad, panel claro, backups, mitigacion DDoS y capacidad de crecer sin romper el proyecto. Eso convierte mejor y tambien genera mejores senales SEO que una pagina llena de keywords metidas a la fuerza.",
        },
      ]
    : [
        {
          title: "Why publish a Spain-focused Minecraft hosting page",
          body: "Not every geo-targeted query carries the same intent. Someone searching for Minecraft hosting in Spain usually wants two specific things: lower-latency delivery for Spanish players and a hosting offer that feels more relevant in language, support timing, and local fit. This page answers that intent without overloading the homepage.",
        },
        {
          title: "Latency, support, and realistic expectations",
          body: "If your community plays from Spain, well-connected European infrastructure is often enough to deliver a stable experience. The exact country of the datacenter matters less than network quality, CPU performance, NVMe storage, and node stability. A Spain-focused page simply frames that value for a more specific audience.",
        },
        {
          title: "When this landing page makes sense",
          body: "It makes sense if you want to attract Spanish communities, private groups, education-focused servers, or public communities comparing hosts through a local search lens. It also gives you a cleaner internal link target from guides and blog articles without duplicating the broader Europe page.",
        },
        {
          title: "What should actually persuade the visitor",
          body: "The value proposition should not depend on repeating Spain twenty times. It should be anchored in speed, usable panel controls, backups, DDoS mitigation, and the ability to scale without breaking the project. That converts better and sends stronger SEO signals than forced keyword repetition.",
        },
      ];

  const faqItems = isEs
    ? [
        ["Esta pagina esta pensada solo para usuarios de Espana?", "No necesariamente. Tambien sirve para usuarios hispanohablantes o comunidades con base en Espana que quieren una propuesta mas localizada que una landing europea general."],
        ["Es mejor apuntar a Espana que a Europa en toda la web?", "No. Lo correcto es usar la home y las landings generales para intenciones amplias, y reservar paginas como esta para una intencion geografica mas concreta."],
      ]
    : [
        ["Is this page only relevant for users in Spain?", "Not exclusively. It also helps Spanish-speaking users or Spain-based communities who want a more localized angle than a broad Europe landing page."],
        ["Should the whole website target Spain instead of Europe?", "No. The homepage and broader landings should cover wider intent, while pages like this one handle narrower geographic demand."],
      ];

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqItems.map(([question, answer]) => ({
      "@type": "Question",
      name: question,
      acceptedAnswer: { "@type": "Answer", text: answer },
    })),
    url: absoluteUrl("/minecraft-hosting-spain"),
  };

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Hosting de Minecraft en Espana" : "Minecraft hosting in Spain"}
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Landing pensada para captar busquedas como hosting de Minecraft en Espana sin duplicar la propuesta principal de Europa. La idea es responder mejor a una intencion local real y reforzar el cluster SEO del proyecto."
              : "This landing is built to capture searches like Minecraft hosting in Spain without duplicating the broader Europe proposition. The goal is to answer a real local intent and strengthen the wider SEO cluster around Minecraft hosting."}
          </p>

          <div className="mt-8 grid gap-4">
            {sections.map((section) => (
              <Card key={section.title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{section.title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{section.body}</p>
              </Card>
            ))}
          </div>

          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Siguiente paso" : "Recommended next step"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Comparar planes" : "Compare plans"}</Link>
              <Link href="/minecraft-hosting-europe" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Ver landing europea" : "See the Europe landing"}</Link>
              <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Aprender a elegir hosting" : "Learn how to choose hosting"}</Link>
              <Link href="/blog/how-to-create-a-minecraft-server" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Leer como crear un servidor" : "Read how to create a server"}</Link>
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