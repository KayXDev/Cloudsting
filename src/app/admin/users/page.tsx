import { Card } from "@/components/Card";
import { AdminUserRoleControls } from "@/components/AdminUserRoleControls";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

export default async function AdminUsersPage() {
  const lang = getLanguageFromCookies();
  const users = await prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 100 });

  return (
    <Card className="p-6">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-extrabold">{t(lang, "admin.users.title")}</div>
        <div className="text-xs text-[color:var(--muted)]">{t(lang, "admin.users.count").replace("{count}", String(users.length))}</div>
      </div>

      <div className="grid gap-2 text-sm text-[color:var(--muted)]">
        {users.map((u) => (
          <div key={u.id} className="flex flex-col gap-2 rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-3 py-3 md:flex-row md:items-center md:justify-between">
            <div className="min-w-0">
              <div className="truncate font-semibold text-[color:var(--text)]">{u.email}</div>
              <div className="mt-1 text-xs">
                {t(lang, "admin.users.role")} {u.role} • {new Date(u.createdAt).toLocaleString()}
              </div>
            </div>
            <AdminUserRoleControls userId={u.id} currentRole={u.role as any} />
          </div>
        ))}
      </div>
    </Card>
  );
}
