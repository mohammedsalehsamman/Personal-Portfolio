/**
 * Procedural point clouds, one per chapter. Every generator fills exactly `n`
 * points (xyz) inside roughly a ±3.2 unit box so the morph shader can blend
 * any pair. A seeded RNG keeps shapes identical across renders.
 */
type Vec3 = [number, number, number];

export function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

class Cloud {
  readonly data: Float32Array;
  private i = 0;
  constructor(readonly n: number, readonly r: () => number) {
    this.data = new Float32Array(n * 3);
  }
  get full() {
    return this.i >= this.n;
  }
  push(x: number, y: number, z: number) {
    if (this.full) return;
    this.data[this.i * 3] = x;
    this.data[this.i * 3 + 1] = y;
    this.data[this.i * 3 + 2] = z;
    this.i++;
  }
  jitter(s: number) {
    return (this.r() - 0.5) * 2 * s;
  }
  /** Fill what's left by re-using random existing points (keeps counts exact). */
  done() {
    const filled = Math.max(this.i, 1);
    while (!this.full) {
      const k = Math.floor(this.r() * filled);
      this.push(this.data[k * 3] + this.jitter(0.02), this.data[k * 3 + 1] + this.jitter(0.02), this.data[k * 3 + 2] + this.jitter(0.02));
    }
    return this.data;
  }
  line(a: Vec3, b: Vec3, count: number, j = 0.015) {
    for (let k = 0; k < count; k++) {
      const t = this.r();
      this.push(a[0] + (b[0] - a[0]) * t + this.jitter(j), a[1] + (b[1] - a[1]) * t + this.jitter(j), a[2] + (b[2] - a[2]) * t + this.jitter(j));
    }
  }
  ball(c: Vec3, radius: number, count: number) {
    for (let k = 0; k < count; k++) {
      const u = this.r() * 2 - 1;
      const th = this.r() * Math.PI * 2;
      const s = Math.sqrt(1 - u * u);
      const rr = radius * Math.cbrt(this.r());
      this.push(c[0] + rr * s * Math.cos(th), c[1] + rr * u, c[2] + rr * s * Math.sin(th));
    }
  }
}

const gauss = (r: () => number) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

/** 0 — a glowing neural sphere: shell, inner neurons and synapses. */
function neural(n: number) {
  const c = new Cloud(n, rng(1));
  const shell = Math.floor(n * 0.62);
  const golden = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < shell; i++) {
    const y = 1 - (i / (shell - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const R = 2.55 + c.jitter(0.06);
    c.push(Math.cos(th) * rad * R, y * R, Math.sin(th) * rad * R);
  }
  const centers: Vec3[] = Array.from({ length: 14 }, () => {
    const v: Vec3 = [gauss(c.r), gauss(c.r), gauss(c.r)];
    const len = Math.hypot(...v) || 1;
    const R = 0.6 + c.r() * 1.3;
    return [(v[0] / len) * R, (v[1] / len) * R, (v[2] / len) * R];
  });
  for (const ctr of centers) c.ball(ctr, 0.22, Math.floor(n * 0.012));
  for (let k = 0; k < 26; k++) {
    const a = centers[Math.floor(c.r() * centers.length)];
    const b = centers[Math.floor(c.r() * centers.length)];
    if (a !== b) c.line(a, b, Math.floor(n * 0.006), 0.01);
  }
  return c.done();
}

/** 1 — a bouquet: ringed flower heads on a dome, leaves and a wrapping cone outline. */
function bloom(n: number) {
  const c = new Cloud(n, rng(2));
  const heads: { p: Vec3; size: number }[] = [{ p: [0, 1.75, 0.35], size: 0.62 }];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + 0.3;
    heads.push({ p: [Math.cos(a) * 1.35, 1.1 + Math.sin(a) * 0.45, 0.15 + Math.sin(a * 2) * 0.15], size: 0.5 });
  }
  const headPts = Math.floor((n * 0.6) / heads.length);
  for (const h of heads) {
    for (let i = 0; i < headPts; i++) {
      // rose curve petals + concentric rings: reads as a flower from the front
      const th = c.r() * Math.PI * 2;
      const ring = Math.floor(c.r() * 4) / 4 + 0.25;
      const petal = 0.75 + 0.25 * Math.abs(Math.cos(2.5 * th));
      const r = h.size * ring * petal + c.jitter(0.025);
      const depth = -0.25 * (r / h.size) ** 2;
      c.push(h.p[0] + Math.cos(th) * r, h.p[1] + Math.sin(th) * r, h.p[2] + depth + c.jitter(0.03));
    }
    c.ball(h.p, h.size * 0.18, Math.floor(headPts * 0.08));
  }
  // leaves poking out between heads
  for (let k = 0; k < 7; k++) {
    const a = (k / 7) * Math.PI * 2 + 0.7;
    const base: Vec3 = [Math.cos(a) * 1.1, 0.75, 0];
    const tip: Vec3 = [Math.cos(a) * 2.25, 0.95 + Math.sin(a) * 0.9, -0.2];
    for (let i = 0; i < Math.floor(n * 0.011); i++) {
      const t = c.r();
      const w = Math.sin(Math.PI * t) * 0.16;
      c.push(base[0] + (tip[0] - base[0]) * t + c.jitter(w), base[1] + (tip[1] - base[1]) * t + c.jitter(w), base[2] + (tip[2] - base[2]) * t);
    }
  }
  // cone: crisp outline, light fill
  const apex: Vec3 = [0, -2.75, 0.2];
  const rimL: Vec3 = [-2.05, 0.75, 0.2];
  const rimR: Vec3 = [2.05, 0.75, 0.2];
  c.line(apex, rimL, Math.floor(n * 0.035), 0.02);
  c.line(apex, rimR, Math.floor(n * 0.035), 0.02);
  for (let i = 0; i < Math.floor(n * 0.03); i++) {
    const t = c.r();
    c.push(-2.05 + t * 4.1, 0.75 - Math.sin(Math.PI * t) * 0.35 + c.jitter(0.02), 0.2 + c.jitter(0.02));
  }
  for (let i = 0; i < Math.floor(n * 0.07); i++) {
    const t = Math.sqrt(c.r());
    const half = 2.05 * t;
    c.push(c.jitter(half), -2.75 + t * 3.5, 0.2 + c.jitter(0.15));
  }
  // ribbon bow at the waist
  for (let i = 0; i < Math.floor(n * 0.02); i++) {
    const th = c.r() * Math.PI * 2;
    const rr = 0.32 * Math.abs(Math.cos(th));
    c.push(Math.cos(th) * rr * 1.6, -1.15 + Math.sin(th) * rr, 0.35);
  }
  return c.done();
}

/** 2 — a 3D candlestick terrain over a dotted floor. */
function candles(n: number) {
  const c = new Cloud(n, rng(3));
  const rows = 3;
  const cols = 16;
  const bodies: { x: number; z: number; o: number; cl: number; hi: number; lo: number }[] = [];
  for (let r = 0; r < rows; r++) {
    let price = c.jitter(0.4);
    for (let k = 0; k < cols; k++) {
      const o = price;
      const cl = o + gauss(c.r) * 0.32 + 0.045;
      const hi = Math.max(o, cl) + c.r() * 0.25;
      const lo = Math.min(o, cl) - c.r() * 0.25;
      bodies.push({ x: -3.2 + (k / (cols - 1)) * 6.4, z: -1.3 + r * 1.3, o, cl, hi, lo });
      price = cl;
    }
  }
  const floor = Math.floor(n * 0.16);
  for (let i = 0; i < floor; i++) c.push(-3.4 + c.r() * 6.8, -2.1, -2 + c.r() * 4);
  const per = Math.floor((n * 0.8) / bodies.length);
  const w = 0.15;
  for (const b of bodies) {
    const y0 = Math.min(b.o, b.cl) - 0.3;
    const y1 = Math.max(Math.max(b.o, b.cl), Math.min(b.o, b.cl) + 0.08) - 0.3;
    for (let i = 0; i < per * 0.82; i++) {
      // points on the four side faces of the body
      const face = Math.floor(c.r() * 4);
      const u = c.jitter(w);
      const y = y0 + c.r() * (y1 - y0);
      const x = face < 2 ? b.x + (face === 0 ? -w : w) : b.x + u;
      const z = face >= 2 ? b.z + (face === 2 ? -w : w) : b.z + u;
      c.push(x, y, z);
    }
    c.line([b.x, b.lo - 0.3, b.z], [b.x, b.hi - 0.3, b.z], Math.floor(per * 0.18), 0.008);
  }
  return c.done();
}

/** 3 — a claim–evidence knowledge graph: nodes and edges. */
function graph(n: number) {
  const c = new Cloud(n, rng(4));
  const nodes: Vec3[] = Array.from({ length: 28 }, () => [c.jitter(3), c.jitter(2.2), c.jitter(1.8)]);
  const edges: [number, number][] = [];
  nodes.forEach((a, i) => {
    const near = nodes
      .map((b, j) => ({ j, d: Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) }))
      .filter((e) => e.j !== i)
      .sort((x, y) => x.d - y.d)
      .slice(0, 3);
    for (const e of near) if (i < e.j) edges.push([i, e.j]);
  });
  nodes.forEach((nd, i) => c.ball(nd, i % 5 === 0 ? 0.3 : 0.16, Math.floor((n * (i % 5 === 0 ? 0.04 : 0.015)))));
  const per = Math.floor((n * 0.45) / Math.max(edges.length, 1));
  for (const [a, b] of edges) c.line(nodes[a], nodes[b], per, 0.01);
  return c.done();
}

const latLon = (lat: number, lon: number, R: number): Vec3 => {
  const phi = (lat * Math.PI) / 180;
  const th = (-lon * Math.PI) / 180;
  return [R * Math.cos(phi) * Math.cos(th), R * Math.sin(phi), R * Math.cos(phi) * Math.sin(th)];
};

/** 4 — a dotted globe with flight arcs from Damascus to client markets. */
function globe(n: number) {
  const c = new Cloud(n, rng(5));
  const R = 2.3;
  const shell = Math.floor(n * 0.68);
  const golden = Math.PI * (3 - Math.sqrt(5));
  let made = 0;
  for (let i = 0; made < shell && i < shell * 3; i++) {
    const y = 1 - ((i % (shell * 2)) / (shell * 2 - 1)) * 2;
    const rad = Math.sqrt(1 - y * y);
    const th = golden * i;
    const x = Math.cos(th) * rad;
    const z = Math.sin(th) * rad;
    // pseudo-continents: denser where a smooth field is positive
    const field = Math.sin(x * 3.1 + 1.3) * Math.cos(y * 2.7 - 0.4) + Math.sin(z * 2.3 + y * 1.7);
    if (field > 0.15 || c.r() < 0.18) {
      c.push(x * R, y * R, z * R);
      made++;
    }
  }
  const cities: Record<string, [number, number]> = {
    damascus: [33.5, 36.3], riyadh: [24.7, 46.7], dubai: [25.2, 55.3], mecca: [21.4, 39.8],
    istanbul: [41, 29], london: [51.5, -0.1], bangkok: [13.7, 100.5], male: [4.2, 73.5],
  };
  const routes: [string, string][] = [
    ["damascus", "riyadh"], ["damascus", "dubai"], ["dubai", "male"], ["dubai", "london"],
    ["dubai", "bangkok"], ["dubai", "istanbul"], ["dubai", "mecca"],
  ];
  const per = Math.floor((n * 0.3) / routes.length);
  for (const [from, to] of routes) {
    const a = latLon(...cities[from], 1);
    const b = latLon(...cities[to], 1);
    const dot = a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const om = Math.acos(Math.min(1, Math.max(-1, dot)));
    for (let k = 0; k < per; k++) {
      const t = c.r();
      const s = Math.sin(om) || 1;
      const w1 = Math.sin((1 - t) * om) / s;
      const w2 = Math.sin(t * om) / s;
      const lift = R * (1 + 0.28 * om * Math.sin(Math.PI * t));
      c.push((a[0] * w1 + b[0] * w2) * lift, (a[1] * w1 + b[1] * w2) * lift, (a[2] * w1 + b[2] * w2) * lift);
    }
  }
  for (const k of Object.keys(cities)) c.ball(latLon(...cities[k], R), 0.06, Math.floor(n * 0.002));
  return c.done();
}

/** 5 — linked blocks on a helix (wallet / systems). */
function chain(n: number) {
  const c = new Cloud(n, rng(6));
  const blocks = 9;
  const centers: Vec3[] = Array.from({ length: blocks }, (_, k) => {
    const t = k / (blocks - 1);
    const a = t * Math.PI * 2.4;
    return [-3 + t * 6, Math.sin(a) * 1.1, Math.cos(a) * 1.1];
  });
  const s = 0.42;
  const edgesOf = (ctr: Vec3) => {
    const v = [-s, s];
    const out: [Vec3, Vec3][] = [];
    for (const a of v) for (const b of v) {
      out.push([[ctr[0] - s, ctr[1] + a, ctr[2] + b], [ctr[0] + s, ctr[1] + a, ctr[2] + b]]);
      out.push([[ctr[0] + a, ctr[1] - s, ctr[2] + b], [ctr[0] + a, ctr[1] + s, ctr[2] + b]]);
      out.push([[ctr[0] + a, ctr[1] + b, ctr[2] - s], [ctr[0] + a, ctr[1] + b, ctr[2] + s]]);
    }
    return out;
  };
  const perEdge = Math.floor((n * 0.6) / (blocks * 12));
  for (const ctr of centers) {
    for (const [a, b] of edgesOf(ctr)) c.line(a, b, perEdge, 0.008);
    c.ball(ctr, s * 0.7, Math.floor(n * 0.012));
  }
  const perLink = Math.floor((n * 0.22) / (blocks - 1));
  for (let k = 0; k < blocks - 1; k++) c.line(centers[k], centers[k + 1], perLink, 0.03);
  return c.done();
}

/** 6 — a (2,3) torus knot. */
function knot(n: number) {
  const c = new Cloud(n, rng(7));
  const p = 2;
  const q = 3;
  for (let i = 0; i < n; i++) {
    const t = c.r() * Math.PI * 2;
    const r = 1.55 + 0.7 * Math.cos(q * t);
    const center: Vec3 = [r * Math.cos(p * t), 0.7 * Math.sin(q * t) * 1.4, r * Math.sin(p * t)];
    const tube = 0.32 * Math.sqrt(c.r());
    const a = c.r() * Math.PI * 2;
    c.push(center[0] + tube * Math.cos(a), center[1] + tube * Math.sin(a), center[2] + tube * Math.cos(a + 1.3));
  }
  return c.done();
}

/** 7 — "MS" monogram sampled from a 2D canvas. */
function monogram(n: number) {
  const c = new Cloud(n, rng(8));
  if (typeof document === "undefined") return knot(n);
  const W = 640;
  const H = 300;
  const cv = document.createElement("canvas");
  cv.width = W;
  cv.height = H;
  const ctx = cv.getContext("2d");
  if (!ctx) return knot(n);
  ctx.fillStyle = "#fff";
  ctx.font = "800 260px Arial, Helvetica, sans-serif";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("MS", W / 2, H / 2 + 10);
  const px = ctx.getImageData(0, 0, W, H).data;
  const hits: number[] = [];
  for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) if (px[(y * W + x) * 4 + 3] > 128) hits.push(x, y);
  const count = hits.length / 2;
  for (let i = 0; i < n; i++) {
    const k = Math.floor(c.r() * count);
    const x = ((hits[k * 2] - W / 2) / W) * 7.2;
    const y = (-(hits[k * 2 + 1] - H / 2) / W) * 7.2;
    c.push(x + c.jitter(0.02), y + c.jitter(0.02), c.jitter(0.22));
  }
  return c.done();
}

export const generators = [neural, bloom, candles, graph, globe, chain, knot, monogram];

/** Per-shape palette: [base, highlight, sparkle]. */
export const palettes: [string, string, string][] = [
  ["#3fd6c1", "#8b7bff", "#ffffff"], // neural
  ["#c2456b", "#ff9fb8", "#fff4f0"], // bloom (Belle burgundy & rose)
  ["#e0a43a", "#4fe39a", "#fff1c9"], // candles (gold & green)
  ["#6c5cff", "#56c8ff", "#ffffff"], // graph
  ["#2bb6d9", "#7cf2d4", "#ffffff"], // globe
  ["#8b7bff", "#3fd6c1", "#e9e5ff"], // chain
  ["#3fd6c1", "#c7f9ee", "#8b7bff"], // knot
  ["#7cf2d4", "#8b7bff", "#ffffff"], // monogram
];
