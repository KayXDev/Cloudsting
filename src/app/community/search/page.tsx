import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { Input } from "@/components/Input";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Community Search",
    description: "Search Cloudsting community content, Minecraft hosting guides, and public resources.",
    path: "/community/search",
    noIndex: true,
  });
}

export default function CommunitySearchPage() {
  const lang = getLanguageFromCookies();
  return (
    <main>
      <Container className="py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "community.search.title")}</h1>
        <p className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "community.search.subtitle")}</p>

        <Card className="mt-8 p-6">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "community.search.keyword")}</div>
          <div className="mt-2">
            <Input placeholder={t(lang, "community.search.placeholder")} />
          </div>
          <div className="mt-3 text-xs text-[color:var(--muted)]">
            {t(lang, "community.search.hint")}
          </div>
        </Card>
      </Container>
    </main>
  );
}
