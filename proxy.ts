import { NextResponse, type NextRequest } from "next/server";

/**
 * Roteamento de idioma:
 *   ES (padrão) sem prefixo  → /menu  (reescrito internamente para /es/menu)
 *   EN com prefixo           → /en/menu
 *   /es/...                  → redireciona para a URL sem prefixo (canonical)
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/es" || pathname.startsWith("/es/")) {
    const url = request.nextUrl.clone();
    url.pathname = pathname.slice(3) || "/";
    return NextResponse.redirect(url, 308);
  }

  if (pathname === "/en" || pathname.startsWith("/en/")) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = `/es${pathname === "/" ? "" : pathname}`;
  return NextResponse.rewrite(url);
}

export const config = {
  matcher: ["/((?!_next|api|media|opengraph-image|twitter-image|icon|apple-icon|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
