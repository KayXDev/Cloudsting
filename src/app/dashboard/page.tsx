import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { LogoutButton } from "@/components/LogoutButton";
import { t } from "@/lib/i18n";
import { requireUser } from "@/server/auth/session";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function DashboardPage() {
  const lang = getLanguageFromCookies();
  let user: { id: string; email: string; role: "USER" | "ADMIN" };

  try {
    user = await requireUser();
  } catch {
    redirect("/login");
  }

  const servers = await prisma.server.findMany({
    where: { userId: user.id, status: { notIn: ["DELETED", "ERROR"] } },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      status: true,
      memoryMb: true,
      cpuPercent: true,
      diskMb: true,
      planId: true,
    },
  });

  const planIds = Array.from(new Set(servers.map((s) => s.planId).filter(Boolean)));
  const plans = planIds.length
    ? await prisma.plan.findMany({
        where: { id: { in: planIds } },
        select: { id: true, name: true },
      })
    : [];
  const planMap = new Map(plans.map((p) => [p.id, p]));

  return (
    <main>
      <Container className="py-16">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "dashboard.title")}</h1>
            <div className="mt-2 text-sm text-[color:var(--muted)]">
              {t(lang, "dashboard.signedInAs").replace("{email}", user.email)}
            </div>
          </div>
          <div className="flex items-center gap-3">
            {user.role === "ADMIN" ? (
              <Link
                href="/admin"
                className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface1)] px-4 py-2 text-sm font-semibold hover:bg-[color:var(--surface2)]"
              >
                {t(lang, "dashboard.adminPanel")}
              </Link>
            ) : null}
            <LogoutButton />
          </div>
        </div>

        <div className="mt-10 grid gap-4">
          {servers.length === 0 ? (
            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "dashboard.empty.title")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">
                {t(lang, "dashboard.empty.subtitle")}
              </div>
              <div className="mt-6">
                <Link
                  href="/pricing"
                  className="inline-flex rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-semibold text-[color:var(--bg)] hover:brightness-110"
                >
                  {t(lang, "dashboard.empty.cta")}
                </Link>
              </div>
            </Card>
          ) : null}

          {servers.map((s) => (
            <Card key={s.id} className="p-6">
              <div className="grid gap-4 md:grid-cols-4 md:items-center">
                <div className="md:col-span-2">
                  <div className="text-lg font-extrabold">{s.name}</div>
                  <div className="mt-1 text-sm text-[color:var(--muted)]">
                    {t(lang, "dashboard.server.type")}:{" "}
                    <span className="font-semibold text-[color:var(--text)]">
                      {planMap.get(s.planId)?.name ?? t(lang, "common.planUnavailable")}
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-xs uppercase tracking-[0.12em] text-[color:var(--muted)]">{t(lang, "dashboard.server.status")}</div>
                  <div className="mt-1 text-sm font-bold text-[color:var(--accent)]">
                    {(() => {
                      const key = `serverStatus.${s.status}`;
                      const translated = t(lang, key);
                      return translated === key ? s.status : translated;
                    })()}
                  </div>
                </div>

                <div className="text-xs text-[color:var(--muted)]">
                  {t(lang, "dashboard.server.resources")
                    .replace("{ram}", String(s.memoryMb / 1024))
                    .replace("{cpu}", String(s.cpuPercent))
                    .replace("{disk}", String(Math.round(s.diskMb / 1024)))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </main>
  );
}
