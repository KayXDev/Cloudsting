import Link from "next/link";
import { Container } from "@/components/Container";
import { Card } from "@/components/Card";
import { SupportTicketComposer } from "@/components/SupportTicketComposer";
import { SupportTicketReplyForm } from "@/components/SupportTicketReplyForm";
import { t } from "@/lib/i18n";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { getLanguageFromCookies } from "@/server/i18n";

function ticketTone(status: string) {
  if (status === "CLOSED") return "text-gray-300";
  if (status === "STAFF_REPLIED") return "text-[color:var(--accent)]";
  if (status === "CUSTOMER_REPLIED") return "text-[#ffd166]";
  return "text-[#8af4c4]";
}

export default async function SupportPage(props: { searchParams?: { ticket?: string } }) {
  const lang = getLanguageFromCookies();

  let user: Awaited<ReturnType<typeof requireUser>> | null = null;
  try {
    user = await requireUser();
  } catch {
    user = null;
  }

  const tickets = user
    ? await prisma.supportTicket.findMany({
        where: { userId: user.id },
        orderBy: [{ lastReplyAt: "desc" }],
        take: 50,
        select: {
          id: true,
          subject: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          lastReplyAt: true,
          _count: { select: { messages: true } },
        },
      })
    : [];

  const selectedId = props.searchParams?.ticket ?? tickets[0]?.id ?? null;
  const selectedTicket = user && selectedId
    ? await prisma.supportTicket.findFirst({
        where: { id: selectedId, userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            include: { author: { select: { email: true, role: true } } },
          },
        },
      })
    : null;

  return (
    <main>
      <Container className="py-16">
        <h1 className="text-3xl font-extrabold tracking-tight">{t(lang, "support.title")}</h1>
        <p className="mt-2 max-w-2xl text-sm text-[color:var(--muted)]">{t(lang, "support.subtitle")}</p>

        {!user ? (
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "support.loginRequired.title")}</div>
              <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "support.loginRequired.body")}</div>
              <div className="mt-6 flex gap-3">
                <Link href="/login" className="rounded-xl bg-[color:var(--accent)] px-4 py-2 text-sm font-bold text-black">
                  {t(lang, "auth.login")}
                </Link>
                <Link href="/register" className="rounded-xl border border-[color:var(--border)] px-4 py-2 text-sm font-bold">
                  {t(lang, "auth.register")}
                </Link>
              </div>
            </Card>

            <Card className="p-6">
              <div className="text-sm font-extrabold">{t(lang, "support.tips")}</div>
              <ul className="mt-4 grid gap-2 text-sm text-[color:var(--muted)]">
                <li>• {t(lang, "support.tip1")}</li>
                <li>• {t(lang, "support.tip2")}</li>
                <li>• {t(lang, "support.tip3")}</li>
              </ul>
            </Card>
          </div>
        ) : (
          <div className="mt-10 grid gap-4 xl:grid-cols-[360px,minmax(0,1fr)]">
            <div className="grid gap-4">
              <Card className="p-6">
                <div className="text-sm font-extrabold">{t(lang, "support.newTicket")}</div>
                <div className="mt-2 text-sm text-[color:var(--muted)]">{t(lang, "support.contactHint")}</div>
                <div className="mt-6">
                  <SupportTicketComposer />
                </div>
              </Card>

              <Card className="p-6">
                <div className="mb-4 flex items-center justify-between">
                  <div className="text-sm font-extrabold">{t(lang, "support.yourTickets")}</div>
                  <div className="text-xs text-[color:var(--muted)]">{tickets.length}</div>
                </div>

                <div className="grid gap-2">
                  {tickets.length === 0 ? (
                    <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-4 text-sm text-[color:var(--muted)]">
                      {t(lang, "support.noTickets")}
                    </div>
                  ) : tickets.map((ticket) => (
                    <Link
                      key={ticket.id}
                      href={`/support?ticket=${ticket.id}`}
                      className={`rounded-xl border px-4 py-3 text-left transition ${selectedTicket?.id === ticket.id ? "border-[color:var(--accent)] bg-[color:var(--surface2)]" : "border-[color:var(--border)] bg-[color:var(--surface1)] hover:bg-[color:var(--surface2)]"}`}
                    >
                      <div className="truncate text-sm font-bold text-[color:var(--text)]">{ticket.subject}</div>
                      <div className={`mt-1 text-xs font-semibold ${ticketTone(ticket.status)}`}>{t(lang, `support.status.${ticket.status.toLowerCase()}`)}</div>
                      <div className="mt-2 text-xs text-[color:var(--muted)]">
                        {ticket._count.messages} {t(lang, "support.messagesCount")} • {new Date(ticket.lastReplyAt).toLocaleString()}
                      </div>
                    </Link>
                  ))}
                </div>
              </Card>
            </div>

            <Card className="p-6">
              {selectedTicket ? (
                <>
                  <div className="flex flex-col gap-3 border-b border-[color:var(--border)] pb-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <div className="text-xl font-extrabold text-[color:var(--text)]">{selectedTicket.subject}</div>
                      <div className={`mt-2 text-xs font-semibold ${ticketTone(selectedTicket.status)}`}>{t(lang, `support.status.${selectedTicket.status.toLowerCase()}`)}</div>
                    </div>
                    <div className="text-xs text-[color:var(--muted)]">
                      {t(lang, "support.openedAt")} {new Date(selectedTicket.createdAt).toLocaleString()}
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
                            <div className="font-bold text-[color:var(--text)]">{isAdmin ? t(lang, "support.staff") : message.author.email}</div>
                            <div className="text-[color:var(--muted)]">{new Date(message.createdAt).toLocaleString()}</div>
                          </div>
                          <div className="mt-2 whitespace-pre-wrap text-sm text-[color:var(--text)]">{message.body}</div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-6 border-t border-[color:var(--border)] pt-5">
                    {selectedTicket.status === "CLOSED" ? (
                      <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-4 text-sm text-[color:var(--muted)]">
                        {t(lang, "support.closedHint")}
                      </div>
                    ) : (
                      <SupportTicketReplyForm action={`/api/support/tickets/${selectedTicket.id}/messages`} />
                    )}
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface2)] px-4 py-8 text-center text-sm text-[color:var(--muted)]">
                  {t(lang, "support.selectTicket")}
                </div>
              )}
            </Card>
          </div>
        )}
      </Container>
    </main>
  );
}
