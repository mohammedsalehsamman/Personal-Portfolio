"use client";

import { useEffect, useRef, useState } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { sceneState } from "@/lib/scene-state";

declare global {
  interface Window {
    __introDone?: boolean;
  }
}

const sceneReady = () =>
  new Promise<void>((resolve) => {
    if (sceneState.ready) return resolve();
    window.addEventListener("scene:ready", () => resolve(), { once: true });
  });
const timeout = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Intro overlay: counts up while fonts and particles load, then wipes away. */
export function Loader({ label }: { label: string }) {
  const root = useRef<HTMLDivElement>(null);
  const num = useRef<HTMLSpanElement>(null);
  const bar = useRef<HTMLSpanElement>(null);
  const [gone, setGone] = useState(false);

  useEffect(() => {
    let seen = false;
    try {
      seen = sessionStorage.getItem("intro") === "1";
    } catch {}
    const reduce = prefersReducedMotion();
    const counter = { v: 0 };
    const render = () => {
      if (num.current) num.current.textContent = String(Math.round(counter.v)).padStart(3, "0");
      if (bar.current) bar.current.style.transform = `scaleX(${counter.v / 100})`;
    };
    let cancelled = false;

    const finish = () => {
      window.__introDone = true;
      window.dispatchEvent(new Event("intro"));
      try {
        sessionStorage.setItem("intro", "1");
      } catch {}
    };

    (async () => {
      const ready = Promise.race([Promise.all([document.fonts.ready, sceneReady()]), timeout(4500)]);
      if (reduce) {
        await ready;
        if (cancelled) return;
        setGone(true);
        finish();
        return;
      }
      await gsap.to(counter, { v: 86, duration: seen ? 0.35 : 1.6, ease: "power2.inOut", onUpdate: render });
      await ready;
      if (cancelled) return;
      await gsap.to(counter, { v: 100, duration: 0.3, ease: "power1.out", onUpdate: render });
      const tl = gsap.timeline({ onComplete: () => setGone(true) });
      tl.to("[data-loader-inner]", { yPercent: -30, opacity: 0, duration: 0.5, ease: "power2.in" })
        .to(root.current, { clipPath: "inset(0 0 100% 0)", duration: 1.0, ease: "expo.inOut" }, "-=0.15")
        .add(finish, "-=0.55");
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  if (gone) return null;
  return (
    <div
      ref={root}
      className="fixed inset-0 z-[100] flex items-end bg-bg p-6 sm:p-10"
      style={{ clipPath: "inset(0 0 0 0)" }}
      role="status"
      aria-live="polite"
    >
      <div data-loader-inner className="flex w-full flex-col items-start gap-6 sm:flex-row sm:items-end sm:justify-between">
        <div className="w-full max-w-80">
          <p className="font-mono text-xs tracking-[0.3em] text-muted uppercase">{label}</p>
          <span className="mt-4 block h-px w-full origin-left bg-white/10">
            <span ref={bar} className="block h-px origin-[inherit] scale-x-0 bg-accent" />
          </span>
        </div>
        <span ref={num} className="font-display text-[clamp(4rem,24vw,8rem)] leading-none font-bold tabular-nums" dir="ltr">
          000
        </span>
      </div>
    </div>
  );
}
