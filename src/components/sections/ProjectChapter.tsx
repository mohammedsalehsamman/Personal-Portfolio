import { ui } from "@/content/ui";
import type { Locale, Project } from "@/content/types";
import { shapeIndex, type ShapeName } from "@/lib/scene-state";
import { workHref } from "@/lib/site";
import { Arrow, Chips } from "@/components/ui/Frames";
import { TransitionLink } from "@/components/site/TransitionLink";

export function ProjectChapter({
  project: p,
  index,
  shape,
  offset,
  kind,
  lang,
  id,
}: {
  project: Project;
  index: number;
  shape: ShapeName;
  offset: number;
  kind: "client" | "graduation" | "product";
  lang: Locale;
  id?: string;
}) {
  return (
    <section id={id} data-shape={shapeIndex(shape)} data-offset={offset} data-dim={1} className="relative flex min-h-[150vh] items-center py-32">
      <div className="container-x w-full">
        <div className={`chapter-panel max-w-xl ${offset < 0 ? "ms-auto" : ""}`}>
          <p data-reveal className="eyebrow flex items-center gap-3">
            <span dir="ltr">0{index + 1}</span>
            <span className="h-px w-8 bg-accent/60" />
            <span>
              {ui.chapter[kind][lang]} · {p.period}
            </span>
          </p>
          <h2 data-split className="mt-6 font-display text-[clamp(2.8rem,7vw,6.4rem)] leading-[0.95] font-bold tracking-[-0.035em] rtl:leading-[1.2] rtl:tracking-normal">
            {p.name[lang]}
          </h2>
          <p data-reveal className="mt-6 text-lg leading-relaxed text-fg/80 sm:text-xl">
            {p.tagline[lang]}
          </p>
          {p.role && (
            <p data-reveal className="mt-2 text-sm text-muted">
              {p.role[lang]}
            </p>
          )}
          {p.metrics.length > 0 && (
            <dl className="mt-10 grid grid-cols-2 gap-x-8 gap-y-7">
              {p.metrics.map((m) => (
                <div key={m.label.en} data-reveal className="flex flex-col-reverse gap-1 border-t border-white/10 pt-4">
                  <dt className="text-sm text-muted">{m.label[lang]}</dt>
                  <dd data-count dir="ltr" className="font-display text-4xl font-bold tracking-tight text-fg rtl:text-right sm:text-5xl">
                    {m.value}
                  </dd>
                </div>
              ))}
            </dl>
          )}
          <div data-reveal>
            <Chips items={p.stack.slice(0, 7)} className="mt-8" />
          </div>
          <div data-reveal className="mt-10">
            <TransitionLink href={workHref(lang, p.slug)} className="btn group" data-magnetic data-cursor-label={lang === "ar" ? "افتح" : "Open"}>
              {ui.chapter.readCase[lang]} <Arrow />
            </TransitionLink>
          </div>
        </div>
      </div>
    </section>
  );
}
