import { NextResponse, type NextRequest } from "next/server";
import { caseStudies } from "@/content/case-studies";
import { publishedCvVariants } from "@/content/types";

const locales = ["en", "ar"];

function preferredLocale(request: NextRequest) {
  const header = request.headers.get("accept-language") ?? "";
  const first = header.split(",")[0]?.trim().toLowerCase() ?? "";
  return first.startsWith("ar") ? "ar" : "en";
}

// Streaming pages commit a 200 before notFound() can run, so unknown slugs are
// turned into real 404s here, before rendering starts.
const known: Record<string, Set<string>> = {
  work: new Set(Object.keys(caseStudies)),
  cv: new Set<string>(publishedCvVariants),
};

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocale = locales.some((l) => pathname === `/${l}` || pathname.startsWith(`/${l}/`));
  if (hasLocale) {
    const m = pathname.match(/^\/(en|ar)\/(work|cv)\/([^/]+)\/?$/);
    if (m && !known[m[2]].has(m[3])) {
      request.nextUrl.pathname = `/${m[1]}/not-found`;
      return NextResponse.rewrite(request.nextUrl, { status: 404 });
    }
    return;
  }

  request.nextUrl.pathname = `/${preferredLocale(request)}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = {
  // Skip Next internals and any path with a file extension (images, PDFs, favicon…).
  matcher: ["/((?!_next|.*\\..*).*)"],
};
