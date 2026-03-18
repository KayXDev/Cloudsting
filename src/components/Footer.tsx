import Link from "next/link";
import { Container } from "@/components/Container";
import { getLanguageFromCookies } from "@/server/i18n";
import { t } from "@/lib/i18n";

function PaymentMethodIcon(props: { method: "visa" | "mastercard" | "amex" | "paypal" | "stripe" | "applepay" | "googlepay"; label: string }) {
  const baseClass = "flex h-5 min-w-[40px] items-center justify-center px-0.5 text-[color:var(--text)] opacity-80 transition duration-200 hover:-translate-y-0.5 hover:opacity-100";

  if (props.method === "visa") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <span className="-skew-x-[10deg] text-[0.78rem] font-black uppercase tracking-[-0.08em] text-[#2A63F6]">VISA</span>
      </div>
    );
  }

  if (props.method === "mastercard") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <svg viewBox="0 0 64 24" className="h-3 w-auto" aria-hidden="true">
          <circle cx="26" cy="12" r="7" fill="#EA001B" />
          <circle cx="38" cy="12" r="7" fill="#F79E1B" />
          <path fill="#FF5F00" d="M32 5.9a8.5 8.5 0 0 0 0 12.2 8.5 8.5 0 0 0 0-12.2Z" />
        </svg>
      </div>
    );
  }

  if (props.method === "amex") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <div className="rounded-[2px] bg-[#2E77BC] px-1 py-[1px] leading-none text-white">
          <div className="text-[0.5rem] font-black tracking-[-0.08em]">AM</div>
          <div className="-mt-0.5 text-[0.5rem] font-black tracking-[-0.08em]">EX</div>
        </div>
      </div>
    );
  }

  if (props.method === "paypal") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <div className="flex items-end gap-0.5 italic leading-none tracking-[-0.08em]">
          <span className="text-[0.78rem] font-black text-[#003087]">Pay</span>
          <span className="text-[0.78rem] font-black text-[#009CDE]">Pal</span>
        </div>
      </div>
    );
  }

  if (props.method === "stripe") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <span className="text-[0.78rem] font-black lowercase tracking-[-0.08em] text-[#635BFF]">stripe</span>
      </div>
    );
  }

  if (props.method === "applepay") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <div className="flex items-center gap-1 leading-none text-[#F5F7FA]">
          <svg viewBox="0 0 20 24" className="h-3 w-3" fill="currentColor" aria-hidden="true">
            <path d="M16.7 12.7c0-3 2.5-4.5 2.6-4.6-1.4-2.1-3.6-2.4-4.4-2.4-1.9-.2-3.7 1.1-4.7 1.1-1 0-2.5-1-4-1-2.1 0-4 1.2-5.1 3.1-2.2 3.8-.6 9.4 1.6 12.3 1.1 1.4 2.3 3 3.9 2.9 1.5-.1 2.1-.9 4-.9s2.4.9 4 .9c1.7 0 2.8-1.5 3.8-2.9 1.2-1.7 1.7-3.4 1.7-3.5 0-.1-3.3-1.2-3.3-5Zm-3-8.8c.8-1 1.4-2.3 1.2-3.7-1.2.1-2.6.8-3.4 1.8-.8.9-1.5 2.2-1.3 3.6 1.3.1 2.6-.7 3.5-1.7Z" />
          </svg>
          <span className="text-[0.78rem] font-semibold tracking-[-0.08em]">Pay</span>
        </div>
      </div>
    );
  }

  if (props.method === "googlepay") {
    return (
      <div className={baseClass} aria-label={props.label} title={props.label}>
        <div className="flex items-center gap-1 leading-none">
          <svg viewBox="0 0 20 20" className="h-3 w-3" aria-hidden="true">
            <path fill="#4285F4" d="M19.6 10.2c0-.7-.1-1.3-.2-1.9H10v3.6h5.4a4.6 4.6 0 0 1-2 3.1v2.5h3.3c1.9-1.8 2.9-4.3 2.9-7.3Z" />
            <path fill="#34A853" d="M10 20c2.7 0 5-.9 6.7-2.5l-3.3-2.5c-.9.6-2.1 1-3.4 1-2.9 0-5.3-1.9-6.2-4.6H.4V14A10 10 0 0 0 10 20Z" />
            <path fill="#FBBC05" d="M3.8 11.4A6 6 0 0 1 3.5 10c0-.5.1-1 .3-1.4V6H.4A10 10 0 0 0 0 10c0 1.4.3 2.8.9 4l2.9-2.6Z" />
            <path fill="#EA4335" d="M10 4c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 .4 6l3.4 2.6C4.7 5.9 7.1 4 10 4Z" />
          </svg>
          <span className="text-[0.78rem] font-semibold tracking-[-0.08em] text-[#E8EAED]">Pay</span>
        </div>
      </div>
    );
  }

  return null;
}

const PAYMENT_METHODS: Array<{
  method: "visa" | "mastercard" | "amex" | "paypal" | "stripe" | "applepay" | "googlepay";
  label: string;
}> = [
  { method: "stripe", label: "Stripe" },
  { method: "paypal", label: "PayPal" },
  { method: "visa", label: "Visa" },
  { method: "mastercard", label: "Mastercard" },
  { method: "amex", label: "American Express" },
  { method: "applepay", label: "Apple Pay" },
  { method: "googlepay", label: "Google Pay" },
];

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
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/minecraft-server-hosting">Minecraft Server Hosting</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/minecraft-hosting-europe">Minecraft Hosting Europe</Link>
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
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/community/reviews">{t(lang, "nav.reviews")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/community/server-list">{t(lang, "nav.serverList")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/community/search">{t(lang, "nav.search")}</Link>
            </div>
          </div>

          <div>
            <div className="text-xs font-bold uppercase tracking-[0.1em] text-[color:var(--text)]">{t(lang, "footer.resources")}</div>
            <div className="mt-3 grid gap-2 text-sm">
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/features">{t(lang, "footer.features")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/blog">Blog</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/guides">Guides</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/guides/choose-minecraft-hosting">Choose Minecraft Hosting</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/support">{t(lang, "footer.support")}</Link>
              <Link className="text-[color:var(--muted)] hover:text-[color:var(--text)]" href="/faq">FAQ</Link>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-[color:var(--border)] pt-6 text-center">
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color:var(--text)]">{t(lang, "footer.paymentMethods")}</div>
          <div className="mt-2 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 md:gap-x-3">
            {PAYMENT_METHODS.map((method) => (
              <PaymentMethodIcon
                key={method.method}
                method={method.method}
                label={method.label}
              />
            ))}
          </div>
        </div>

        <div className="mt-8 text-center text-xs text-[color:var(--muted)]">
          © {new Date().getFullYear()} Cloudsting. {t(lang, "footer.rights")}
        </div>
      </Container>
    </footer>
  );
}
