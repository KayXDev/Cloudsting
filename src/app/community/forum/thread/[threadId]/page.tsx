import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { ForumReplyForm } from "@/components/ForumReplyForm";
import { ForumThreadAdminControls } from "@/components/ForumThreadAdminControls";
import { createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { formatForumAuthorName, forumThreadIsLocked } from "@/server/forum";
import { getLanguageFromCookies } from "@/server/i18n";

export async function generateMetadata(props: { params: { threadId: string } }): Promise<Metadata> {
  const thread = await prisma.forumThread.findUnique({
    where: { id: props.params.threadId },
    select: { title: true },
  });

  if (!thread) {
    return createMetadata({
      title: "Forum thread",
      description: "Forum thread page not found.",
      path: `/community/forum/thread/${props.params.threadId}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: thread.title,
    description: `Forum discussion on ${thread.title}`,
    path: `/community/forum/thread/${props.params.threadId}`,
  });
}

export default async function ForumThreadPage(props: { params: { threadId: string } }) {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  let user: Awaited<ReturnType<typeof requireUser>> | null = null;
  try {
    user = await requireUser();
  } catch {
    user = null;
  }

  const thread = await prisma.forumThread.findUnique({
    where: { id: props.params.threadId },
    include: {
      category: { select: { slug: true, name: true } },
      author: { select: { name: true, email: true } },
      posts: {
        orderBy: { createdAt: "asc" },
        include: {
          author: { select: { name: true, email: true, role: true } },
        },
      },
    },
  });

  if (!thread) notFound();

  await prisma.forumThread.update({
    where: { id: thread.id },
    data: { viewCount: { increment: 1 } },
  }).catch(() => null);

  const locked = forumThreadIsLocked(thread.status);

  return (
    <main>
      <Container className="py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <Link href={`/community/forum/${thread.category.slug}`} className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {isEs ? "Foro /" : "Forum /"} {thread.category.name}
            </Link>
            <div className="mt-3 flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
              {thread.pinned ? <span className="rounded-full border border-[color:var(--accent)]/40 px-2 py-1 text-[color:var(--accent)]">{isEs ? "Fijado" : "Pinned"}</span> : null}
              {locked ? <span className="rounded-full border border-[#8d5f2e] px-2 py-1 text-[#f6c275]">{isEs ? "Cerrado" : "Locked"}</span> : null}
            </div>
            <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[color:var(--text)]">{thread.title}</h1>
            <p className="mt-3 text-sm text-[color:var(--muted)]">
              {isEs ? "Abierto por" : "Started by"} {formatForumAuthorName(thread.author)} • {new Date(thread.createdAt).toLocaleString()} • {thread.viewCount + 1} {isEs ? "vistas" : "views"}
            </p>
          </div>

          {user?.role === "ADMIN" ? <ForumThreadAdminControls threadId={thread.id} pinned={thread.pinned} locked={locked} lang={lang} /> : null}
        </div>

        <div className="mt-8 grid gap-3">
          {thread.posts.map((post, index) => {
            const isStaff = post.author.role === "ADMIN";
            return (
              <Card key={post.id} className="p-6">
                <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <div className="text-sm font-extrabold text-[color:var(--text)]">
                      {formatForumAuthorName(post.author)}
                      {isStaff ? <span className="ml-2 rounded-full border border-[color:var(--accent)]/40 px-2 py-1 text-[10px] uppercase tracking-[0.12em] text-[color:var(--accent)]">{isEs ? "Staff" : "Staff"}</span> : null}
                    </div>
                    <div className="mt-1 text-xs text-[color:var(--muted)]">#{index + 1} • {new Date(post.createdAt).toLocaleString()}</div>
                  </div>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[color:var(--text)]">{post.body}</div>
              </Card>
            );
          })}
        </div>

        <div className="mt-8">
          {!user ? (
            <Card className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{isEs ? "Necesitas iniciar sesion para responder" : "You need to sign in to reply"}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">
                {isEs ? "La lectura es publica, pero las respuestas quedan reservadas a usuarios registrados para mantener un minimo de control." : "Reading is public, but replies are limited to registered users so the forum stays manageable."}
              </div>
              <div className="mt-5 flex gap-3">
                <Link href="/login" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">{isEs ? "Entrar" : "Sign in"}</Link>
                <Link href="/register" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold text-[color:var(--text)]">{isEs ? "Crear cuenta" : "Create account"}</Link>
              </div>
            </Card>
          ) : locked ? (
            <Card className="p-6 text-sm text-[color:var(--muted)]">
              {isEs ? "Este hilo esta cerrado. Puedes leerlo, pero ya no acepta nuevas respuestas." : "This thread is locked. You can still read it, but it no longer accepts new replies."}
            </Card>
          ) : (
            <Card className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{isEs ? "Responder al hilo" : "Reply to thread"}</div>
              <div className="mt-5">
                <ForumReplyForm threadId={thread.id} lang={lang} />
              </div>
            </Card>
          )}
        </div>
      </Container>
    </main>
  );
}