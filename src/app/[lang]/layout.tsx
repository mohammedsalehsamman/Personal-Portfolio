import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { IBM_Plex_Sans_Arabic, Inter, Space_Grotesk } from "next/font/google";
import { isLocale, locales } from "@/content/types";
import { profile } from "@/content/profile";
import { SITE_URL } from "@/lib/site";
import "../globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"], display: "swap" });
const display = Space_Grotesk({ variable: "--font-display", subsets: ["latin"], display: "swap" });
const arabic = IBM_Plex_Sans_Arabic({
  variable: "--font-arabic",
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const title = `${profile.name[lang]} — ${profile.role[lang]}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s · ${profile.name[lang]}` },
    description: profile.summary.ai[lang],
    authors: [{ name: profile.name.en, url: SITE_URL }],
    openGraph: { siteName: profile.name[lang], title, description: profile.summary.ai[lang] },
    twitter: { card: "summary_large_image", title },
  };
}

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <html
      lang={lang}
      dir={lang === "ar" ? "rtl" : "ltr"}
      className={`${inter.variable} ${display.variable} ${arabic.variable} antialiased`}
    >
      <body>{children}</body>
    </html>
  );
}
