import Link from "next/link";
import type { Metadata } from "next";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { ReviewComposer } from "@/components/ReviewComposer";
import { createMetadata } from "@/lib/seo";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Hosting Reviews",
    description: "Read and publish Cloudsting hosting reviews covering uptime, support, setup quality, and real customer experience.",
    path: "/community/reviews",
    keywords: ["cloudsting reviews", "minecraft hosting reviews", "hosting feedback"],
    hreflang: true,
  });
}

function stars(rating: number) {
  return "★".repeat(Math.max(0, Math.min(5, rating))) + "☆".repeat(Math.max(0, 5 - rating));
}

export default async function CommunityReviewsPage() {
  const lang = getLanguageFromCookies();

  let user: Awaited<ReturnType<typeof requireUser>> | null = null;
  try {
    user = await requireUser();
  } catch {
    user = null;
  }

  const reviews = await prisma.hostingReview.findMany({
    where: { published: true },
    orderBy: [{ createdAt: "desc" }],
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
    },
  });

  const average = reviews.length > 0 ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length : 0;

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--text)]">{t(lang, "reviews.title")}</h1>
          <p className="mt-4 max-w-3xl text-sm leading-8 text-[color:var(--muted)]">{t(lang, "reviews.subtitle")}</p>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr),360px]">
          <div className="grid gap-4">
            <Card className="p-6">
              <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "reviews.average")}</div>
              <div className="mt-2 text-4xl font-extrabold text-[color:var(--text)]">{reviews.length > 0 ? average.toFixed(1) : "0.0"}</div>
              <div className="mt-2 text-lg text-[#f6c453]">{stars(Math.round(average || 0))}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "reviews.basedOn").replace("{count}", String(reviews.length))}</div>
            </Card>

            {reviews.length === 0 ? (
              <Card className="p-6 text-sm text-[color:var(--muted)]">{t(lang, "reviews.empty")}</Card>
            ) : reviews.map((review) => (
              <Card key={review.id} className="p-6">
                <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-xl font-extrabold text-[color:var(--text)]">{review.title}</div>
                    <div className="mt-2 text-sm text-[#f6c453]">{stars(review.rating)}</div>
                  </div>
                  <div className="text-xs text-[color:var(--muted)]">
                    {(review.user.name && review.user.name.trim()) ? review.user.name : review.user.email.split("@")[0]} • {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="mt-4 whitespace-pre-wrap text-sm leading-8 text-[color:var(--text)]">{review.body}</div>
              </Card>
            ))}
          </div>

          <div className="grid gap-4">
            <Card className="p-6">
              <div className="text-sm font-extrabold text-[color:var(--text)]">{t(lang, "reviews.form.title")}</div>
              {!user ? (
                <div className="mt-4 grid gap-3">
                  <div className="text-sm text-[color:var(--muted)]">{t(lang, "reviews.form.login")}</div>
                  <div className="flex gap-3">
                    <Link href="/login" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">{t(lang, "auth.login")}</Link>
                    <Link href="/register" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold text-[color:var(--text)]">{t(lang, "auth.register")}</Link>
                  </div>
                </div>
              ) : (
                <div className="mt-4">
                  <ReviewComposer />
                </div>
              )}
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}