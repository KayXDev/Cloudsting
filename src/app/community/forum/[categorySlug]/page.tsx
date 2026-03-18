import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { ensureForumSeeded, formatForumAuthorName } from "@/server/forum";
import { getLanguageFromCookies } from "@/server/i18n";

export async function generateMetadata(props: { params: { categorySlug: string } }): Promise<Metadata> {
  const category = await prisma.forumCategory.findUnique({
    where: { slug: props.params.categorySlug },
    select: { name: true, description: true },
  });

  if (!category) {
    return createMetadata({
      title: "Forum category",
      description: "Forum category page not found.",
      path: `/community/forum/${props.params.categorySlug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${category.name} Forum`,
    description: category.description,
    path: `/community/forum/${props.params.categorySlug}`,
  });
}

export default async function ForumCategoryPage(props: { params: { categorySlug: string } }) {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  await ensureForumSeeded();

  const category = await prisma.forumCategory.findUnique({
    where: { slug: props.params.categorySlug },
    include: {
      threads: {
        orderBy: [{ pinned: "desc" }, { lastPostAt: "desc" }],
        take: 50,
        select: {
          id: true,
          title: true,
          pinned: true,
          status: true,
          replyCount: true,
          viewCount: true,
          lastPostAt: true,
          createdAt: true,
          author: { select: { name: true, email: true } },
          posts: {
            orderBy: { createdAt: "desc" },
            take: 1,
            select: {
              author: { select: { name: true, email: true } },
            },
          },
        },
      },
      _count: { select: { threads: true } },
    },
  });

  if (!category) notFound();

  return (
    <main>
      <Container className="py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <Link href="/community/forum" className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {isEs ? "Foro / Categorias" : "Forum / Categories"}
            </Link>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[color:var(--text)]">{category.name}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--muted)]">{category.description}</p>
          </div>
          <Link href={`/community/forum/new?category=${category.slug}`} className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">
            {isEs ? "Crear hilo" : "Create thread"}
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-3 text-sm text-[color:var(--muted)]">
          {category._count.threads} {isEs ? "hilos en esta categoria" : "threads in this category"}
        </div>

        <div className="mt-6 grid gap-3">
          {category.threads.length === 0 ? (
            <Card className="p-6 text-sm text-[color:var(--muted)]">
              {isEs ? "Todavia no hay hilos aqui. Crea el primero y marca el tono de la categoria." : "There are no threads here yet. Create the first one and set the tone for the category."}
            </Card>
          ) : category.threads.map((thread) => {
            const latestPost = thread.posts[0] ?? null;
            return (
              <Link key={thread.id} href={`/community/forum/thread/${thread.id}`}>
                <Card className="p-5 transition hover:border-[color:var(--accent)]/50 hover:bg-[color:var(--surface2)]">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
                        {thread.pinned ? <span className="rounded-full border border-[color:var(--accent)]/40 px-2 py-1 text-[color:var(--accent)]">{isEs ? "Fijado" : "Pinned"}</span> : null}
                        {thread.status === "LOCKED" ? <span className="rounded-full border border-[#8d5f2e] px-2 py-1 text-[#f6c275]">{isEs ? "Cerrado" : "Locked"}</span> : null}
                      </div>
                      <h2 className="mt-3 text-xl font-extrabold tracking-tight text-[color:var(--text)]">{thread.title}</h2>
                      <div className="mt-3 text-sm text-[color:var(--muted)]">
                        {isEs ? "Creado por" : "Started by"} {formatForumAuthorName(thread.author)} • {new Date(thread.createdAt).toLocaleString()}
                      </div>
                    </div>

                    <div className="grid gap-2 text-sm text-[color:var(--muted)] lg:min-w-[230px] lg:text-right">
                      <div>{thread.replyCount} {isEs ? "respuestas" : "replies"}</div>
                      <div>{thread.viewCount} {isEs ? "vistas" : "views"}</div>
                      <div>{isEs ? "Ultima actividad" : "Latest activity"}: {new Date(thread.lastPostAt).toLocaleString()}</div>
                      {latestPost ? <div className="text-xs">{isEs ? "por" : "by"} {formatForumAuthorName(latestPost.author)}</div> : null}
                    </div>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      </Container>
    </main>
  );
}