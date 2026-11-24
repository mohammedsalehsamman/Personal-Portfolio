import { profile, skills } from "@/content/profile";
import { ui } from "@/content/ui";
import type { Locale } from "@/content/types";
import { shapeIndex } from "@/lib/scene-state";

export function About({ lang }: { lang: Locale }) {
  const marquee = skills.flatMap((g) => g.items).filter((s) => !s.includes(" "));
  return (
    <section id="about" data-shape={shapeIndex("knot")} data-offset={-1} data-dim={0.9} className="relative flex min-h-[140vh] flex-col justify-center py-36">
      <div className="container-x w-full">
        <div className="chapter-panel ms-auto max-w-2xl">
          <p data-reveal className="eyebrow">
            {ui.about.eyebrow[lang]}
          </p>
          <h2 data-split className="mt-5 font-display text-[clamp(2.3rem,5vw,4.4rem)] leading-[1.02] font-bold tracking-[-0.03em] rtl:leading-[1.3] rtl:tracking-normal">
            {ui.about.title[lang]}
          </h2>
          {profile.about.map((para) => (
            <p key={para.en} data-reveal className="mt-6 text-lg leading-relaxed text-fg/75">
              {para[lang]}
            </p>
          ))}
          <dl className="mt-10 grid gap-6 sm:grid-cols-2">
            <div data-reveal className="border-t border-white/10 pt-4">
              <dt className="eyebrow">{ui.about.education[lang]}</dt>
              <dd className="mt-3 font-medium">{profile.education.degree[lang]}</dd>
              <dd className="text-sm text-muted">
                {profile.education.school[lang]} · {profile.education.period[lang]}
              </dd>
            </div>
            <div data-reveal className="border-t border-white/10 pt-4">
              <dt className="eyebrow">{ui.about.languages[lang]}</dt>
              {profile.languages.map((l) => (
                <dd key={l.en} className="mt-3 font-medium">
                  {l[lang]}
                </dd>
              ))}
            </div>
          </dl>
          <div className="mt-10 space-y-5">
            {skills.map((g) => (
              <div key={g.title.en} data-reveal className="grid gap-2 sm:grid-cols-[10rem_1fr] sm:gap-6">
                <p className="text-sm font-semibold text-fg/90">{g.title[lang]}</p>
                <p dir="ltr" className="text-sm leading-relaxed text-muted rtl:text-right">
                  {g.items.join(" · ")}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div aria-hidden className="marquee mt-24" dir="ltr">
        <div className="marquee-track">
          {[...marquee, ...marquee].map((s, i) => (
            <span key={i} className="font-display text-5xl font-bold text-white/[0.06] sm:text-7xl">
              {s}
              <span className="mx-6 text-accent/30">✦</span>
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
