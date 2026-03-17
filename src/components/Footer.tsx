import Link from "next/link";
import { Container } from "@/components/Container";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

export function Footer() {
  const lang = getLanguageFromCookies();

  return (
    <footer className="border-t border-[color:var(--border)] bg-[color:var(--surface0)]/60 backdrop-blur-md">
      <Container className="py-10">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-1">
            <div className="text-sm font-extrabold tracking-wide text-[color:var(--text)]">Cloudsting</div>
            <div className="mt-2 text-xs text-[color:var(--muted)]">
              {t(lang, "footer.tagline")}
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--text)]">{t(lang, "footer.services")}</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/pricing">{t(lang, "footer.minecraftHosting")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/free-minecraft-hosting">{t(lang, "footer.freeMinecraftHosting")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/modded-minecraft-hosting">Modded Minecraft Hosting</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/dashboard">{t(lang, "footer.accountArea")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/status">{t(lang, "footer.serviceStatus")}</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--text)]">{t(lang, "footer.community")}</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/community/forum">{t(lang, "nav.forum")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/community/server-list">{t(lang, "nav.serverList")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/community/search">{t(lang, "nav.search")}</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--text)]">{t(lang, "footer.resources")}</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/features">{t(lang, "footer.features")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/guides">Guides</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/guides/choose-minecraft-hosting">Choose Minecraft Hosting</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/support">{t(lang, "footer.support")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/faq">FAQ</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 text-xs text-[color:var(--muted)]">
          © {new Date().getFullYear()} Cloudsting. {t(lang, "footer.rights")}
        </div>
      </Container>
    </footer>
  );
}
