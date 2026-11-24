"use client";

import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";

/** Dot + trailing ring that grows over interactive elements; fine pointers only. */
export function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [label, setLabel] = useState("");
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)");
    const sync = () => setEnabled(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!enabled || !dot.current || !ring.current) return;
    document.documentElement.classList.add("has-cursor");
    const dx = gsap.quickTo(dot.current, "x", { duration: 0.12, ease: "power3" });
    const dy = gsap.quickTo(dot.current, "y", { duration: 0.12, ease: "power3" });
    const rx = gsap.quickTo(ring.current, "x", { duration: 0.5, ease: "power3" });
    const ry = gsap.quickTo(ring.current, "y", { duration: 0.5, ease: "power3" });
    const r = ring.current;

    const layer = r.parentElement!;
    const move = (e: PointerEvent) => {
      layer.style.opacity = "1";
      dx(e.clientX);
      dy(e.clientY);
      rx(e.clientX);
      ry(e.clientY);
    };
    const over = (e: PointerEvent) => {
      const t = e.target as HTMLElement | null;
      const hit = t?.closest<HTMLElement>("a, button, [data-cursor]");
      const text = hit?.closest<HTMLElement>("[data-cursor-label]")?.dataset.cursorLabel ?? "";
      setLabel(text);
      gsap.to(r, { scale: hit ? (text ? 2.6 : 1.7) : 1, duration: 0.4, ease: "power3.out" });
      r.classList.toggle("is-active", Boolean(hit));
    };
    const down = () => gsap.to(r, { scale: "-=0.25", duration: 0.15 });
    const up = () => gsap.to(r, { scale: "+=0.25", duration: 0.25 });

    window.addEventListener("pointermove", move, { passive: true });
    window.addEventListener("pointerover", over, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    return () => {
      document.documentElement.classList.remove("has-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("pointerover", over);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
    };
  }, [enabled]);

  if (!enabled) return null;
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-[90] opacity-0 transition-opacity duration-300">
      <div ref={ring} className="cursor-ring">
        <span>{label}</span>
      </div>
      <div ref={dot} className="cursor-dot" />
    </div>
  );
}
