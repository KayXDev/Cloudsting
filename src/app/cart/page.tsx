import type { Metadata } from "next";
import { Container } from "@/components/Container";
import { CartPageClient } from "@/components/CartPageClient";
import { createMetadata } from "@/lib/seo";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Shopping cart",
    description: "Review the hosting plans you want to buy next and continue to checkout.",
    path: "/cart",
    noIndex: true,
  });
}

export default function CartPage() {
  const lang = getLanguageFromCookies();
  return (
    <main>
      <Container className="py-16">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-[color:var(--text)]">{t(lang, "cart.title")}</h1>
          <p className="mt-4 text-sm leading-8 text-[color:var(--muted)]">{t(lang, "cart.subtitle")}</p>
        </div>
        <div className="mt-8">
          <CartPageClient />
        </div>
      </Container>
    </main>
  );
}