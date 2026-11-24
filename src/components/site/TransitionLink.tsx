"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { scrollToId, transitionTo } from "@/lib/nav-bus";

type Props = ComponentProps<typeof Link> & { href: string };

/** Link that plays the curtain for route changes and smooth-scrolls for same-page anchors. */
export function TransitionLink({ href, onClick, ...rest }: Props) {
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        const url = new URL(href, window.location.href);
        if (url.origin !== window.location.origin) return;
        if (url.pathname === window.location.pathname) {
          if (url.hash && scrollToId(url.hash.slice(1))) {
            e.preventDefault();
            history.replaceState(null, "", url.hash);
          }
          return;
        }
        e.preventDefault();
        transitionTo(url.pathname + url.hash);
      }}
      {...rest}
    />
  );
}
