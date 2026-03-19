import { cookies } from "next/headers";
import { jsonError, jsonOk } from "@/server/http";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/auth/session";
import { isLangCode } from "@/lib/i18n";
import { langCookieName } from "@/server/i18n";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    const lang = body?.lang;
    if (!isLangCode(lang)) return jsonError("Invalid language", 400);

    cookies().set(langCookieName, lang, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });

    try {
      const user = await requireUser();
      await prisma.user.update({
        where: { id: user.id },
        data: { preferredLanguage: lang },
      });
    } catch {
      // Ignore anonymous users and stale sessions.
    }

    return jsonOk({ lang });
  } catch (err: any) {
    return jsonError(err?.message ?? "Bad Request", err?.status ?? 400);
  }
}
