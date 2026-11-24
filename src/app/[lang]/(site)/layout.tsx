import { notFound } from "next/navigation";
import { ui } from "@/content/ui";
import { isLocale } from "@/content/types";
import { SceneMount } from "@/components/three/SceneMount";
import { Cursor } from "@/components/site/Cursor";
import { Curtain } from "@/components/site/Curtain";
import { Loader } from "@/components/site/Loader";
import { Nav } from "@/components/site/Nav";
import { SmoothScroll } from "@/components/site/SmoothScroll";

export default async function SiteLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  return (
    <>
      <a href="#main" className="skip-link">
        {ui.skip[lang]}
      </a>
      <div aria-hidden className="backdrop" />
      <SceneMount />
      <div aria-hidden className="grain" />
      <SmoothScroll />
      <Nav lang={lang} />
      <main id="main">{children}</main>
      <Curtain />
      <Cursor />
      <Loader label={ui.loader[lang]} />
    </>
  );
}
