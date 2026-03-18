import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { ProfileSettingsForm } from "@/components/ProfileSettingsForm";
import { createMetadata } from "@/lib/seo";
import { t } from "@/lib/i18n";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export function generateMetadata(): Metadata {
  return createMetadata({
    title: "Profile",
    description: "Manage your Cloudsting account profile, session settings, and account details.",
    path: "/profile",
    noIndex: true,
  });
}

export default async function ProfilePage() {
  const lang = getLanguageFromCookies();
  let sessionUser: { id: string; email: string; role: "USER" | "ADMIN"; name?: string | null };

  try {
    sessionUser = await requireUser();
  } catch {
    redirect("/login");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: { id: true, email: true, name: true, role: true, createdAt: true, updatedAt: true, walletBalanceCents: true, pterodactylUserId: true },
  });

  if (!user) redirect("/login");

  const username = user.email.split("@")[0] ?? "user";
  const [serversCount, ordersCount, ticketsCount] = await prisma.$transaction([
    prisma.server.count({ where: { userId: user.id, status: { not: "DELETED" } } }),
    prisma.order.count({ where: { userId: user.id } }),
    prisma.supportTicket.count({ where: { userId: user.id } }),
  ]);
  const moneyFmt = new Intl.NumberFormat(lang === "es" ? "es-ES" : "en-US", {
    style: "currency",
    currency: "USD",
  });
  const joinedAt = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", { dateStyle: "medium" }).format(user.createdAt);
  const updatedAt = new Intl.DateTimeFormat(lang === "es" ? "es-ES" : "en-US", { dateStyle: "medium" }).format(user.updatedAt);

  return (
    <main className="relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-[radial-gradient(circle_at_20%_10%,rgba(89,255,168,0.18),transparent_28%),radial-gradient(circle_at_78%_12%,rgba(64,160,120,0.12),transparent_22%),linear-gradient(180deg,rgba(7,10,9,0.98),rgba(7,10,9,0))]" />
      <Container className="relative py-16">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-6 xl:grid-cols-[340px,minmax(0,1fr)]">
            <Card className="overflow-hidden border-[#274032] bg-[linear-gradient(180deg,rgba(18,27,22,0.96),rgba(8,11,10,0.96))] p-0">
              <div className="border-b border-[#203127] px-6 py-8">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl border border-[#2f5140] bg-[#112017] text-[#7fe0aa]">
                  <svg viewBox="0 0 20 20" className="h-8 w-8" fill="none" aria-hidden="true">
                    <circle cx="10" cy="6.5" r="2.8" stroke="currentColor" strokeWidth="1.6" />
                    <path d="M4 16C4 13.5 6.2 11.5 9 11.5H11C13.8 11.5 16 13.5 16 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="mt-5 text-[11px] font-bold uppercase tracking-[0.16em] text-[#7fe0aa]">{t(lang, "profile.title")}</div>
                <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white">{user.name || username}</h1>
                <p className="mt-2 text-sm text-[#a6b0ab]">{user.email}</p>
                <div className="mt-5 inline-flex rounded-full border border-[#315442] bg-[#112017] px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-[#7fe0aa]">
                  {user.role}
                </div>
              </div>

              <div className="grid gap-4 px-6 py-6 text-sm text-[#c8d0cc]">
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f8a84]">{t(lang, "profile.accountId")}</div>
                  <div className="mt-2 break-all font-semibold text-white">{user.id}</div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-[#203127] bg-[#0d1411] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f8a84]">{t(lang, "profile.joined")}</div>
                    <div className="mt-2 font-semibold text-white">{joinedAt}</div>
                  </div>
                  <div className="rounded-2xl border border-[#203127] bg-[#0d1411] p-4">
                    <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f8a84]">{t(lang, "profile.updated")}</div>
                    <div className="mt-2 font-semibold text-white">{updatedAt}</div>
                  </div>
                </div>
                <div className="rounded-2xl border border-[#203127] bg-[#0d1411] p-4">
                  <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f8a84]">{t(lang, "profile.wallet")}</div>
                  <div className="mt-2 text-xl font-extrabold text-white">{moneyFmt.format((user.walletBalanceCents ?? 0) / 100)}</div>
                  <div className="mt-2 text-xs text-[#7f8a84]">{user.pterodactylUserId ? t(lang, "profile.panelLinked") : t(lang, "profile.panelNotLinked")}</div>
                </div>
              </div>
            </Card>

            <div className="grid gap-6">
              <Card className="border-[#22342a] bg-[rgba(9,13,11,0.92)] p-6">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7fe0aa]">{t(lang, "profile.overview")}</div>
                    <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-white">{t(lang, "profile.subtitle")}</h2>
                  </div>
                  <p className="max-w-xl text-sm leading-7 text-[#97a39d]">
                    {t(lang, "profile.overviewHint")}
                  </p>
                </div>

                <div className="mt-6 grid gap-4 md:grid-cols-3">
                  {[
                    { label: t(lang, "profile.stats.servers"), value: String(serversCount) },
                    { label: t(lang, "profile.stats.orders"), value: String(ordersCount) },
                    { label: t(lang, "profile.stats.tickets"), value: String(ticketsCount) },
                  ].map((item) => (
                    <div key={item.label} className="rounded-[24px] border border-[#22342a] bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-[#7f8a84]">{item.label}</div>
                      <div className="mt-3 text-3xl font-extrabold tracking-tight text-white">{item.value}</div>
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="border-[#22342a] bg-[rgba(9,13,11,0.92)] p-6">
                <div className="mb-6 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
                  <div>
                    <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#7fe0aa]">{t(lang, "profile.edit")}</div>
                    <div className="mt-2 text-sm text-[#97a39d]">{t(lang, "profile.editHint")}</div>
                  </div>
                </div>
                <ProfileSettingsForm initialName={user.name || ""} initialEmail={user.email} />
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </main>
  );
}
