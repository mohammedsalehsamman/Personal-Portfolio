import { ui } from "@/content/ui";
import type { Locale } from "@/content/types";
import { shapeIndex } from "@/lib/scene-state";
import { hasCaseStudy, moreWork, workHref } from "@/lib/site";
import { Arrow, Chips } from "@/components/ui/Frames";
import { TransitionLink } from "@/components/site/TransitionLink";

export function MoreWork({ lang }: { lang: Locale }) {
  return (
    <section data-shape={shapeIndex("chain")} data-offset={0} data-dim={0.4} className="relative py-40">
      <div className="container-x">
        <p data-reveal className="eyebrow">
          {ui.more.eyebrow[lang]}
        </p>
        <h2 data-split className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,5rem)] leading-[1] font-bold tracking-[-0.03em] rtl:leading-[1.25] rtl:tracking-normal">
          {ui.more.title[lang]}
        </h2>
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {moreWork.map((p, i) => {
            const source = p.links?.find((l) => l.href.includes("github.com"));
            return (
              <article key={p.slug} data-reveal data-delay={(i % 3) * 0.1} data-tilt className="tilt-card glass flex flex-col rounded-3xl p-7">
                <div className="flex items-center justify-between font-mono text-xs text-muted" dir="ltr">
                  <span>{String(i + 4).padStart(2, "0")}</span>
                  <span>{p.period}</span>
                </div>
                <h3 className="mt-8 font-display text-2xl font-bold">{p.name[lang]}</h3>
                <p className="mt-2 text-fg/70">{p.tagline[lang]}</p>
                {p.metrics.length > 0 && (
                  <dl className="mt-6 flex gap-6">
                    {p.metrics.slice(0, 2).map((m) => (
                      <div key={m.label.en} className="flex flex-col-reverse">
                        <dt className="text-xs text-muted">{m.label[lang]}</dt>
                        <dd dir="ltr" className="font-display text-2xl font-bold rtl:text-right">
                          {m.value}
                        </dd>
                      </div>
                    ))}
                  </dl>
                )}
                <Chips items={p.stack.slice(0, 4)} className="mt-6" />
                <div className="mt-auto flex gap-5 pt-8 text-sm">
                  {hasCaseStudy(p.slug) && (
                    <TransitionLink href={workHref(lang, p.slug)} className="link-accent group">
                      {ui.more.caseStudy[lang]} <Arrow />
                    </TransitionLink>
                  )}
                  {source && (
                    <a href={source.href} target="_blank" rel="noopener" className="link-muted group">
                      {ui.more.source[lang]} <Arrow external />
                    </a>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
