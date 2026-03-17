import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Community Forum",
    description: "Cloudsting community forum for Minecraft hosting discussions, setup ideas, and knowledge sharing.",
    path: "/community/forum",
    noIndex: true,
  });
}

export default function CommunityForumPage() {
  const lang = getLanguageFromCookies();
  return (
    <main>
      <Container className="py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "community.forum.title")}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">
          {t(lang, "community.forum.subtitle")}
        </p>

        <Card className="mt-8 p-6">
          <div className="text-sm font-bold">{t(lang, "community.forum.soonTitle")}</div>
          <div className="mt-2 text-sm text-[color:var(--muted)]">
            {t(lang, "community.forum.soonSubtitle")}
          </div>
        </Card>
      </Container>
    </main>
  );
}
