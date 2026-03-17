import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { DEFAULT_LANG, isLangCode, LANG_COOKIE_NAME } from "@/lib/i18n";

function hasFileExtension(pathname: string) {
  return /\.[a-z0-9]+$/i.test(pathname);
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || hasFileExtension(pathname)) {
    return NextResponse.next();
  }

  const segments = pathname.split("/").filter(Boolean);
  const maybeLang = segments[0];
  const requestHeaders = new Headers(request.headers);

  if (isLangCode(maybeLang)) {
    const rewrittenPath = segments.length === 1 ? "/" : `/${segments.slice(1).join("/")}`;
    const rewrittenUrl = request.nextUrl.clone();
    rewrittenUrl.pathname = rewrittenPath;

    requestHeaders.set("x-kx-lang", maybeLang);
    requestHeaders.set("x-kx-original-pathname", pathname);

    const response = NextResponse.rewrite(rewrittenUrl, {
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set(LANG_COOKIE_NAME, maybeLang, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  }

  const cookieLang = request.cookies.get(LANG_COOKIE_NAME)?.value;
  requestHeaders.set("x-kx-lang", isLangCode(cookieLang) ? cookieLang : DEFAULT_LANG);
  requestHeaders.set("x-kx-original-pathname", pathname);

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};