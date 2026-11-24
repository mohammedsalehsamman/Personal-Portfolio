import type Lenis from "lenis";

/** Tiny client-side singletons shared by navigation components. */
let lenis: Lenis | null = null;
export const setLenis = (l: Lenis | null) => {
  lenis = l;
};
export const getLenis = () => lenis;

type Listener = (href: string) => void;
const listeners = new Set<Listener>();

/** Ask the curtain to cover the screen, then route to `href`. */
export function transitionTo(href: string) {
  if (listeners.size === 0) {
    window.location.assign(href);
    return;
  }
  listeners.forEach((l) => l(href));
}
export function onTransition(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

/** Smooth-scroll to an in-page anchor, falling back to native scrolling. */
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  if (lenis) lenis.scrollTo(el, { offset: -40, duration: 1.6 });
  else el.scrollIntoView({ behavior: "smooth" });
  return true;
}
