"use client";

import { useEffect } from "react";
import { sceneState } from "@/lib/scene-state";

/** Pins the particle scene to one shape while mounted (case-study pages). */
export function SceneDirector({ shape, offset = 0.6, dim = 0.35, y = 0 }: { shape: number; offset?: number; dim?: number; y?: number }) {
  useEffect(() => {
    sceneState.mode = "fixed";
    sceneState.fixed = { shape, offset, dim, y };
    return () => {
      sceneState.mode = "scroll";
    };
  }, [shape, offset, dim, y]);
  return null;
}
