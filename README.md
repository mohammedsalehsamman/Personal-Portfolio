# Portfolio v2 — Mohammed Saleh Samman

Bilingual (English / Arabic, RTL) cinematic portfolio and the source of the Backend Engineer CV (English + Arabic).

## Stack
Next.js 16 (App Router, Cache Components) · React 19 · TypeScript · Tailwind 4 · three.js + React Three Fiber + postprocessing · GSAP (ScrollTrigger, SplitText) · Lenis.

## Content: one source for the site and the CVs
Everything factual lives in `src/content/`:

| File | What it holds |
|---|---|
| `profile.ts` | name, contacts, headlines, summaries, about, education, skills |
| `experience.ts` | jobs; each bullet is tagged `cv: ["ai" \| "backend"]` |
| `projects.ts` | projects, metrics, images; `cvOrder` / `cvOneLine` control CV placement |
| `case-studies.ts` | problem, architecture flow and key decisions for `/work/[slug]` |
| `ui.ts` | interface strings |

Edit a fact once and it updates the site and both CV PDFs. Only the Backend CV is published (`publishedCvVariants` in `src/content/types.ts`); AI-tagged bullets stay in the data but are not rendered anywhere.

## Commands
```bash
pnpm dev            # local dev at http://localhost:3000
pnpm build          # production build
pnpm lint
pnpm cv:pdf         # after build: renders /[lang]/cv/backend to public/cv/*.pdf (uses Edge)
node scripts/shots.mjs shots   # after build: screenshots of every chapter + console errors
```

## How the 3D scene works
- `src/components/three/Scene.tsx` draws one particle cloud (42k points on capable devices, 16k otherwise) that morphs between 8 procedural shapes (`src/lib/shapes.ts`) in a custom shader.
- Home sections declare `data-shape`, `data-offset`, `data-dim` and `data-y`. Every frame the scene reads where those sections sit in the viewport, so scroll drives the morph, the colour palette and the camera spline.
- Case studies pin one shape through `SceneDirector`.
- `PerformanceMonitor` lowers quality when FPS drops. `prefers-reduced-motion` turns off smooth scroll, the loader, the cursor and all animations. If WebGL fails, the page renders without the scene.

## Deploy
Deploy to Vercel, then set `NEXT_PUBLIC_SITE_URL` to the final domain and update `profile.links.portfolio` (it appears on the CVs). Re-run `pnpm build && pnpm cv:pdf` and commit the new PDFs.
