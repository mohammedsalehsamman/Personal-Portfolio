"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { PerformanceMonitor } from "@react-three/drei";
import { Bloom, ChromaticAberration, EffectComposer, Noise, Vignette } from "@react-three/postprocessing";
import { BlendFunction } from "postprocessing";
import { useEffect, useMemo, useRef, useState } from "react";
import * as THREE from "three";
import { generators, palettes, rng } from "@/lib/shapes";
import { SHAPES, detectTier, sceneState, type Tier } from "@/lib/scene-state";

const vertex = /* glsl */ `
  attribute vec3 aP1; attribute vec3 aP2; attribute vec3 aP3; attribute vec3 aP4;
  attribute vec3 aP5; attribute vec3 aP6; attribute vec3 aP7;
  attribute float aRand;
  uniform float uMorph, uTime, uSize, uPixelRatio, uDim, uMouseStrength;
  // -1: text occupies the screen's left half, +1: the right half, 0: no text side.
  uniform float uTextSide;
  uniform vec3 uMouse, uColorA, uColorB, uColorC;
  varying vec3 vColor;
  varying float vAlpha;

  vec3 pick(float i) {
    return position * (1.0 - step(0.5, abs(i - 0.0)))
      + aP1 * (1.0 - step(0.5, abs(i - 1.0))) + aP2 * (1.0 - step(0.5, abs(i - 2.0)))
      + aP3 * (1.0 - step(0.5, abs(i - 3.0))) + aP4 * (1.0 - step(0.5, abs(i - 4.0)))
      + aP5 * (1.0 - step(0.5, abs(i - 5.0))) + aP6 * (1.0 - step(0.5, abs(i - 6.0)))
      + aP7 * (1.0 - step(0.5, abs(i - 7.0)));
  }

  vec3 flow(vec3 p) {
    return vec3(
      sin(p.y * 1.7 + uTime * 0.9) + sin(p.z * 2.3 - uTime * 0.6),
      sin(p.z * 1.9 + uTime * 0.7) + sin(p.x * 1.3 + uTime * 0.8),
      sin(p.x * 2.1 - uTime * 0.5) + sin(p.y * 1.1 + uTime * 0.9)
    ) * 0.5;
  }

  void main() {
    float base = floor(uMorph);
    float f = uMorph - base;
    float delay = aRand * 0.4;
    float lf = smoothstep(delay, delay + 0.6, f);
    vec3 p = mix(pick(base), pick(min(base + 1.0, 7.0)), lf);

    float transit = sin(lf * 3.14159);
    p += flow(p * 0.7) * transit * 1.1;
    p += 0.035 * vec3(sin(uTime * 1.3 + aRand * 40.0), cos(uTime * 1.1 + aRand * 30.0), sin(uTime * 0.9 + aRand * 20.0));

    vec4 world = modelMatrix * vec4(p, 1.0);
    vec2 d = world.xy - uMouse.xy;
    float dist = length(d);
    world.xy += normalize(d + 1e-4) * smoothstep(1.4, 0.0, dist) * 0.55 * uMouseStrength;

    vec4 mv = viewMatrix * world;
    gl_Position = projectionMatrix * mv;
    gl_PointSize = uSize * (0.55 + aRand * 0.9) * uPixelRatio / -mv.z;

    float h = clamp(p.y * 0.17 + 0.5, 0.0, 1.0);
    vColor = mix(uColorA, uColorB, h);
    vColor = mix(vColor, uColorC, step(0.97, aRand));
    vAlpha = uDim * (0.28 + 0.42 * aRand) * (1.0 + transit * 0.35);

    // Particles that drift into the text half fade out, so copy always stays readable.
    float textSide = (gl_Position.x / gl_Position.w) * uTextSide;
    vAlpha *= mix(1.0, 0.15, smoothstep(0.0, 0.35, textSide));
  }
`;

const fragment = /* glsl */ `
  varying vec3 vColor;
  varying float vAlpha;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    float a = smoothstep(0.5, 0.05, d);
    if (a < 0.01) discard;
    gl_FragColor = vec4(vColor, a * vAlpha);
  }
`;

const smooth = (e0: number, e1: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
  return t * t * (3 - 2 * t);
};
const damp = (a: number, b: number, lambda: number, dt: number) => a + (b - a) * (1 - Math.exp(-lambda * dt));

/** Reads [data-shape] sections and returns a fractional shape index plus layout hints. */
function readChapter(narrow: boolean) {
  const vh = window.innerHeight;
  const center = vh / 2;
  const els = Array.from(document.querySelectorAll<HTMLElement>("[data-shape]"));
  if (!els.length) return null;
  const pts = els.map((el) => {
    const r = el.getBoundingClientRect();
    return {
      c: r.top + r.height / 2,
      shape: Number(el.dataset.shape),
      offset: Number(el.dataset.offset ?? 0),
      dim: Number(el.dataset.dim ?? 1),
      y: Number((narrow ? el.dataset.yMobile : undefined) ?? el.dataset.y ?? 0),
    };
  });
  let i = 0;
  while (i < pts.length - 1 && pts[i + 1].c <= center) i++;
  const a = pts[i];
  const b = pts[Math.min(i + 1, pts.length - 1)];
  const raw = a === b || center <= a.c ? 0 : (center - a.c) / (b.c - a.c);
  const t = smooth(0.2, 0.8, raw);
  const mix = (x: number, y: number) => x + (y - x) * t;
  return { shape: mix(a.shape, b.shape), offset: mix(a.offset, b.offset), dim: mix(a.dim, b.dim), y: mix(a.y, b.y) };
}

// Camera stops per shape; the camera glides along a spline through them.
const cameraStops = [
  [0, 0, 9.2], [0.8, 0.4, 8.2], [-0.4, 1.7, 8.6], [0.4, -0.4, 8.2],
  [0, 0.4, 9.6], [1.6, 1.0, 8.4], [-0.4, 0.2, 7.4], [0, 0, 9.4],
].map(([x, y, z]) => new THREE.Vector3(x, y, z));
const cameraPath = new THREE.CatmullRomCurve3(cameraStops, false, "centripetal");

// Scratch vectors reused every frame (no per-frame allocation).
const tmp = { v: new THREE.Vector3(), dir: new THREE.Vector3() };

const colorsA = palettes.map((p) => new THREE.Color(p[0]));
const colorsB = palettes.map((p) => new THREE.Color(p[1]));
const colorsC = palettes.map((p) => new THREE.Color(p[2]));

function Particles({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null);
  const points = useRef<THREE.Points>(null);
  const live = useRef({ morph: 0, offset: 0, dim: 1, y: 0, mouse: new THREE.Vector3(99, 99, 0), strength: 0 });

  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const shapes = generators.map((gen) => gen(count));
    g.setAttribute("position", new THREE.BufferAttribute(shapes[0], 3));
    for (let k = 1; k < SHAPES.length; k++) g.setAttribute(`aP${k}`, new THREE.BufferAttribute(shapes[k], 3));
    const rand = new Float32Array(count);
    const r = rng(42);
    for (let i = 0; i < count; i++) rand[i] = r();
    g.setAttribute("aRand", new THREE.BufferAttribute(rand, 1));
    g.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);
    return g;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: vertex,
        fragmentShader: fragment,
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: {
          uMorph: { value: 0 },
          uTime: { value: 0 },
          uSize: { value: 70 },
          uPixelRatio: { value: 1 },
          uDim: { value: 1 },
          uTextSide: { value: 0 },
          uMouse: { value: new THREE.Vector3(99, 99, 0) },
          uMouseStrength: { value: 0 },
          uColorA: { value: colorsA[0].clone() },
          uColorB: { value: colorsB[0].clone() },
          uColorC: { value: colorsC[0].clone() },
        },
      }),
    [],
  );

  useEffect(() => {
    sceneState.ready = true;
    window.dispatchEvent(new Event("scene:ready"));
    return () => {
      geometry.dispose();
      material.dispose();
    };
  }, [geometry, material]);

  useFrame((state, dt) => {
    const { camera, viewport, size } = state;
    const mat = points.current?.material as THREE.ShaderMaterial | undefined;
    if (!mat) return;
    const d = Math.min(dt, 1 / 20);
    const L = live.current;
    const narrow = size.width < 820;
    const target =
      sceneState.mode === "fixed" ? sceneState.fixed : readChapter(narrow) ?? { shape: 0, offset: 0, dim: 1, y: 0 };
    const instant = sceneState.reducedMotion;
    const lam = instant ? 1000 : 3.2;
    L.morph = damp(L.morph, target.shape, lam, d);
    L.offset = damp(L.offset, narrow ? 0 : target.offset, lam, d);
    L.dim = damp(L.dim, narrow ? Math.min(target.dim, 0.55) : target.dim, lam, d);
    L.y = damp(L.y, target.y, lam, d);

    const u = mat.uniforms;
    u.uMorph.value = Math.min(Math.max(L.morph, 0), SHAPES.length - 1);
    u.uTime.value = instant ? 0 : state.clock.elapsedTime;
    u.uPixelRatio.value = state.gl.getPixelRatio();
    u.uDim.value = L.dim;
    u.uSize.value = narrow ? 52 : 70;
    // Text sits opposite the object; the value is continuous so the mask glides between chapters.
    u.uTextSide.value = narrow ? 0 : -L.offset * (sceneState.rtl ? -1 : 1);

    // palette follows the morph
    const lo = Math.floor(u.uMorph.value);
    const hi = Math.min(lo + 1, SHAPES.length - 1);
    const f = u.uMorph.value - lo;
    u.uColorA.value.copy(colorsA[lo]).lerp(colorsA[hi], f);
    u.uColorB.value.copy(colorsB[lo]).lerp(colorsB[hi], f);
    u.uColorC.value.copy(colorsC[lo]).lerp(colorsC[hi], f);

    // camera rides the spline; a slight push-in mid-transition feels like a fly-through
    const pathT = u.uMorph.value / (SHAPES.length - 1);
    cameraPath.getPointAt(Math.min(Math.max(pathT, 0), 1), tmp.v);
    const push = Math.sin((u.uMorph.value % 1) * Math.PI) * 0.9;
    const px = sceneState.pointer.x * 0.35;
    const py = sceneState.pointer.y * 0.25;
    camera.position.set(tmp.v.x + px, tmp.v.y + py, tmp.v.z - push);
    camera.lookAt(0, 0, 0);

    if (group.current) {
      const side = sceneState.rtl ? -1 : 1;
      // Desktop: keep the whole object inside its half of the screen at any width.
      group.current.position.x = L.offset * side * viewport.width * 0.27;
      group.current.position.y = L.y;
      group.current.scale.setScalar(narrow ? 0.62 : Math.min(1, (viewport.width * 0.42) / 6.4));
      // gentle sway (never edge-on, so the monogram stays legible)
      const t = instant ? 0 : state.clock.elapsedTime;
      group.current.rotation.y = Math.sin(t * 0.18) * 0.45 + sceneState.pointer.x * 0.12;
      group.current.rotation.x = Math.sin(t * 0.13) * 0.08 - sceneState.pointer.y * 0.06;
    }

    // pointer → world point on z=0 plane for the repel effect
    if (sceneState.pointer.active && !narrow) {
      tmp.v.set(sceneState.pointer.x, sceneState.pointer.y, 0.5).unproject(camera);
      tmp.dir.copy(tmp.v).sub(camera.position).normalize();
      const dist = -camera.position.z / tmp.dir.z;
      L.mouse.copy(camera.position).addScaledVector(tmp.dir, dist);
      L.strength = damp(L.strength, 1, 4, d);
    } else {
      L.strength = damp(L.strength, 0, 4, d);
    }
    u.uMouse.value.copy(L.mouse);
    u.uMouseStrength.value = L.strength;
  });

  return (
    <group ref={group}>
      <points ref={points} geometry={geometry} material={material} frustumCulled={false} />
    </group>
  );
}

function Stars({ count }: { count: number }) {
  const geometry = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const p = new Float32Array(count * 3);
    const r = rng(99);
    for (let i = 0; i < count; i++) {
      p[i * 3] = (r() - 0.5) * 60;
      p[i * 3 + 1] = (r() - 0.5) * 40;
      p[i * 3 + 2] = -10 - r() * 30;
    }
    g.setAttribute("position", new THREE.BufferAttribute(p, 3));
    return g;
  }, [count]);
  return (
    <points geometry={geometry} frustumCulled={false}>
      <pointsMaterial size={0.06} color="#9fb3c8" transparent opacity={0.5} depthWrite={false} sizeAttenuation />
    </points>
  );
}

export default function Scene() {
  // Client-only component (loaded with ssr:false), so the device can be probed on first render.
  const [tier, setTier] = useState<Tier>(detectTier);
  const high = tier === "high";

  return (
    <Canvas
      className="!fixed inset-0 -z-10"
      style={{ position: "fixed", pointerEvents: "none" }}
      dpr={high ? [1, 1.75] : [1, 1.25]}
      camera={{ fov: 45, position: [0, 0, 9.2], near: 0.1, far: 100 }}
      gl={{ antialias: false, alpha: true, powerPreference: "high-performance" }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setTier("low")} />
      <Particles key={tier} count={high ? 42000 : 16000} />
      <Stars count={high ? 1400 : 600} />
      {high && (
        <EffectComposer multisampling={0}>
          <Bloom intensity={0.5} luminanceThreshold={0.35} luminanceSmoothing={0.3} mipmapBlur />
          <ChromaticAberration offset={new THREE.Vector2(0.0006, 0.0008)} radialModulation={false} modulationOffset={0} blendFunction={BlendFunction.NORMAL} />
          <Vignette eskil={false} offset={0.2} darkness={0.75} />
          <Noise opacity={0.035} blendFunction={BlendFunction.SOFT_LIGHT} />
        </EffectComposer>
      )}
    </Canvas>
  );
}
