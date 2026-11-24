import { caseStudies } from "@/content/case-studies";
import { projects } from "@/content/projects";
import type { Locale, Project } from "@/content/types";
import { shapeIndex, type ShapeName } from "./scene-state";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://mssportfolio.vercel.app").replace(/\/$/, "");

/** Only the Backend Engineer CV is published. */
export const cvFiles = [
  { variant: "backend", lang: "en", file: "/cv/Mohammed_Saleh_Samman_CV_Backend_Engineer.pdf" },
  { variant: "backend", lang: "ar", file: "/cv/Mohammed_Saleh_Samman_CV_Backend_Engineer_AR.pdf" },
] as const;

const bySlug = (slug: string) => {
  const p = projects.find((x) => x.slug === slug);
  if (!p) throw new Error(`Unknown project ${slug}`);
  return p;
};

/** The three flagship chapters on the home page, each with its particle shape. */
export const flagship: { project: Project; shape: ShapeName; offset: number; kind: "client" | "graduation" | "product" }[] = [
  { project: bySlug("belle-biens"), shape: "bloom", offset: 1, kind: "client" },
  { project: bySlug("momentum-signal-system"), shape: "candles", offset: -1, kind: "product" },
  { project: bySlug("aspu-insight"), shape: "graph", offset: 1, kind: "graduation" },
];

export const clientSites = projects.filter((p) => p.client);

const flagshipSlugs = new Set(flagship.map((f) => f.project.slug));
export const moreWork = projects
  .filter((p) => !p.client && !flagshipSlugs.has(p.slug))
  .sort((a, b) => (a.featured ?? 99) - (b.featured ?? 99));

/** Shape shown behind each case study, matching its home chapter where there is one. */
const caseShape: Record<string, ShapeName> = {
  "belle-biens": "bloom",
  "momentum-signal-system": "candles",
  "aspu-insight": "graph",
  "multi-chain-wallet": "chain",
  "telecom-churn": "knot",
  "sheda-online": "neural",
};

export const caseStudySlugs = Object.keys(caseStudies);
export const hasCaseStudy = (slug: string) => slug in caseStudies;
export const caseStudyShape = (slug: string) => shapeIndex(caseShape[slug] ?? "neural");

export const workHref = (lang: Locale, slug: string) => `/${lang}/work/${slug}`;

/** Case studies in home order, used for "next project". */
export const caseOrder = [...flagship.map((f) => f.project.slug), ...moreWork.map((p) => p.slug)].filter(hasCaseStudy);
