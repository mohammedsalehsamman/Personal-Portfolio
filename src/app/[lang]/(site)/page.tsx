import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { profile } from "@/content/profile";
import { isLocale } from "@/content/types";
import { flagship, SITE_URL } from "@/lib/site";
import { About } from "@/components/sections/About";
import { ClientSites } from "@/components/sections/ClientSites";
import { Contact } from "@/components/sections/Contact";
import { Hero } from "@/components/sections/Hero";
import { MoreWork } from "@/components/sections/MoreWork";
import { ProjectChapter } from "@/components/sections/ProjectChapter";
import { Motion } from "@/components/site/Motion";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  return {
    alternates: { canonical: `/${lang}`, languages: { en: "/en", ar: "/ar", "x-default": "/en" } },
    openGraph: { type: "profile", locale: lang === "ar" ? "ar_SY" : "en_US", url: `/${lang}` },
  };
}

export default async function Home({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const person = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: profile.name.en,
    alternateName: profile.name.ar,
    jobTitle: profile.role.en,
    email: `mailto:${profile.email}`,
    url: SITE_URL,
    address: { "@type": "PostalAddress", addressLocality: "Damascus", addressCountry: "SY" },
    alumniOf: { "@type": "CollegeOrUniversity", name: "Alsham Private University" },
    sameAs: [profile.links.github, profile.links.linkedin],
    knowsAbout: ["Machine Learning", "NLP", "Django", "NestJS", "PostgreSQL", "Backend Engineering"],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(person).replace(/</g, "\\u003c") }} />
      <Hero lang={lang} />
      {flagship.map((f, i) => (
        <ProjectChapter key={f.project.slug} id={i === 0 ? "work" : undefined} index={i} lang={lang} {...f} />
      ))}
      <ClientSites lang={lang} />
      <MoreWork lang={lang} />
      <About lang={lang} />
      <Contact lang={lang} />
      {/* Last child: its effects run only after this page's content has hydrated. */}
      <Motion />
    </>
  );
}
