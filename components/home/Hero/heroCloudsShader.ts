import { heroSceneConfig } from "@/config/site";

/**
 * The procedural clouds — raw WebGL fragment source for the page-wide sky:
 *
 * - `heroCloudsFragment` — the BASE sky (the atmosphere drawn by
 *   `GlobalSkyLayer`): FBM + domain-warped blobs, soft and airy, colored from
 *   `clouds.colors`. Centers are uniforms (desktop / mobile) so a breakpoint
 *   switch only uploads two vec2s — no recompile, no flash.
 *
 * It runs on `gl_FragCoord`, so the same source renders identically as a DOM
 * canvas or as a fullscreen scene layer inside a WebGL scene. The mist
 * (`heroSceneConfig.mist`) is a separate shader reserved for the hands
 * finale's resting bank.
 */

/** Shared GLSL: value noise → FBM → domain warp. One text, two skies. */
const GLSL_COMMON = `
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
  for (int i = 0; i < 5; i++) {
    v += a * noise(p);
    p = rot * p * 2.0;
    a *= 0.5;
  }
  return v;
}

// Domain warp — pillowy, organic edges. This is what reads as "cloud",
// not etching the noise lattice.
float warp(vec2 p) {
  vec2 q = vec2(fbm(p), fbm(p + vec2(7.3, 2.1)));
  return fbm(p + 3.4 * q);
}
`;

export const heroCloudsVertex = `
  attribute vec2 aPosition;
  void main() {
    gl_Position = vec4(aPosition, 0.0, 1.0);
  }
`;

export function heroCloudsFragment(): string {
  const c = heroSceneConfig.clouds;
  return `
precision highp float;

uniform vec2 uResolution;
uniform float uTime;
uniform float uOpacity;
uniform float uDriftA;
uniform float uDriftB;
uniform vec2 uCenterA;
uniform vec2 uCenterB;

// Layer constants baked from config — one shader, tuned centrally.
// (Centers moved to uniforms: uCenterA / uCenterB — viewport-frame aware.)
const float RADIUS_A = ${c.layerA.radius.toFixed(3)};
const float SCALE_A = ${c.layerA.scale.toFixed(3)};
const float COVER_A = ${c.layerA.coverage.toFixed(3)};

const float RADIUS_B = ${c.layerB.radius.toFixed(3)};
const float SCALE_B = ${c.layerB.scale.toFixed(3)};
const float COVER_B = ${c.layerB.coverage.toFixed(3)};

// Palette.
const vec3 COLOR_BODY = vec3(0.964, 0.902, 0.839);   // #f6e6d6
const vec3 COLOR_SHEEN = vec3(0.804, 0.620, 0.380);  // #cd9e61
const vec3 COLOR_SHADOW = vec3(0.184, 0.306, 0.471); // #2f4e78
${GLSL_COMMON}
float layer(vec2 p, float scale, float seed) {
  vec2 q = p * scale + vec2(seed, seed * 0.7);
  q.x += uTime * 0.02;
  q.y += uTime * 0.006;
  return warp(q);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uResolution;
  float aspect = uResolution.x / uResolution.y;

  // Screen px drift -> UV offset, mirrored from the old GSAP parallax.
  float driftA = uDriftA / uResolution.x;
  float driftB = uDriftB / uResolution.x;

  vec2 pA = (uv - uCenterA) * vec2(aspect, 1.0);
  pA.x -= driftA * aspect;
  vec2 pB = (uv - uCenterB) * vec2(aspect, 1.0);
  pB.x -= driftB * aspect;

  // Soft round falloff per layer — the "island" of cloud in the sky.
  float falloffA = smoothstep(RADIUS_A, RADIUS_A * 0.25, length(pA));
  float falloffB = smoothstep(RADIUS_B, RADIUS_B * 0.3, length(pB));

  float nA = layer(pA, SCALE_A, 3.7);
  float alphaA = smoothstep(COVER_A, COVER_A + 0.22, nA) * falloffA;

  float nB = layer(pB, SCALE_B, 11.0);
  float alphaB = smoothstep(COVER_B, COVER_B + 0.22, nB) * falloffB;

  // Ambient haze, denser at the top seam, dissolves toward the bottle.
  vec2 pH = (uv - vec2(0.5, -0.1)) * vec2(aspect, 1.0) * 1.4;
  float nH = layer(pH, 0.9, 5.1);
  float haze = smoothstep(0.55, 0.72, nH) * smoothstep(0.0, 0.35, uv.y);

  // One color pass — body with a warm sheen on lit crests.
  vec3 col = COLOR_BODY + COLOR_SHEEN * 0.15;

  float alpha = max(haze * 0.35, max(alphaA, alphaB)) * uOpacity;

  gl_FragColor = vec4(col, alpha);
}
`;
}
