// Visual smoke test: screenshots of every chapter + console errors.
// Usage: pnpm build && node scripts/shots.mjs [outDir]
import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

const PORT = 3125;
const BASE = `http://localhost:${PORT}`;
const out = process.argv[2] ?? "shots";
await mkdir(out, { recursive: true });
const server = spawn("pnpm", ["exec", "next", "start", "-p", String(PORT)], { shell: true, stdio: "ignore" });

async function up() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/en`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("server did not start");
}

const errors = [];
try {
  await up();
  const browser = await chromium.launch({
    channel: process.env.PW_CHANNEL ?? "msedge",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });

  async function page(viewport, mobile = false) {
    const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, isMobile: mobile, hasTouch: mobile });
    const p = await ctx.newPage();
    p.on("console", (m) => m.type() === "error" && errors.push(`[console] ${m.text()}`));
    p.on("pageerror", (e) => errors.push(`[pageerror] ${e.message}`));
    return p;
  }

  const scrollTo = async (p, selector) => {
    await p.evaluate((s) => {
      const el = document.querySelector(s);
      const y = el.getBoundingClientRect().top + window.scrollY + el.offsetHeight / 2 - window.innerHeight / 2;
      window.scrollTo(0, y);
    }, selector);
    await p.waitForTimeout(2600);
  };

  for (const lang of ["en", "ar"]) {
    const p = await page({ width: 1440, height: 900 });
    await p.goto(`${BASE}/${lang}`, { waitUntil: "networkidle" });
    await p.waitForTimeout(5200);
    await p.screenshot({ path: `${out}/${lang}-0-hero.png` });
    const sections = await p.$$eval("[data-shape]", (els) => els.length);
    for (let i = 1; i < sections; i++) {
      await scrollTo(p, `[data-shape="${i}"]`);
      await p.screenshot({ path: `${out}/${lang}-${i}.png` });
    }
    await p.close();
  }

  const c = await page({ width: 1440, height: 900 });
  await c.goto(`${BASE}/en/work/belle-biens`, { waitUntil: "networkidle" });
  await c.waitForTimeout(5000);
  await c.screenshot({ path: `${out}/case-belle-top.png` });
  await c.screenshot({ path: `${out}/case-belle-full.png`, fullPage: true });

  const m = await page({ width: 390, height: 844 }, true);
  await m.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await m.waitForTimeout(5000);
  await m.screenshot({ path: `${out}/mobile-hero.png` });
  await scrollTo(m, '[data-shape="1"]');
  await m.screenshot({ path: `${out}/mobile-belle.png` });

  await browser.close();
} finally {
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
console.log(errors.length ? errors.join("\n") : "no console errors");
