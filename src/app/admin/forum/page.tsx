import Link from "next/link";
import { Card } from "@/components/Card";
import { AdminForumPostActions } from "@/components/AdminForumPostActions";
import { ForumThreadAdminControls } from "@/components/ForumThreadAdminControls";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { formatForumAuthorName } from "@/server/forum";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminForumPage(props: { searchParams?: { thread?: string } }) {
  const lang = getLanguageFromCookies();

  const threads = await prisma.forumThread.findMany({
    orderBy: [{ pinned: "desc" }, { lastPostAt: "desc" }],
    take: 100,
    select: {
      id: true,
      title: true,
      pinned: true,
      status: true,
      lastPostAt: true,
      replyCount: true,
      category: { select: { name: true } },
      author: { select: { name: true, email: true } },
      _count: { select: { posts: true } },
    },
  });

  const selectedId = props.searchParams?.thread ?? threads[0]?.id ?? null;
  const selectedThread = selectedId
    ? await prisma.forumThread.findUnique({
        where: { id: selectedId },
        include: {
          category: { select: { slug: true, name: true } },
          author: { select: { name: true, email: true } },
          posts: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { name: true, email: true, role: true } } },
          },
        },
      })
    : null;

  const totalPosts = threads.reduce((sum, thread) => sum + thread._count.posts, 0);

  return (
    <div className="grid gap-4 xl:grid-cols-[360px,minmax(0,1fr)]">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <div className="text-sm font-extrabold">{t(lang, "admin.forum.title")}</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              {t(lang, "admin.forum.summary").replace("{threads}", String(threads.length)).replace("{posts}", String(totalPosts))}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {threads.length === 0 ? (
            <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-4 text-sm text-[color:var(--muted)]">
              {t(lang, "admin.forum.noThreads")}
            </div>
          ) : threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/admin/forum?thread=${thread.id}`}
              className={`rounded-xl border px-4 py-3 transition ${selectedThread?.id === thread.id ? "border-[color:var(--accent)] bg-[color:var(--surface2)]" : "border-[color:var(--border)] bg-[color:var(--surface1)] hover:bg-[color:var(--surface2)]"}`}
            >
              <div className="truncate text-sm font-bold text-[color:var(--text)]">{thread.title}</div>
              <div className="mt-1 text-xs text-[color:var(--muted)]">{thread.category.name} • {formatForumAuthorName(thread.author)}</div>
              <div className="mt-2 text-xs text-[color:var(--muted)]">{thread._count.posts} posts • {thread.replyCount} replies • {new Date(thread.lastPostAt).toLocaleString()}</div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        {selectedThread ? (
          <>
            <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xl font-extrabold text-[color:var(--text)]">{selectedThread.title}</div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">{selectedThread.category.name} • {formatForumAuthorName(selectedThread.author)}</div>
                <div className="mt-2 flex flex-wrap gap-2 text-xs text-[color:var(--muted)]">
                  <span>{selectedThread.posts.length} posts</span>
                  <span>{selectedThread.replyCount} replies</span>
                  <span>{new Date(selectedThread.lastPostAt).toLocaleString()}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Link href={`/community/forum/thread/${selectedThread.id}`} className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold text-[color:var(--text)]">
                  {t(lang, "admin.forum.openPublic")}
                </Link>
                <ForumThreadAdminControls threadId={selectedThread.id} pinned={selectedThread.pinned} locked={selectedThread.status === "LOCKED"} lang={lang} />
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              {selectedThread.posts.map((post, index) => {
                const isStaff = post.author.role === "ADMIN";
                return (
                  <div key={post.id} className={`rounded-2xl border px-4 py-4 ${isStaff ? "border-[color:var(--accent)]/40 bg-[rgba(89,255,168,0.08)]" : "border-[color:var(--border)] bg-[color:var(--surface2)]"}`}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="font-bold text-[color:var(--text)]">#{index + 1} • {formatForumAuthorName(post.author)}</div>
                      <div className="text-[color:var(--muted)]">{new Date(post.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-3 whitespace-pre-wrap text-sm leading-8 text-[color:var(--text)]">{post.body}</div>
                    <AdminForumPostActions postId={post.id} threadId={selectedThread.id} initialBody={post.body} deletesThread={index === 0} />
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-8 text-center text-sm text-[color:var(--muted)]">
            {t(lang, "admin.forum.empty")}
          </div>
        )}
      </Card>
    </div>
  );
}