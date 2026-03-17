import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { LogoutButton } from "@/components/LogoutButton";
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
    select: { id: true, email: true, name: true, role: true },
  });

  if (!user) redirect("/login");

  const username = user.email.split("@")[0] ?? "user";

  return (
    <main>
      <Container className="py-16">
        <div className="mx-auto max-w-3xl">
          <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "profile.title")}</h1>
          <p className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "profile.subtitle")}</p>

          <div className="mt-8 grid gap-4">
            <Card className="p-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.user")}</div>
                  <div className="mt-1 text-lg font-extrabold text-[color:var(--text)]">{user.name || username}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.email")}</div>
                  <div className="mt-1 text-lg font-extrabold text-[color:var(--text)]">{user.email}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.role")}</div>
                  <div className="mt-1 text-lg font-extrabold text-[color:var(--accent)]">{user.role}</div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-[0.08em] text-[color:var(--muted)]">{t(lang, "profile.accountId")}</div>
                  <div className="mt-1 truncate text-sm font-semibold text-[color:var(--text)]">{user.id}</div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="mb-4 text-sm font-extrabold">{t(lang, "profile.edit")}</div>
              <ProfileSettingsForm initialName={user.name || ""} initialEmail={user.email} />
            </Card>

            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "profile.session")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "profile.sessionHint")}</div>
              <div className="mt-5">
                <LogoutButton />
              </div>
            </Card>
          </div>
        </div>
      </Container>
    </main>
  );
}
