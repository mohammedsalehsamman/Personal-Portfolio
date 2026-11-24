"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { gsap, prefersReducedMotion } from "@/lib/gsap";
import { onTransition } from "@/lib/nav-bus";

/** Full-screen wipe between routes: cover → navigate → reveal. */
export function Curtain() {
  const el = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const covering = useRef(false);

  useEffect(
    () =>
      onTransition((href) => {
        if (prefersReducedMotion() || !el.current) {
          router.push(href);
          return;
        }
        covering.current = true;
        gsap.fromTo(
          el.current,
          { clipPath: "inset(100% 0 0 0)" },
          { clipPath: "inset(0% 0 0 0)", duration: 0.7, ease: "expo.inOut", onComplete: () => router.push(href) },
        );
      }),
    [router],
  );

  useEffect(() => {
    if (!covering.current || !el.current) return;
    covering.current = false;
    gsap.to(el.current, { clipPath: "inset(0 0 100% 0)", duration: 0.9, ease: "expo.inOut", delay: 0.15 });
  }, [pathname]);

  return (
    <div
      ref={el}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[80] grid place-items-center bg-[radial-gradient(circle_at_30%_30%,#123d3a,transparent_60%),radial-gradient(circle_at_70%_70%,#231c52,transparent_55%)] bg-bg"
      style={{ clipPath: "inset(100% 0 0 0)" }}
    >
      <span className="font-display text-6xl font-bold tracking-tight text-fg/90" dir="ltr">
        MS<span className="text-accent">.</span>
      </span>
    </div>
  );
}
