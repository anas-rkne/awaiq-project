/**
 * The "unwoven" ribbon shaders — ported from the MIT-licensed unwoven demo
 * by Clément Grellier (https://github.com/clementgrellier/unwoven).
 *
 * Each card is a stack of horizontal ribbons. The vertex shader displaces each
 * ribbon by how far it sits into a tear zone (the viewport edges), giving every
 * thread its own escape speed, drift and flutter. The fragment shader keeps the
 * ribbon geometry a fixed height but shrinks the *visible* band inside it, so
 * the card is perfectly gapless when woven and antialiased when it comes apart.
 */

export const unwovenVertex = /* glsl */ `
  attribute float aThread;
  attribute float aRim;
  uniform float uTime;
  uniform float uHalfWidth;
  uniform float uZone;
  uniform float uStrength;
  uniform float uWobble;
  uniform float uSeed;
  varying vec2  vUv;
  varying float vTear;
  varying float vRim;
  varying float vRandom;

  float hash(float n) {
    return fract(sin(n * 127.1 + 311.7) * 43758.5453);
  }

  void main() {
    vUv = uv;
    vRim = aRim;

    vec4 world = modelMatrix * vec4(position, 1.0);
    float x = world.x;

    float left  = 1.0 - smoothstep(-uHalfWidth, -uHalfWidth + uZone, x);
    float right = smoothstep(uHalfWidth - uZone, uHalfWidth, x);
    float tear  = max(left, right) * uStrength;

    float direction = x < 0.0 ? -1.0 : 1.0;
    float randomA = hash(aThread + uSeed * 57.0);
    float randomB = hash(aThread * 3.7 + uSeed * 91.0);
    vRandom = randomA;

    float t = pow(tear, 1.4);

    float run = t * (60.0 + randomA * 420.0);
    run *= 0.85 + 0.15 * sin(uTime * (1.0 + randomB * 2.0) + randomA * 6.2831);
    world.x += direction * run;

    world.y += (randomA - 0.5) * 170.0 * t * t;

    world.y += sin(world.x * 0.02 + uTime * (1.6 + randomA * 2.2) + randomA * 6.2831)
              * (5.0 + 13.0 * randomA) * t * uWobble;

    vTear = tear;
    gl_Position = projectionMatrix * viewMatrix * world;
  }
`;

export const unwovenFragment = /* glsl */ `
  precision highp float;
  uniform sampler2D uMap;
  uniform vec2  uCardSize;
  uniform float uRadius;
  uniform float uImageAspect;
  varying vec2  vUv;
  varying float vTear;
  varying float vRim;
  varying float vRandom;

  float sdRoundBox(vec2 p, vec2 b, float r) {
    vec2 q = abs(p) - b + r;
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - r;
  }

  void main() {
    float tear = vTear;
    float rim  = abs(vRim);

    float coreWidth = mix(0.8, 0.16 + vRandom * 0.12, smoothstep(0.0, 0.85, tear));
    float threadAlpha = 1.0 - smoothstep(coreWidth - 0.10, coreWidth + 0.06, rim);
    threadAlpha = mix(1.0, threadAlpha, smoothstep(0.03, 0.30, tear));

    vec2 p = (vUv - 0.5) * uCardSize;
    float cardAlpha = 1.0 - smoothstep(-1.5, 0.5, sdRoundBox(p, uCardSize * 0.5, uRadius));

    float fade  = 1.0 - smoothstep(0.75, 1.0, tear) * 0.65;
    float alpha = cardAlpha * threadAlpha * fade;
    if (alpha < 0.003) discard;

    float cardAspect = uCardSize.x / uCardSize.y;
    vec2 scale = cardAspect > uImageAspect
      ? vec2(1.0, uImageAspect / cardAspect)
      : vec2(cardAspect / uImageAspect, 1.0);
    vec3 color = texture2D(uMap, (vUv - 0.5) * scale + 0.5).rgb;

    color *= 1.0 - tear * 0.4 * rim * rim;
    color += tear * 0.18 * (1.0 - smoothstep(0.0, 0.45, rim));
    color = mix(color, vec3(1.0), smoothstep(0.55, 1.0, tear) * 0.8);

    gl_FragColor = vec4(color, alpha);
  }
`;
