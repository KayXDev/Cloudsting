import Link from "next/link";
import { Card } from "@/components/Card";
import { AdminTicketStatusControls } from "@/components/AdminTicketStatusControls";
import { SupportTicketReplyForm } from "@/components/SupportTicketReplyForm";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { getLanguageFromCookies } from "@/server/i18n";

function ticketTone(status: string) {
  if (status === "CLOSED") return "text-gray-300";
  if (status === "STAFF_REPLIED") return "text-[color:var(--accent)]";
  if (status === "CUSTOMER_REPLIED") return "text-[#ffd166]";
  return "text-[#8af4c4]";
}

export default async function AdminSupportPage(props: { searchParams?: { ticket?: string } }) {
  const lang = getLanguageFromCookies();
  const tickets = await prisma.supportTicket.findMany({
    orderBy: [{ status: "asc" }, { lastReplyAt: "desc" }],
    take: 100,
    include: {
      user: { select: { email: true } },
      _count: { select: { messages: true } },
    },
  });

  const selectedId = props.searchParams?.ticket ?? tickets[0]?.id ?? null;
  const selectedTicket = selectedId
    ? await prisma.supportTicket.findUnique({
        where: { id: selectedId },
        include: {
          user: { select: { email: true } },
          messages: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { email: true, role: true } } },
          },
        },
      })
    : null;

  const openCount = tickets.filter((ticket) => ticket.status !== "CLOSED").length;

  return (
    <div className="grid gap-4 xl:grid-cols-[360px,minmax(0,1fr)]">
      <Card className="p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="text-sm font-extrabold">{t(lang, "admin.support.title")}</div>
            <div className="mt-1 text-xs text-[color:var(--muted)]">
              {t(lang, "admin.support.summary").replace("{open}", String(openCount)).replace("{total}", String(tickets.length))}
            </div>
          </div>
        </div>

        <div className="grid gap-2">
          {tickets.map((ticket) => (
            <Link
              key={ticket.id}
              href={`/admin/support?ticket=${ticket.id}`}
              className={`rounded-xl border px-4 py-3 transition ${selectedTicket?.id === ticket.id ? "border-[color:var(--accent)] bg-[color:var(--surface2)]" : "border-[color:var(--border)] bg-[color:var(--surface1)] hover:bg-[color:var(--surface2)]"}`}
            >
              <div className="truncate text-sm font-bold text-[color:var(--text)]">{ticket.subject}</div>
              <div className="mt-1 text-xs text-[color:var(--muted)]">{ticket.user.email}</div>
              <div className={`mt-2 text-xs font-semibold ${ticketTone(ticket.status)}`}>{t(lang, `support.status.${ticket.status.toLowerCase()}`)}</div>
              <div className="mt-2 text-xs text-[color:var(--muted)]">
                {ticket._count.messages} {t(lang, "support.messagesCount")} • {new Date(ticket.lastReplyAt).toLocaleString()}
              </div>
            </Link>
          ))}
        </div>
      </Card>

      <Card className="p-6">
        {selectedTicket ? (
          <>
            <div className="flex flex-col gap-4 border-b border-[color:var(--border)] pb-4 md:flex-row md:items-start md:justify-between">
              <div>
                <div className="text-xl font-extrabold text-[color:var(--text)]">{selectedTicket.subject}</div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">{selectedTicket.user.email}</div>
                <div className={`mt-2 text-xs font-semibold ${ticketTone(selectedTicket.status)}`}>{t(lang, `support.status.${selectedTicket.status.toLowerCase()}`)}</div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <AdminTicketStatusControls
                  ticketId={selectedTicket.id}
                  status={selectedTicket.status as any}
                  reopenLabel={t(lang, "admin.support.reopen")}
                  closeLabel={t(lang, "admin.support.close")}
                />
              </div>
            </div>

            <div className="mt-5 grid gap-3">
              {selectedTicket.messages.map((message) => {
                const isAdmin = message.authorRole === "ADMIN";
                return (
                  <div
                    key={message.id}
                    className={`rounded-2xl border px-4 py-3 ${isAdmin ? "border-[color:var(--accent)]/40 bg-[rgba(89,255,168,0.08)]" : "border-[color:var(--border)] bg-[color:var(--surface2)]"}`}
                  >
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <div className="font-bold text-[color:var(--text)]">{message.author.email}</div>
                      <div className="text-[color:var(--muted)]">{new Date(message.createdAt).toLocaleString()}</div>
                    </div>
                    <div className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--text)]">{message.body}</div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 border-t border-[color:var(--border)] pt-5">
              <SupportTicketReplyForm
                action={`/api/admin/tickets/${selectedTicket.id}/messages`}
                placeholder={t(lang, "admin.support.replyPlaceholder")}
                submitLabel={t(lang, "admin.support.reply")}
              />
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-8 text-center text-sm text-[color:var(--muted)]">
            {t(lang, "admin.support.empty")}
          </div>
        )}
      </Card>
    </div>
  );
}