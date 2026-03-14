import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export default function FaqPage() {
  const lang = getLanguageFromCookies();

  const items = [
    { qKey: "faq.items.deploy.q", aKey: "faq.items.deploy.a" },
    { qKey: "faq.items.backups.q", aKey: "faq.items.backups.a" },
    { qKey: "faq.items.mods.q", aKey: "faq.items.mods.a" },
    { qKey: "faq.items.access.q", aKey: "faq.items.access.a" },
  ];

  return (
    <main>
      <Container className="py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "faq.title")}</h1>
        <div className="mt-10 grid gap-3">
          {items.map((i) => (
            <Card key={i.qKey} className="p-6">
              <div className="text-sm font-extrabold">{t(lang, i.qKey)}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, i.aKey)}</div>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
