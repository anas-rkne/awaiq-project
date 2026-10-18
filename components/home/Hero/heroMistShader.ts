import { heroSceneConfig } from "@/config/site";

/**
 * The ONE procedural mist — a domain-warped FBM bank exposed as a raw fragment
 * source so it can be drawn as a fullscreen scene layer inside the hands WebGL
 * scene (a RESTING background). It runs on `gl_FragCoord`, so the identical
 * source would render identically in any host.
 *
 * `heroMistBackgroundFragment()` — a constant, slowly-drifting bank for a
 * resting background, driven by `uIntensity`.
 */

function hexToUnit(hex: string): string {
  const h = hex.replace("#", "");
  const n = h.length === 3 ? h[0] + h[0] + h[1] + h[1] + h[2] + h[2] : h;
  const r = parseInt(n.slice(0, 2), 16) / 255;
  const g = parseInt(n.slice(2, 4), 16) / 255;
  const b = parseInt(n.slice(4, 6), 16) / 255;
  return `vec3(${r.toFixed(4)}, ${g.toFixed(4)}, ${b.toFixed(4)})`;
}

/** Tuning constants + palette baked from config — one shader, tuned centrally. */
function mistConstants(): string {
  const m = heroSceneConfig.mist;
  return `const float SCALE = ${m.scale.toFixed(4)};
const float COVER = ${m.coverage.toFixed(4)};
const float SOFT = ${m.softness.toFixed(4)};
const float FILL = ${m.fill.toFixed(4)};
const float MAX_OP = ${m.maxOpacity.toFixed(4)};
const float ROLL = ${m.roll.toFixed(4)};

const vec3 C_BODY = ${hexToUnit(m.colors.body)};
const vec3 C_SHEEN = ${hexToUnit(m.colors.sheen)};
const vec3 C_SHADOW = ${hexToUnit(m.colors.shadow)};`;
}

/** The shared noise field: value-noise FBM + one domain warp. */
const MIST_NOISE = `
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

// Domain warp — pillowy, organic edges (a bank, not etched noise lattice).
float warp(vec2 p) {
  vec2 q = vec2(fbm(p), fbm(p + vec2(7.3, 2.1)));
  return fbm(p + 3.4 * q);
}
`;

/** A constant, slowly-drifting bank for a RESTING background (`uIntensity`). */
export function heroMistBackgroundFragment(): string {
  return `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uIntensity;

${mistConstants()}
${MIST_NOISE}
void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;
  vec2 q = (uv - 0.5) * vec2(aspect, 1.0);

  // No progress here: the bank breathes upward at a constant, slow rate.
  vec2 fp = q * SCALE + vec2(uTime * 0.01, -uTime * 0.012);
  float n = warp(fp);
  float n2 = warp(fp * 1.8 + 17.0);
  float density = mix(n, n2, 0.4);

  float tex = smoothstep(COVER, COVER + SOFT, density);
  float alpha = (FILL + (1.0 - FILL) * tex) * clamp(uIntensity, 0.0, 1.0) * MAX_OP;

  float crest = smoothstep(0.65, 0.95, density);
  vec3 col = mix(C_SHADOW, C_BODY, smoothstep(0.25, 0.8, density));
  col = mix(col, C_SHEEN, crest * 0.22);

  gl_FragColor = vec4(col, alpha);
}
`;
}
