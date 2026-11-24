import Image from "next/image";
import { ui } from "@/content/ui";
import type { Locale } from "@/content/types";
import { shapeIndex } from "@/lib/scene-state";
import { clientSites } from "@/lib/site";
import { Arrow, BrowserFrame, Chips } from "@/components/ui/Frames";

export function ClientSites({ lang }: { lang: Locale }) {
  return (
    <section data-shape={shapeIndex("globe")} data-offset={0} data-dim={0.4} className="relative py-40">
      <div className="container-x">
        <p data-reveal className="eyebrow">
          {ui.clients.eyebrow[lang]}
        </p>
        <h2 data-split className="mt-5 max-w-3xl font-display text-[clamp(2.4rem,5.5vw,5rem)] leading-[1] font-bold tracking-[-0.03em] rtl:leading-[1.25] rtl:tracking-normal">
          {ui.clients.title[lang]}
        </h2>
        <div className="mt-16 grid gap-10 md:grid-cols-2 md:gap-8">
          {clientSites.map((p, i) => {
            const host = new URL(p.live!).host;
            const img = p.images?.[0];
            return (
              <article key={p.slug} data-reveal data-delay={i * 0.12} className="group">
                <a href={p.live} target="_blank" rel="noopener" data-tilt data-cursor-label={lang === "ar" ? "زيارة" : "Visit"} className="tilt-card block" aria-label={`${p.name[lang]} — ${ui.clients.visit[lang]}`}>
                  <BrowserFrame url={host}>
                    {img && (
                      <Image
                        src={img.src}
                        alt={img.alt[lang]}
                        fill
                        sizes="(min-width: 768px) 45vw, 100vw"
                        className="object-cover object-top transition-transform duration-[1.2s] ease-[cubic-bezier(.2,.7,.2,1)] group-hover:scale-[1.04]"
                      />
                    )}
                  </BrowserFrame>
                </a>
                <div className="mt-6 flex items-start justify-between gap-6">
                  <div>
                    <h3 className="font-display text-2xl font-bold sm:text-3xl">{p.name[lang]}</h3>
                    <p className="mt-2 text-fg/70">{p.tagline[lang]}</p>
                    {p.role && <p className="mt-1 text-sm text-muted">{p.role[lang]}</p>}
                  </div>
                  <a href={p.live} target="_blank" rel="noopener" className="link-accent group/link shrink-0 text-sm whitespace-nowrap">
                    {host} <Arrow external />
                  </a>
                </div>
                <Chips items={p.stack} className="mt-4" />
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
