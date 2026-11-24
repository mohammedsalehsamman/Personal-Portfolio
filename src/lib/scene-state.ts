/**
 * Mutable state shared by the DOM and the WebGL scene without React re-renders.
 * The DOM writes (scroll chapter, pointer); the render loop reads every frame.
 */
export const SHAPES = ["neural", "bloom", "candles", "graph", "globe", "chain", "knot", "monogram"] as const;
export type ShapeName = (typeof SHAPES)[number];
export const shapeIndex = (s: ShapeName) => SHAPES.indexOf(s);

export type Tier = "high" | "low";

export const sceneState = {
  /** "scroll": derive the shape from [data-shape] sections; "fixed": use `fixed`. */
  mode: "scroll" as "scroll" | "fixed",
  fixed: { shape: 0, offset: 0, dim: 1, y: 0 },
  /** Pointer in normalised device coordinates (-1..1). */
  pointer: { x: 0, y: 0, active: false },
  reducedMotion: false,
  rtl: false,
  ready: false,
};

export function detectTier(): Tier {
  if (typeof window === "undefined") return "low";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory ?? 8;
  return coarse || cores <= 4 || memory <= 4 ? "low" : "high";
}
