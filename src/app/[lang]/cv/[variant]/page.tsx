import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CvDocument } from "@/components/cv/CvDocument";
import { profile } from "@/content/profile";
import { isLocale, isPublishedCv, publishedCvVariants } from "@/content/types";
import "./cv.css";

export function generateStaticParams() {
  return publishedCvVariants.map((variant) => ({ variant }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/cv/[variant]">): Promise<Metadata> {
  const { lang, variant } = await params;
  if (!isLocale(lang) || !isPublishedCv(variant)) return {};
  return { title: `CV — ${profile.headline[variant][lang]}`, robots: { index: false } };
}

export default async function CvPage({ params }: PageProps<"/[lang]/cv/[variant]">) {
  const { lang, variant } = await params;
  if (!isLocale(lang) || !isPublishedCv(variant)) notFound();
  return <CvDocument lang={lang} variant={variant} />;
}
