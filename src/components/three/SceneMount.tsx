"use client";

import dynamic from "next/dynamic";
import { Component, type ReactNode } from "react";
import { sceneState } from "@/lib/scene-state";

const Scene = dynamic(() => import("./Scene"), { ssr: false });

/** If WebGL is unavailable the site still works — the scene simply isn't drawn. */
class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch() {
    sceneState.ready = true;
    window.dispatchEvent(new Event("scene:ready"));
  }
  render() {
    return this.state.failed ? null : this.props.children;
  }
}

export function SceneMount() {
  return (
    <SceneBoundary>
      <Scene />
    </SceneBoundary>
  );
}
