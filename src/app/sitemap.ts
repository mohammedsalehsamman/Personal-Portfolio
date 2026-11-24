import type { MetadataRoute } from "next";
import { locales } from "@/content/types";
import { caseStudySlugs, SITE_URL } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", ...caseStudySlugs.map((s) => `/work/${s}`)];
  return paths.flatMap((path) =>
    locales.map((lang) => ({
      url: `${SITE_URL}/${lang}${path}`,
      alternates: { languages: Object.fromEntries(locales.map((l) => [l, `${SITE_URL}/${l}${path}`])) },
      changeFrequency: "monthly" as const,
      priority: path === "" ? 1 : 0.7,
    })),
  );
}
