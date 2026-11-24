import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-8 text-center">
      <div>
        <p className="font-display text-[clamp(5rem,20vw,12rem)] leading-none font-bold text-white/10" dir="ltr">
          404
        </p>
        <p className="mt-4 text-fg/70">This page doesn&apos;t exist · هذه الصفحة غير موجودة</p>
        <div className="mt-8 flex justify-center gap-4">
          <Link href="/en" className="btn">
            Home
          </Link>
          <Link href="/ar" className="btn-ghost">
            الرئيسية
          </Link>
        </div>
      </div>
    </main>
  );
}
