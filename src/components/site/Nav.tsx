"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { ui } from "@/content/ui";
import type { Locale } from "@/content/types";
import { gsap } from "@/lib/gsap";
import { TransitionLink } from "./TransitionLink";

export function Nav({ lang }: { lang: Locale }) {
  const pathname = usePathname();
  const bar = useRef<HTMLElement>(null);
  const other: Locale = lang === "en" ? "ar" : "en";
  const switchHref = pathname.replace(/^\/(en|ar)(?=\/|$)/, `/${other}`);

  // Hide while scrolling down, reveal when scrolling up.
  useEffect(() => {
    let last = window.scrollY;
    let hidden = false;
    const onScroll = () => {
      const y = window.scrollY;
      const hide = y > last && y > 160;
      if (hide !== hidden && bar.current) {
        hidden = hide;
        gsap.to(bar.current, { yPercent: hide ? -110 : 0, duration: 0.5, ease: "power3.out" });
      }
      last = y;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const link = "relative py-1 text-sm text-fg/70 transition-colors hover:text-fg after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left rtl:after:origin-right after:scale-x-0 after:bg-accent after:transition-transform after:duration-500 hover:after:scale-x-100";

  return (
    <header ref={bar} className="fixed inset-x-0 top-0 z-50">
      <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-5 py-4 sm:px-8" aria-label="Primary">
        <TransitionLink href={`/${lang}`} className="font-display text-xl font-bold tracking-tight" data-magnetic dir="ltr">
          MS<span className="text-accent">.</span>
        </TransitionLink>
        <div className="flex items-center gap-5 rounded-full border border-white/10 bg-bg/40 px-5 py-2 backdrop-blur-md sm:gap-7">
          <TransitionLink href={`/${lang}#work`} className={`${link} hidden sm:block`}>
            {ui.nav.work[lang]}
          </TransitionLink>
          <TransitionLink href={`/${lang}#about`} className={`${link} hidden sm:block`}>
            {ui.nav.about[lang]}
          </TransitionLink>
          <TransitionLink href={`/${lang}#contact`} className={link}>
            {ui.nav.contact[lang]}
          </TransitionLink>
          <span className="h-4 w-px bg-white/15" aria-hidden />
          {/* Plain anchor: a language switch is a full document change (lang/dir, fonts). */}
          <a href={switchHref} hrefLang={other} lang={other} aria-label={ui.nav.switchLabel[lang]} className={`${link} font-medium text-accent`}>
            {ui.nav.switchTo[lang]}
          </a>
        </div>
      </nav>
    </header>
  );
}
