import { profile } from "@/content/profile";
import { ui } from "@/content/ui";
import type { Locale } from "@/content/types";
import { cvFiles } from "@/lib/site";
import { Arrow } from "@/components/ui/Frames";
import { TransitionLink } from "@/components/site/TransitionLink";

export function Hero({ lang }: { lang: Locale }) {
  const cv = cvFiles.find((f) => f.lang === lang)!.file;
  const [first, ...others] = profile.name[lang].split(" ");
  const rest = others.join(" ");
  return (
    <section data-shape={0} data-offset={1} data-dim={0.7} data-y-mobile={1.9} data-hero className="relative flex min-h-[100svh] items-end pt-32 pb-28 sm:pb-24">
      {/* Phones: the sphere floats above; this scrim keeps the text readable over it. */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-3/4 bg-gradient-to-t from-bg via-bg/75 to-transparent md:hidden" />
      <div className="container-x relative z-10 w-full">
        <p data-hero-item className="eyebrow">
          {ui.hero.eyebrow[lang]}
        </p>
        <h1
          data-hero-name
          className="mt-6 font-display text-[clamp(3.1rem,7vw,7rem)] leading-[0.9] font-bold tracking-[-0.045em] rtl:leading-[1.15] rtl:tracking-normal"
        >
          {/* First name on its own line keeps the heading inside the text half on wide screens. */}
          <span className="block">{first}</span>
          <span className="block">{rest}</span>
        </h1>
        <div className="mt-8 max-w-xl space-y-4">
          <p data-hero-item className="text-gradient font-display text-2xl font-semibold sm:text-3xl">
            {profile.role[lang]}
          </p>
          <p data-hero-item className="text-base leading-relaxed text-fg/75 sm:text-lg">
            {ui.hero.intro[lang]}
          </p>
        </div>
        <div data-hero-item className="mt-10 flex flex-wrap items-center gap-3">
          <TransitionLink href={`/${lang}#work`} className="btn group" data-magnetic>
            {ui.hero.viewWork[lang]} <Arrow />
          </TransitionLink>
          <a href={cv} download className="btn-ghost" data-magnetic>
            {ui.cv.title[lang]}
          </a>
        </div>
      </div>
      <div data-hero-item aria-hidden className="absolute end-6 bottom-8 hidden items-center gap-3 font-mono text-[11px] tracking-[0.3em] text-muted uppercase sm:flex">
        {ui.hero.scroll[lang]}
        <span className="scroll-line" />
      </div>
    </section>
  );
}
