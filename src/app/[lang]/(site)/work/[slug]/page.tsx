import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { caseStudies } from "@/content/case-studies";
import { projects } from "@/content/projects";
import { ui } from "@/content/ui";
import { isLocale } from "@/content/types";
import { caseOrder, caseStudyShape, caseStudySlugs, workHref } from "@/lib/site";
import { Arrow, Chips, FramedImage } from "@/components/ui/Frames";
import { Motion } from "@/components/site/Motion";
import { SceneDirector } from "@/components/site/SceneDirector";
import { TransitionLink } from "@/components/site/TransitionLink";

export const instant = false;

export function generateStaticParams() {
  return caseStudySlugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/work/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  if (!isLocale(lang) || !p) return {};
  return {
    title: p.name[lang],
    description: p.tagline[lang],
    alternates: { canonical: `/${lang}/work/${slug}`, languages: { en: `/en/work/${slug}`, ar: `/ar/work/${slug}` } },
  };
}

export default async function CaseStudyPage({ params }: PageProps<"/[lang]/work/[slug]">) {
  const { lang, slug } = await params;
  const p = projects.find((x) => x.slug === slug);
  const cs = caseStudies[slug];
  if (!isLocale(lang) || !p || !cs) notFound();

  const nextSlug = caseOrder[(caseOrder.indexOf(slug) + 1) % caseOrder.length];
  const next = projects.find((x) => x.slug === nextSlug)!;
  const host = p.live ? new URL(p.live).host : p.slug;

  return (
    <article>
      <SceneDirector shape={caseStudyShape(slug)} offset={1} dim={0.2} />

      <header className="container-x pt-36 pb-20 sm:pt-44">
        <TransitionLink href={`/${lang}#work`} className="link-muted group text-sm" data-reveal>
          <span className="inline-block rotate-180 rtl:rotate-0">→</span> {ui.work.back[lang]}
        </TransitionLink>
        <p data-reveal className="eyebrow mt-10">
          {p.period}
          {p.role && <> · {p.role[lang]}</>}
        </p>
        <h1 data-split className="mt-5 max-w-5xl font-display text-[clamp(3rem,9vw,8.5rem)] leading-[0.92] font-bold tracking-[-0.045em] rtl:leading-[1.2] rtl:tracking-normal">
          {p.name[lang]}
        </h1>
        <p data-reveal className="mt-8 max-w-2xl text-xl leading-relaxed text-fg/75 sm:text-2xl">
          {p.tagline[lang]}
        </p>
        {(p.links?.length || p.live) && (
          <div data-reveal className="mt-8 flex flex-wrap gap-3">
            {p.live && (
              <a href={p.live} target="_blank" rel="noopener" className="btn group" data-magnetic>
                {host} <Arrow external />
              </a>
            )}
            {p.links?.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noopener" className="btn-ghost group" data-magnetic>
                {l.label[lang]} <Arrow external />
              </a>
            ))}
          </div>
        )}
      </header>

      {p.metrics.length > 0 && (
        <section className="container-x">
          <dl className="grid grid-cols-2 border-y border-white/10 md:grid-cols-4">
            {p.metrics.map((m) => (
              <div key={m.label.en} data-reveal className="flex flex-col-reverse gap-2 border-white/10 px-1 py-8 odd:border-e md:border-e md:px-6 md:last:border-e-0">
                <dt className="text-sm text-muted">{m.label[lang]}</dt>
                <dd data-count dir="ltr" className="font-display text-4xl font-bold tracking-tight rtl:text-right sm:text-6xl">
                  {m.value}
                </dd>
              </div>
            ))}
          </dl>
        </section>
      )}

      <section className="container-x grid gap-8 py-28 md:grid-cols-[14rem_1fr] md:gap-16">
        <p data-reveal className="eyebrow md:sticky md:top-32 md:self-start">
          {ui.work.problem[lang]}
        </p>
        <p data-split className="max-w-3xl font-display text-[clamp(1.5rem,3vw,2.4rem)] leading-snug font-medium text-fg/90 rtl:leading-relaxed">
          {cs.problem[lang]}
        </p>
      </section>

      <section className="container-x grid gap-8 py-12 md:grid-cols-[14rem_1fr] md:gap-16">
        <p data-reveal className="eyebrow md:sticky md:top-32 md:self-start">
          {ui.work.architecture[lang]}
        </p>
        <ol className="relative max-w-3xl">
          <span aria-hidden data-draw className="absolute start-[1.15rem] top-2 bottom-2 w-px origin-top bg-gradient-to-b from-accent via-accent-2 to-transparent" />
          {cs.flow.map((step, i) => (
            <li key={step.label.en} data-reveal className="relative grid grid-cols-[2.3rem_1fr] gap-5 pb-10 last:pb-0">
              <span className="relative z-10 grid size-[2.3rem] place-items-center rounded-full border border-accent/40 bg-bg font-mono text-xs text-accent" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="pt-1">
                <h3 className="font-display text-xl font-semibold sm:text-2xl">{step.label[lang]}</h3>
                <p className="mt-1 text-fg/65">{step.detail[lang]}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="container-x py-28">
        <p data-reveal className="eyebrow">
          {ui.work.decisions[lang]}
        </p>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {cs.decisions.map((d, i) => (
            <div key={d.title.en} data-reveal data-delay={i * 0.1} data-tilt className="tilt-card glass rounded-3xl p-8">
              <span className="font-mono text-xs text-accent" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-6 font-display text-2xl font-bold">{d.title[lang]}</h3>
              <p className="mt-4 leading-relaxed text-fg/70">{d.body[lang]}</p>
            </div>
          ))}
        </div>
      </section>

      {p.images && p.images.length > 0 && (
        <section className="container-x py-12">
          <p data-reveal className="eyebrow">
            {ui.work.gallery[lang]}
          </p>
          <div className="mt-10 flex flex-wrap items-end justify-center gap-8 md:justify-start">
            {p.images.map((img, i) => (
              <div key={img.src} data-reveal data-delay={i * 0.12} data-speed={i % 2 ? 0.08 : 0} className={img.frame === "browser" ? "w-full md:w-[calc(50%-1rem)]" : "w-[min(270px,80vw)]"}>
                <FramedImage image={img} lang={lang} url={host} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="container-x py-20">
        <p data-reveal className="eyebrow">
          {ui.work.stack[lang]}
        </p>
        <div data-reveal>
          <Chips items={p.stack} className="mt-6" />
        </div>
      </section>

      <section className="container-x pt-16 pb-24">
        <TransitionLink href={workHref(lang, next.slug)} className="group block border-t border-white/10 pt-10" data-cursor-label={lang === "ar" ? "التالي" : "Next"}>
          <span className="eyebrow">{ui.work.next[lang]}</span>
          <span className="mt-4 flex items-center justify-between gap-6">
            <span className="font-display text-[clamp(2.4rem,7vw,6.5rem)] leading-none font-bold tracking-[-0.04em] transition-colors duration-500 group-hover:text-accent rtl:leading-[1.3] rtl:tracking-normal">
              {next.name[lang]}
            </span>
            <span className="text-5xl">
              <Arrow />
            </span>
          </span>
        </TransitionLink>
      </section>
      <Motion />
    </article>
  );
}
