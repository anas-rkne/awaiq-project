import { heroSceneConfig } from "@/config/site";

/**
 * The hero's INCENSE sky — raw WebGL fragment source (one generator), in the
 * `HeroClouds` / `heroMistShader` house style: it runs on `gl_FragCoord`, so
 * the identical source renders identically in any host. All tuning constants
 * are baked from `heroSceneConfig.incense` (one shader, tuned centrally);
 * viewport-dependent values — the thread centers/radii and the dust-horizon
 * line — are UNIFORMS, so a breakpoint switch uploads a few floats on the
 * live program and never recompiles (the house invariant: no flash).
 *
 * Three fields, composited back to front (premultiplied accumulator):
 * - the GOLDEN DUST HORIZON — a warm gaussian band of slow FBM haze low in
 *   the frame: the glowing ground the stage stands on;
 * - two RISING SMOKE THREADS — domain-warped density advecting upward inside
 *   a thin ribbon that bends as it rises (anchored at a breathing ember at
 *   the foot): incense off the dust;
 * - GOLD MOTES — two parallax fields of sparse twinkling specks (near, pale /
 *   far, gold) drifting upward — dust caught in the light.
 */

/** The fullscreen triangle (a coverage primitive, not a mesh). */
export const heroIncenseVertex = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

/** `#rrggbb` → a GLSL vec3 literal, so the palette lives in ONE place. */
const hexVec3 = (hex: string) => {
  const n = parseInt(hex.replace("#", ""), 16);
  const ch = (shift: number) => (((n >> shift) & 255) / 255).toFixed(4);
  return `vec3(${ch(16)}, ${ch(8)}, ${ch(0)})`;
};

export function heroIncenseFragment(): string {
  const c = heroSceneConfig.incense;
  const [a, b] = c.threads;

  return `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uOpacity;
uniform vec2 uCenterA;
uniform float uRadiusA;
uniform vec2 uCenterB;
uniform float uRadiusB;
uniform float uHazeY;

// Layer constants baked from config — one shader, tuned centrally.
const float HAZE_BAND = 0.17;
const float HAZE_SCALE = 1.7;
const float HAZE_STRENGTH = ${c.haze.strength.toFixed(3)};

const float THREAD_EXTENT = 0.3;
const float THREAD_SCALE = 2.4;
const float THREAD_COVER = 0.48;
const float STRENGTH_A = ${a.strength.toFixed(3)};
const float SWAY_A = ${a.sway.toFixed(3)};
const float SPEED_A = ${a.speed.toFixed(3)};
const float SEED_A = ${a.seed.toFixed(3)};
const float STRENGTH_B = ${b.strength.toFixed(3)};
const float SWAY_B = ${b.sway.toFixed(3)};
const float SPEED_B = ${b.speed.toFixed(3)};
const float SEED_B = ${b.seed.toFixed(3)};

const float MOTE_STRENGTH = ${c.motes.strength.toFixed(3)};

// Palette — the shared incense palette (incense.colors).
const vec3 C_BODY = ${hexVec3(c.colors.body)};
const vec3 C_SHEEN = ${hexVec3(c.colors.sheen)};

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}

float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
    u.y
  );
}

float fbm(vec2 p) {
  float v = 0.0;
  float a = 0.5;
  mat2 rot = mat2(0.8, 0.6, -0.6, 0.8);
  for (int i = 0; i < 4; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

// Domain warp — pillowy, organic edges (smoke, not etched noise lattice).
float warp(vec2 p) {
  vec2 q = vec2(fbm(p), fbm(p + vec2(7.3, 2.1)));
  return fbm(p + 3.4 * q);
}

// One smoke thread: a thin ribbon whose density advects upward, bending as
// it rises (the sway is anchored at the foot, so the ember never wanders),
// with a small warm glow breathing at the base. Straight-alpha "over" into
// the premultiplied accumulator, like every field here.
void addThread(
  inout vec3 pm,
  inout float alpha,
  vec2 uv,
  float aspect,
  vec2 center,
  float radius,
  float strength,
  float sway,
  float speed,
  float seed
) {
  vec2 p = (uv - center) * vec2(aspect, 1.0);
  float rise = clamp((p.y + THREAD_EXTENT) / (2.0 * THREAD_EXTENT), 0.0, 1.0);

  p.x -= sin(p.y * 6.0 - uTime * 0.45 + seed) * sway * rise
       + sin(p.y * 2.3 + uTime * 0.3 + seed * 1.7) * sway * rise * 0.6;

  float ribbon = smoothstep(radius, radius * 0.35, abs(p.x));
  float vert = smoothstep(THREAD_EXTENT, THREAD_EXTENT * 0.3, abs(p.y));
  float n = warp(
    p * THREAD_SCALE + vec2(seed, seed * 0.7 + -uTime * speed)
  );
  float body = smoothstep(THREAD_COVER, THREAD_COVER + 0.2, n);
  float aT = ribbon * vert * body * strength;

  // More golden low in the column, paler as it thins out rising.
  vec3 cT = mix(C_SHEEN, C_BODY, smoothstep(0.0, 0.8, rise * (0.65 + 0.35 * body)));

  pm += cT * aT * (1.0 - alpha);
  alpha += aT * (1.0 - alpha);

  // The ember at the foot — the incense tip, breathing.
  float foot = length(vec2(p.x * 1.4, p.y + THREAD_EXTENT));
  float ember = exp(-foot * 30.0) * (0.75 + 0.25 * sin(uTime * 0.9 + seed));
  float aE = ember * strength;

  pm += C_SHEEN * aE * (1.0 - alpha);
  alpha += aE * (1.0 - alpha);
}

// One field of sparse twinkling motes: a tiny dot per (mostly empty) cell,
// placed at a seeded offset, breathing on its own phase.
float moteField(vec2 p, float seed, float dotSize) {
  vec2 cell = floor(p);
  vec2 f = fract(p) - 0.5;
  float h = hash(cell + vec2(seed, seed * 1.3));
  float on = step(0.82, h);
  vec2 off = (vec2(
    hash(cell + vec2(seed + 13.1, 0.0)),
    hash(cell + vec2(0.0, seed + 27.7))
  ) - 0.5) * 0.66;
  float spark = smoothstep(dotSize, 0.0, length(f - off));
  float tw = 0.45 + 0.55 * sin(uTime * (0.5 + 1.5 * fract(h * 9.3)) + h * 40.0);
  return on * spark * tw;
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec3 pm = vec3(0.0);
  float alpha = 0.0;

  // 1. GOLDEN DUST HORIZON — the glowing ground, low in the frame.
  {
    vec2 hp = vec2(
      uv.x * aspect * HAZE_SCALE + uTime * 0.02,
      (uv.y - uHazeY) / HAZE_BAND
    );
    float n = warp(hp);
    float band = exp(-hp.y * hp.y);
    float dust = smoothstep(0.38, 0.88, n);
    float aH = band * (0.3 + 0.7 * dust) * HAZE_STRENGTH;
    vec3 cH = mix(C_SHEEN, C_BODY, 0.35 * dust);
    pm += cH * aH * (1.0 - alpha);
    alpha += aH * (1.0 - alpha);
  }

  // 2. THE TWO SMOKE THREADS — incense rising off the dust.
  addThread(pm, alpha, uv, aspect, uCenterA, uRadiusA, STRENGTH_A, SWAY_A, SPEED_A, SEED_A);
  addThread(pm, alpha, uv, aspect, uCenterB, uRadiusB, STRENGTH_B, SWAY_B, SPEED_B, SEED_B);

  // 3. GOLD MOTES — dust caught in the light, sparser toward the top.
  {
    vec2 mn = uv * vec2(aspect, 1.0) * 24.0 + vec2(uTime * 0.012, uTime * 0.035);
    float near = moteField(mn, 1.0, 0.09);
    near *= 0.35 + 0.65 * smoothstep(1.15, 0.15, uv.y);
    float aN = near * MOTE_STRENGTH;
    pm += C_BODY * aN * (1.0 - alpha);
    alpha += aN * (1.0 - alpha);

    vec2 mf = uv * vec2(aspect, 1.0) * 40.0 + vec2(-uTime * 0.007, uTime * 0.018);
    float far = moteField(mf, 5.0, 0.07);
    far *= 0.3 + 0.7 * smoothstep(1.2, 0.1, uv.y);
    float aF = far * MOTE_STRENGTH * 0.6;
    pm += C_SHEEN * aF * (1.0 - alpha);
    alpha += aF * (1.0 - alpha);
  }

  gl_FragColor = vec4(alpha > 0.001 ? pm / alpha : vec3(0.0), alpha * uOpacity);
}
`;
}
