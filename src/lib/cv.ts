import { experience } from "@/content/experience";
import { skills } from "@/content/profile";
import { projects } from "@/content/projects";
import type { CvVariant, Project } from "@/content/types";

function byOrder<T extends { cvOrder: Partial<Record<CvVariant, number>> }>(items: T[], v: CvVariant) {
  return items
    .filter((i) => i.cvOrder[v] !== undefined)
    .sort((a, b) => (a.cvOrder[v] ?? 0) - (b.cvOrder[v] ?? 0));
}

function withBullets<T extends { bullets: { cv: CvVariant[] }[] }>(item: T, v: CvVariant): T {
  return { ...item, bullets: item.bullets.filter((b) => b.cv.includes(v)) };
}

/** Everything one tailored CV shows, already filtered and ordered. */
export function getCv(v: CvVariant) {
  const ordered = byOrder(projects, v).map((p) => withBullets(p, v));
  return {
    experience: byOrder(experience, v).map((e) => withBullets(e, v)),
    graduation: ordered.filter((p) => p.kind === "graduation"),
    projects: ordered.filter((p) => p.kind !== "graduation"),
    oneLiners: projects
      .filter((p): p is Project & { cvOneLine: NonNullable<Project["cvOneLine"]> } =>
        Boolean(p.cvOneLine?.cv.includes(v)),
      )
      .map((p) => p.cvOneLine.text),
    skills: byOrder(skills, v),
  };
}
