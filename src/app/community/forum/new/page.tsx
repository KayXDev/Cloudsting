import Link from "next/link";
import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { ForumThreadComposer } from "@/components/ForumThreadComposer";
import { createMetadata } from "@/lib/seo";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { ensureForumSeeded } from "@/server/forum";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Create forum thread",
    description: "Start a new thread in the Cloudsting community forum.",
    path: "/community/forum/new",
    noIndex: true,
  });
}

export default async function NewForumThreadPage(props: { searchParams?: { category?: string } }) {
  const lang = getLanguageFromCookies();
  const isEs = lang === "es";

  let user: Awaited<ReturnType<typeof requireUser>> | null = null;
  try {
    user = await requireUser();
  } catch {
    user = null;
  }

  await ensureForumSeeded();

  const categories = await prisma.forumCategory.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true },
  });

  return (
    <main>
      <Container className="py-16">
        <div className="max-w-3xl">
          <Link href="/community/forum" className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">
            {isEs ? "Volver al foro" : "Back to forum"}
          </Link>
          <h1 className="mt-3 text-4xl font-extrabold tracking-tight text-[color:var(--text)]">{isEs ? "Crear nuevo hilo" : "Create new thread"}</h1>
          <p className="mt-3 text-sm leading-7 text-[color:var(--muted)]">
            {isEs ? "Empieza con una categoria clara y un titulo especifico. Eso mejora las respuestas y evita que el foro se llene de hilos ambiguos desde el principio." : "Start with a clear category and a specific title. That improves reply quality and helps the forum avoid vague threads from the start."}
          </p>
        </div>

        <div className="mt-8 max-w-3xl">
          {!user ? (
            <Card className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{isEs ? "Necesitas cuenta para publicar" : "You need an account to post"}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{isEs ? "La lectura del foro es publica, pero abrir hilos requiere iniciar sesion." : "The forum is public to read, but creating threads requires signing in."}</div>
              <div className="mt-5 flex gap-3">
                <Link href="/login" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">{isEs ? "Entrar" : "Sign in"}</Link>
                <Link href="/register" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold text-[color:var(--text)]">{isEs ? "Crear cuenta" : "Create account"}</Link>
              </div>
            </Card>
          ) : (
            <ForumThreadComposer lang={lang} categories={categories} initialCategorySlug={props.searchParams?.category ?? null} />
          )}
        </div>
      </Container>
    </main>
  );
}