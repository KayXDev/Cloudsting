import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { absoluteUrl, createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "How To Create A Minecraft Server",
    description: "Learn how to create a Minecraft server, choose the right software, plan resources, and avoid common setup mistakes before launch.",
    path: "/blog/how-to-create-a-minecraft-server",
    keywords: ["how to create a minecraft server", "create minecraft server", "start minecraft server"],
    hreflang: true,
  });
}

export default function HowToCreateAMinecraftServerPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: isEs ? "Como crear un servidor de Minecraft" : "How to create a Minecraft server",
    description: isEs
      ? "Articulo para usuarios que estan empezando y quieren montar un servidor con mejores decisiones desde el principio."
      : "An introductory article for users who are starting from scratch and want to make better server decisions from day one.",
    url: absoluteUrl("/blog/how-to-create-a-minecraft-server"),
    author: { "@type": "Organization", name: "Cloudsting" },
  };

  const sections = isEs
    ? [
        ["Empieza por el objetivo del servidor", "Antes de pensar en plugins o mods, define el caso de uso: jugar con amigos, abrir una comunidad publica, montar un servidor modded o probar una idea pequeña. Esa decision cambia la RAM, la CPU, el software y hasta el tipo de soporte que realmente necesitas."],
        ["Elige bien el software", "No es lo mismo un servidor vanilla que un Paper con plugins o un Forge/Fabric con modpacks. Crear un servidor de Minecraft bien montado empieza por elegir la base adecuada, porque luego todo lo demas depende de esa capa: rendimiento, compatibilidad y mantenimiento."],
        ["No subestimes panel, backups y upgrades", "Mucha gente piensa que crear un servidor es solo arrancarlo una vez. En realidad, lo importante viene despues: reinicios, cambios de version, copias, restauracion y capacidad de ampliar recursos sin rehacer el proyecto. Por eso el panel y los backups pesan tanto como la RAM."],
        ["Lanza pequeno, pero con margen", "Puedes empezar con algo sencillo, pero conviene dejar espacio para crecer. Si el proyecto funciona, querras escalar sin migraciones dolorosas. Elegir una plataforma con upgrades claros, buen almacenamiento y proteccion de red te evita rehacer decisiones demasiado pronto."],
      ]
    : [
        ["Start with the server goal", "Before you think about plugins or mods, define the use case: playing with friends, launching a public community, running a modded stack, or testing a small project. That decision changes the RAM, CPU, software choice, and even the level of support you actually need."],
        ["Choose the right software stack", "A vanilla server is not the same as a Paper server with plugins or a Forge/Fabric server with heavier modpacks. Creating a Minecraft server properly starts with choosing the right base layer, because performance, compatibility, and maintenance all depend on it."],
        ["Do not underestimate panel quality, backups, and upgrades", "Many people think creating a server is only about getting it online once. In reality, the important work starts after launch: restarts, version changes, backups, restores, and scaling resources without rebuilding the project. That is why panel quality and backup workflows matter as much as RAM."],
        ["Launch small, but leave room to grow", "You can start with a smaller setup, but you should still leave enough headroom to scale. If the project works, you will want smoother upgrades rather than painful migrations. Choosing a platform with clean upgrades, strong storage, and reliable network protection saves you from redoing core decisions too early."],
      ];

  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <div className="text-sm font-semibold uppercase tracking-[0.14em] text-[color:var(--accent2)]">Blog</div>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight sm:text-5xl">
            {isEs ? "Como crear un servidor de Minecraft" : "How to create a Minecraft server"}
          </h1>
          <p className="mt-4 text-sm leading-7 text-[color:var(--muted)] sm:text-base">
            {isEs
              ? "Crear un servidor de Minecraft no empieza por comprar el plan mas grande, sino por entender que software vas a usar, cuantos jugadores esperas y que margen necesitas para crecer sin rehacerlo todo despues."
              : "Creating a Minecraft server does not start with buying the biggest plan. It starts with understanding which software you want, how many players you expect, and how much headroom you need to grow without rebuilding everything later."}
          </p>
          <div className="mt-8 grid gap-4">
            {sections.map(([title, body]) => (
              <Card key={title} className="p-6 sm:p-8">
                <h2 className="text-2xl font-extrabold tracking-tight">{title}</h2>
                <p className="mt-4 text-sm leading-8 text-[color:var(--muted)] sm:text-base">{body}</p>
              </Card>
            ))}
          </div>
          <Card className="mt-8 p-6">
            <h2 className="text-2xl font-extrabold tracking-tight">{isEs ? "Que leer despues" : "What to read next"}</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <Link href="/pricing" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Ver planes" : "View pricing"}</Link>
              <Link href="/minecraft-hosting-spain" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Ver hosting en Espana" : "See hosting in Spain"}</Link>
              <Link href="/guides/choose-minecraft-hosting" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Aprender a elegir hosting" : "Learn how to choose hosting"}</Link>
              <Link href="/blog/how-much-ram-for-minecraft-server" className="text-sm font-bold text-[color:var(--accent)]">{isEs ? "Calcular RAM del servidor" : "Calculate server RAM"}</Link>
            </div>
          </Card>
        </div>
      </Container>
    </main>
  );
}