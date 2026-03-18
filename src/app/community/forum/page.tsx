import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { ensureForumSeeded, formatForumAuthorName } from "@/server/forum";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Community Forum",
    description: "Cloudsting community forum for Minecraft hosting discussions, setup questions, showcase threads, and product announcements.",
    path: "/community/forum",
    keywords: ["minecraft hosting forum", "cloudsting community", "minecraft server discussions"],
  });
}

export default async function CommunityForumPage() {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  let user: Awaited<ReturnType<typeof requireUser>> | null = null;
  try {
    user = await requireUser();
  } catch {
    user = null;
  }

  await ensureForumSeeded();

  const [categories, recentThreads] = await Promise.all([
    prisma.forumCategory.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        _count: { select: { threads: true } },
        threads: {
          orderBy: [{ pinned: "desc" }, { lastPostAt: "desc" }],
          take: 1,
          select: {
            id: true,
            title: true,
            lastPostAt: true,
          },
        },
      },
    }),
    prisma.forumThread.findMany({
      orderBy: [{ pinned: "desc" }, { lastPostAt: "desc" }],
      take: 8,
      select: {
        id: true,
        title: true,
        pinned: true,
        replyCount: true,
        viewCount: true,
        lastPostAt: true,
        category: { select: { name: true } },
        author: { select: { name: true, email: true } },
      },
    }),
  ]);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[340px] bg-[radial-gradient(circle_at_15%_18%,rgba(89,255,168,0.1),transparent_28%),radial-gradient(circle_at_84%_8%,rgba(112,162,255,0.08),transparent_22%),linear-gradient(180deg,rgba(5,7,8,0.98),rgba(5,6,8,0))]" />
      <Container className="relative py-16">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-3 rounded-full border border-[#254331] bg-[#0d1712] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.16em] text-[#8de0b0]">
              <span className="h-2 w-2 rounded-full bg-[#1AD76F]" />
              {isEs ? "Comunidad Cloudsting" : "Cloudsting community"}
            </div>
            <h1 className="mt-5 text-4xl font-extrabold tracking-tight text-white sm:text-5xl">
              {isEs ? "Foro de la comunidad" : "Community forum"}
            </h1>
            <p className="mt-4 text-sm leading-8 text-[#b2bcc1] sm:text-base">
              {isEs
                ? "Un espacio publico para dudas de configuracion, anuncios, ideas de comunidad y conversaciones tecnicas alrededor de hosting para Minecraft. Lectura abierta; publicar y responder requiere cuenta."
                : "A public place for setup questions, announcements, community ideas, and technical conversations around Minecraft hosting. Reading is open; posting and replying requires an account."}
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/community/forum/new" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">
              {user ? (isEs ? "Crear hilo" : "Create thread") : (isEs ? "Entrar para publicar" : "Sign in to post")}
            </Link>
            {!user ? (
              <Link href="/register" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold text-[color:var(--text)]">
                {isEs ? "Crear cuenta" : "Create account"}
              </Link>
            ) : null}
          </div>
        </div>

        <div className="mt-10 grid gap-4 xl:grid-cols-[minmax(0,1fr),360px]">
          <div className="grid gap-4">
            {categories.map((category) => {
              const latestThread = category.threads[0] ?? null;
              return (
                <Link key={category.id} href={`/community/forum/${category.slug}`}>
                  <Card className="p-6 transition hover:border-[color:var(--accent)]/60 hover:bg-[color:var(--surface2)]">
                    <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <h2 className="text-2xl font-extrabold tracking-tight text-[color:var(--text)]">{category.name}</h2>
                        <p className="mt-3 max-w-2xl text-sm leading-7 text-[color:var(--muted)]">{category.description}</p>
                      </div>
                      <div className="grid shrink-0 gap-2 text-left md:min-w-[180px] md:text-right">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                          {category._count.threads} {isEs ? "hilos" : "threads"}
                        </div>
                        <div className="text-sm font-semibold text-[color:var(--accent)]">{isEs ? "Abrir categoria >" : "Open category >"}</div>
                      </div>
                    </div>

                    {latestThread ? (
                      <div className="mt-5 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-4 text-sm">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{isEs ? "Ultimo hilo" : "Latest thread"}</div>
                        <div className="mt-2 font-bold text-[color:var(--text)]">{latestThread.title}</div>
                        <div className="mt-2 text-xs text-[color:var(--muted)]">{new Date(latestThread.lastPostAt).toLocaleString()}</div>
                      </div>
                    ) : null}
                  </Card>
                </Link>
              );
            })}
          </div>

          <div className="grid gap-4">
            <Card className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{isEs ? "Actividad reciente" : "Recent activity"}</div>
              <div className="mt-4 grid gap-3">
                {recentThreads.length === 0 ? (
                  <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-4 text-sm text-[color:var(--muted)]">
                    {isEs ? "Todavia no hay hilos. El primero puede salir hoy." : "There are no threads yet. The first one can go live today."}
                  </div>
                ) : recentThreads.map((thread) => (
                  <Link key={thread.id} href={`/community/forum/thread/${thread.id}`} className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-4 transition hover:border-[color:var(--accent)]/40">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{thread.category.name}</div>
                        <div className="mt-2 truncate text-sm font-bold text-[color:var(--text)]">
                          {thread.pinned ? (isEs ? "Fijado: " : "Pinned: ") : ""}
                          {thread.title}
                        </div>
                      </div>
                      <div className="shrink-0 text-xs text-[color:var(--muted)]">{new Date(thread.lastPostAt).toLocaleDateString()}</div>
                    </div>
                    <div className="mt-3 text-xs text-[color:var(--muted)]">
                      {formatForumAuthorName(thread.author)} • {thread.replyCount} {isEs ? "respuestas" : "replies"} • {thread.viewCount} {isEs ? "vistas" : "views"}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{isEs ? "Normas iniciales" : "Starter rules"}</div>
              <ul className="mt-4 grid gap-2 text-sm leading-7 text-[color:var(--muted)]">
                <li>• {isEs ? "Publica dudas reales, no spam ni autopromocion agresiva." : "Post real questions, not spam or aggressive self-promotion."}</li>
                <li>• {isEs ? "Usa categorias claras para que el foro no se ensucie desde el principio." : "Use the right category so the forum stays clean from day one."}</li>
                <li>• {isEs ? "Los anuncios oficiales y la moderacion quedan reservados al equipo." : "Official announcements and moderation remain reserved for the team."}</li>
              </ul>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
