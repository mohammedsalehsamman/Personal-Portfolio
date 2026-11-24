"use client";

import { usePathname } from "next/navigation";
import { gsap, prefersReducedMotion, ScrollTrigger, SplitText, useGSAP } from "@/lib/gsap";

const parseCount = (raw: string) => {
  const m = raw.match(/^([^\d]*)([\d,]*\.?\d+)(.*)$/);
  if (!m) return null;
  const [, prefix, num, suffix] = m;
  const decimals = num.includes(".") ? num.split(".")[1].length : 0;
  return { prefix, suffix, value: Number(num.replace(/,/g, "")), decimals, commas: num.includes(",") };
};

/**
 * Declarative scroll animations. Markup opts in with data attributes, so server
 * components stay server components and content is fully visible without JS:
 *  data-hero          intro sequence after the loader
 *  data-split         heading revealed line by line (words in Arabic)
 *  data-reveal        fade/slide in (optional data-delay)
 *  data-count         number counts up from zero
 *  data-magnetic      element leans toward the pointer
 *  data-tilt          card tilts in 3D under the pointer
 *  data-speed         parallax factor while scrolling
 */
export function Motion() {
  const pathname = usePathname();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const rtl = document.documentElement.dir === "rtl";
      const cleanups: (() => void)[] = [];

      // Hero: split the name, hold it hidden until the loader finishes.
      const hero = document.querySelector<HTMLElement>("[data-hero]");
      if (hero) {
        const name = hero.querySelector<HTMLElement>("[data-hero-name]");
        const split = name ? SplitText.create(name, { type: rtl ? "words" : "chars,words", mask: rtl ? "words" : "chars" }) : null;
        const pieces = split ? (rtl ? split.words : split.chars) : [];
        const rest = hero.querySelectorAll("[data-hero-item]");
        gsap.set(pieces, { yPercent: 115 });
        gsap.set(rest, { y: 30, opacity: 0 });
        const play = () => {
          gsap.timeline()
            .to(pieces, { yPercent: 0, duration: 1.3, ease: "expo.out", stagger: rtl ? 0.08 : 0.035 })
            .to(rest, { y: 0, opacity: 1, duration: 1, ease: "power3.out", stagger: 0.09 }, "-=0.9");
        };
        if (window.__introDone) play();
        else {
          window.addEventListener("intro", play, { once: true });
          cleanups.push(() => window.removeEventListener("intro", play));
        }
      }

      gsap.utils.toArray<HTMLElement>("[data-split]").forEach((el) => {
        SplitText.create(el, {
          type: "words,lines",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) =>
            gsap.from(self.lines, {
              yPercent: 110,
              duration: 1.1,
              ease: "expo.out",
              stagger: 0.09,
              scrollTrigger: { trigger: el, start: "top 86%", once: true },
            }),
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.from(el, {
          y: 44,
          opacity: 0,
          duration: 1.1,
          ease: "power3.out",
          delay: Number(el.dataset.delay ?? 0),
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const parsed = parseCount(el.textContent?.trim() ?? "");
        if (!parsed) return;
        const fmt = (v: number) => {
          const n = parsed.commas
            ? v.toLocaleString("en-US", { minimumFractionDigits: parsed.decimals, maximumFractionDigits: parsed.decimals })
            : v.toFixed(parsed.decimals);
          return parsed.prefix + n + parsed.suffix;
        };
        const state = { v: 0 };
        el.textContent = fmt(0);
        gsap.to(state, {
          v: parsed.value,
          duration: 1.8,
          ease: "power2.out",
          onUpdate: () => {
            el.textContent = fmt(state.v);
          },
          scrollTrigger: { trigger: el, start: "top 92%", once: true },
        });
      });

      gsap.utils.toArray<HTMLElement>("[data-draw]").forEach((el) => {
        gsap.fromTo(
          el,
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top 75%", end: "bottom 55%", scrub: 0.6 } },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-speed]").forEach((el) => {
        const speed = Number(el.dataset.speed ?? 0.2);
        gsap.to(el, {
          yPercent: -speed * 100,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      if (window.matchMedia("(pointer: fine)").matches) {
        gsap.utils.toArray<HTMLElement>("[data-magnetic]").forEach((el) => {
          const xTo = gsap.quickTo(el, "x", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
          const yTo = gsap.quickTo(el, "y", { duration: 0.6, ease: "elastic.out(1, 0.4)" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            xTo((e.clientX - (r.left + r.width / 2)) * 0.3);
            yTo((e.clientY - (r.top + r.height / 2)) * 0.3);
          };
          const leave = () => {
            xTo(0);
            yTo(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });

        gsap.utils.toArray<HTMLElement>("[data-tilt]").forEach((el) => {
          gsap.set(el, { transformPerspective: 900 });
          const rx = gsap.quickTo(el, "rotationX", { duration: 0.5, ease: "power3" });
          const ry = gsap.quickTo(el, "rotationY", { duration: 0.5, ease: "power3" });
          const move = (e: PointerEvent) => {
            const r = el.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width - 0.5;
            const py = (e.clientY - r.top) / r.height - 0.5;
            rx(-py * 8);
            ry(px * 10);
            el.style.setProperty("--mx", `${(px + 0.5) * 100}%`);
            el.style.setProperty("--my", `${(py + 0.5) * 100}%`);
          };
          const leave = () => {
            rx(0);
            ry(0);
          };
          el.addEventListener("pointermove", move);
          el.addEventListener("pointerleave", leave);
          cleanups.push(() => {
            el.removeEventListener("pointermove", move);
            el.removeEventListener("pointerleave", leave);
          });
        });
      }

      ScrollTrigger.refresh();
      return () => cleanups.forEach((c) => c());
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
