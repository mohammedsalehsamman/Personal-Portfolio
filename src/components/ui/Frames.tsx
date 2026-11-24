import Image from "next/image";
import type { ProjectImage, Locale } from "@/content/types";

export function BrowserFrame({ url, children }: { url: string; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0b0e15] shadow-[0_30px_80px_-30px_rgb(0_0_0/0.8)]">
      <div className="flex items-center gap-2 border-b border-white/5 px-4 py-3" dir="ltr">
        <span className="size-2.5 rounded-full bg-[#ff5f57]" />
        <span className="size-2.5 rounded-full bg-[#febc2e]" />
        <span className="size-2.5 rounded-full bg-[#28c840]" />
        <span className="ms-3 truncate rounded-full bg-white/5 px-3 py-0.5 font-mono text-[11px] text-muted">{url}</span>
      </div>
      <div className="relative aspect-[16/10] overflow-hidden">{children}</div>
    </div>
  );
}

export function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative aspect-[9/19.5] w-full max-w-[270px] overflow-hidden rounded-[2.4rem] border-[7px] border-[#1a1e28] bg-black shadow-[0_40px_90px_-30px_rgb(0_0_0/0.9)]">
      <span className="absolute top-2 left-1/2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-black" />
      {children}
    </div>
  );
}

export function FramedImage({ image, lang, url, priority }: { image: ProjectImage; lang: Locale; url: string; priority?: boolean }) {
  const img = (
    <Image
      src={image.src}
      alt={image.alt[lang]}
      fill
      priority={priority}
      sizes={image.frame === "phone" ? "270px" : "(min-width: 1024px) 50vw, 100vw"}
      className="object-cover object-top"
    />
  );
  if (image.frame === "phone") return <PhoneFrame>{img}</PhoneFrame>;
  if (image.frame === "browser") return <BrowserFrame url={url}>{img}</BrowserFrame>;
  return (
    <div className="relative aspect-[4/5] w-full max-w-[320px] overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03]">
      <Image src={image.src} alt={image.alt[lang]} fill sizes="320px" className="object-contain p-4" />
    </div>
  );
}

export function Chips({ items, className = "" }: { items: string[]; className?: string }) {
  return (
    <ul className={`flex flex-wrap gap-2 ${className}`} dir="ltr">
      {items.map((s) => (
        <li key={s} className="chip">
          {s}
        </li>
      ))}
    </ul>
  );
}

export function Arrow({ external = false }: { external?: boolean }) {
  return (
    <span aria-hidden className={`inline-block transition-transform duration-500 ${external ? "group-hover:-translate-y-0.5 group-hover:translate-x-0.5" : "rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"}`}>
      {external ? "↗" : "→"}
    </span>
  );
}
