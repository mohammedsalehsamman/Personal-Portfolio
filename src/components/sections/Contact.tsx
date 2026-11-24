import { profile } from "@/content/profile";
import { ui } from "@/content/ui";
import type { Locale } from "@/content/types";
import { shapeIndex } from "@/lib/scene-state";
import { cvFiles } from "@/lib/site";
import { Arrow } from "@/components/ui/Frames";
import { CopyEmail } from "@/components/site/CopyEmail";

export function Contact({ lang }: { lang: Locale }) {
  const year = 2026;
  return (
    <section id="contact" data-shape={shapeIndex("monogram")} data-offset={1} data-dim={0.55} data-y={0.3} data-y-mobile={2.3} className="relative flex min-h-[120vh] flex-col justify-center pt-32 pb-10 max-md:pt-[45vh]">
      <div className="container-x w-full">
        <p data-reveal className="eyebrow">
          {ui.contact.eyebrow[lang]}
        </p>
        <h2 data-split className="mt-5 max-w-[11ch] font-display text-[clamp(2.6rem,6vw,6rem)] leading-[0.95] font-bold tracking-[-0.04em] rtl:leading-[1.2] rtl:tracking-normal">
          {ui.contact.title[lang]}
        </h2>
        <p data-reveal className="mt-6 max-w-xl text-lg text-fg/70">
          {ui.contact.body[lang]}
        </p>

        <div data-reveal className="mt-10 flex flex-wrap items-center gap-4">
          <a href={`mailto:${profile.email}`} className="group font-display text-[clamp(1.2rem,2.4vw,2rem)] font-semibold break-all underline decoration-accent/40 decoration-2 underline-offset-8 transition-colors hover:decoration-accent" data-cursor-label="Mail" dir="ltr">
            {profile.email}
          </a>
          <CopyEmail email={profile.email} label={ui.contact.copy[lang]} done={ui.contact.copied[lang]} />
        </div>

        <div className="mt-14 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-2">
          <div data-reveal>
            <p className="eyebrow">{ui.cv.title[lang]}</p>
            <ul className="mt-5 grid grid-cols-2 gap-3">
              {cvFiles.map((f) => (
                <li key={f.file}>
                  <a href={f.file} download className="cv-tile group" data-magnetic>
                    <span className="font-semibold">{ui.cv[f.variant][lang]}</span>
                    <span className="text-xs text-muted">
                      PDF · {f.lang === "en" ? ui.cv.english[lang] : ui.cv.arabic[lang]}
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div data-reveal data-delay={0.1}>
            <p className="eyebrow">Links</p>
            <ul className="mt-5 space-y-3 text-lg">
              <li>
                <a href={profile.links.github} target="_blank" rel="noopener me" className="link-muted group">
                  GitHub <Arrow external />
                </a>
              </li>
              <li>
                <a href={profile.links.linkedin} target="_blank" rel="noopener me" className="link-muted group">
                  LinkedIn <Arrow external />
                </a>
              </li>
              <li>
                <a href={`tel:${profile.phone.replace(/\s/g, "")}`} className="link-muted">
                  <bdi dir="ltr">{profile.phone}</bdi>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <footer className="mt-20 flex flex-wrap justify-between gap-4 border-t border-white/10 pt-6 text-xs text-muted">
          <span>
            © {year} {profile.name[lang]}
          </span>
          <span>{ui.contact.rights[lang]}</span>
        </footer>
      </div>
    </section>
  );
}
