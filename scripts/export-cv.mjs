// Renders every CV route to an A4 PDF in public/cv/.
// Usage: pnpm build && pnpm cv:pdf
import { spawn } from "node:child_process";
import { mkdir, writeFile } from "node:fs/promises";
import { chromium } from "playwright";

const PORT = 3123;
const BASE = `http://localhost:${PORT}`;
const jobs = [
  { lang: "en", variant: "backend", file: "Mohammed_Saleh_Samman_CV_Backend_Engineer.pdf" },
  { lang: "ar", variant: "backend", file: "Mohammed_Saleh_Samman_CV_Backend_Engineer_AR.pdf" },
];

const server = spawn("pnpm", ["exec", "next", "start", "-p", String(PORT)], { shell: true, stdio: "ignore" });

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      if ((await fetch(`${BASE}/en/cv/backend`)).ok) return;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }
  throw new Error("next start did not come up");
}

const countPages = (buf) => (buf.toString("latin1").match(/\/Type\s*\/Page[^s]/g) ?? []).length;

try {
  await waitForServer();
  await mkdir("public/cv", { recursive: true });
  // Edge ships with Windows; avoids downloading a Playwright browser build.
  const browser = await chromium.launch({ channel: process.env.PW_CHANNEL ?? "msedge" });
  const page = await browser.newPage();
  let failed = false;
  for (const job of jobs) {
    await page.goto(`${BASE}/${job.lang}/cv/${job.variant}`, { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    await writeFile(`public/cv/${job.file}`, pdf);
    const pages = countPages(pdf);
    if (pages > 2) failed = true;
    console.log(`${pages > 2 ? "✗" : "✓"} ${job.file} — ${pages} page(s)`);
  }
  await browser.close();
  if (failed) process.exitCode = 1;
} finally {
  // `shell: true` wraps next in a shell; kill the whole tree on Windows.
  if (process.platform === "win32") spawn("taskkill", ["/pid", String(server.pid), "/T", "/F"], { stdio: "ignore" });
  else server.kill();
}
