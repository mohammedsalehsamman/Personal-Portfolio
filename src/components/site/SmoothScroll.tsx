"use client";

import Lenis from "lenis";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { gsap, prefersReducedMotion, ScrollTrigger } from "@/lib/gsap";
import { getLenis, scrollToId, setLenis } from "@/lib/nav-bus";
import { sceneState } from "@/lib/scene-state";

/** Lenis smooth scrolling driven by GSAP's ticker, plus pointer tracking for the scene. */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    sceneState.reducedMotion = prefersReducedMotion();
    sceneState.rtl = document.documentElement.dir === "rtl";
    if (sceneState.reducedMotion) return;

    const lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95 });
    setLenis(lenis);
    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, []);

  useEffect(() => {
    const move = (e: PointerEvent) => {
      sceneState.pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      sceneState.pointer.y = -((e.clientY / window.innerHeight) * 2 - 1);
      sceneState.pointer.active = e.pointerType === "mouse";
    };
    const leave = () => {
      sceneState.pointer.active = false;
    };
    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, []);

  // New route: start at the top (or at the hash), then let ScrollTrigger re-measure.
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!(hash && scrollToId(hash))) {
      getLenis()?.scrollTo(0, { immediate: true });
      window.scrollTo(0, 0);
    }
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [pathname]);

  return null;
}
