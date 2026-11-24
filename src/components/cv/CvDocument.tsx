import { profile } from "@/content/profile";
import { cvLabels } from "@/content/ui";
import type { CvVariant, L, Link, Locale } from "@/content/types";
import { getCv } from "@/lib/cv";

/** In RTL lines, keep Latin terms like "Walk-Forward" from splitting at the hyphen. */
const keepTerms = (s: string, lang: Locale) =>
  lang === "ar" ? s.replace(/([A-Za-z0-9])-(?=[A-Za-z0-9])/g, "$1‑") : s;

const short = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="cv-section">
      <h2>{title}</h2>
      {children}
    </section>
  );
}

function Entry({
  title,
  subtitle,
  period,
  links,
  bullets,
  stack,
  lang,
}: {
  title: string;
  subtitle?: string;
  period: string;
  links?: Link[];
  bullets: L[];
  stack?: string[];
  lang: Locale;
}) {
  return (
    <article className="cv-entry">
      <header>
        <h3>
          {title}
          {subtitle && <span className="cv-sub"> — {subtitle}</span>}
          {links?.map((l) => (
            <a key={l.href} href={l.href} className="cv-inline-link">
              {short(l.href)}
            </a>
          ))}
        </h3>
        <span className="cv-period">{period}</span>
      </header>
      {stack && stack.length > 0 && (
        <p className="cv-stack" dir="ltr">
          {stack.join(" · ")}
        </p>
      )}
      <ul>
        {bullets.map((b) => (
          <li key={b.en}>{keepTerms(b[lang], lang)}</li>
        ))}
      </ul>
    </article>
  );
}

export function CvDocument({ lang, variant }: { lang: Locale; variant: CvVariant }) {
  const cv = getCv(variant);
  const t = (l: L) => keepTerms(l[lang], lang);

  return (
    <main className="cv-sheet" data-variant={variant}>
      <header className="cv-head">
        <h1>{t(profile.name)}</h1>
        <p className="cv-headline">{t(profile.headline[variant])}</p>
        <p className="cv-contact">
          <span>{t(profile.location)}</span>
          <a href={`mailto:${profile.email}`}>{profile.email}</a>
          <a href={`tel:${profile.phone.replace(/\s/g, "")}`}>
            <bdi dir="ltr">{profile.phone}</bdi>
          </a>
        </p>
        <p className="cv-contact">
          <a href={profile.links.linkedin}>{short(profile.links.linkedin)}</a>
          <a href={profile.links.github}>{short(profile.links.github)}</a>
          <a href={profile.links.portfolio}>{short(profile.links.portfolio)}</a>
        </p>
      </header>

      <Section title={t(cvLabels.summary)}>
        <p className="cv-summary">{t(profile.summary[variant])}</p>
      </Section>

      <Section title={t(cvLabels.experience)}>
        {cv.experience.map((e) => (
          <Entry
            key={e.id}
            lang={lang}
            title={`${t(e.role)} — ${t(e.org)}`}
            period={t(e.period)}
            links={e.links}
            bullets={e.bullets.map((b) => b.text)}
          />
        ))}
      </Section>

      <Section title={t(cvLabels.graduation)}>
        {cv.graduation.map((p) => (
          <Entry
            key={p.slug}
            lang={lang}
            title={t(p.name)}
            subtitle={t(p.tagline)}
            period={p.period}
            bullets={p.bullets.map((b) => b.text)}
          />
        ))}
      </Section>

      <Section title={t(cvLabels.projects)}>
        {cv.projects.map((p) => (
          <Entry
            key={p.slug}
            lang={lang}
            title={t(p.name)}
            subtitle={t(p.tagline)}
            period={p.period}
            bullets={p.bullets.map((b) => b.text)}
          />
        ))}
      </Section>

      {cv.oneLiners.length > 0 && (
        <Section title={t(cvLabels.additional)}>
          <ul className="cv-oneliners">
            {cv.oneLiners.map((l) => (
              <li key={l.en}>{t(l)}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section title={t(cvLabels.skills)}>
        <dl className="cv-skills">
          {cv.skills.map((g) => (
            <div key={g.title.en}>
              <dt>{t(g.title)}</dt>
              <dd dir="ltr">{g.items.join(", ")}</dd>
            </div>
          ))}
        </dl>
      </Section>

      <Section title={t(cvLabels.education)}>
        <article className="cv-entry">
          <header>
            <h3>
              {t(profile.education.degree)}
              <span className="cv-sub"> — {t(profile.education.school)}</span>
            </h3>
            <span className="cv-period">{t(profile.education.period)}</span>
          </header>
        </article>
      </Section>

      <Section title={t(cvLabels.languages)}>
        <p>{profile.languages.map(t).join(" · ")}</p>
      </Section>
    </main>
  );
}
