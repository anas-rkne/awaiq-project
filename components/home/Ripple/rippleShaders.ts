/**
 * Water-ripple banner shaders.
 *
 * The quad fills the viewport in clip space; the fragment shader samples the
 * banner image (cover-fitted) through a stack of layered surface waves, so the
 * picture refracts like water. `uRipple` (driven by scroll velocity) scales how
 * hard the surface is disturbed — 0 would be a flat pane, 1 a fast scroll.
 */

export const rippleVertex = /* glsl */ `
  varying vec2 vUv;

  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const rippleFragment = /* glsl */ `
  precision highp float;

  varying vec2 vUv;
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageResolution;
  uniform float uTime;
  uniform float uRipple;

  /** object-fit: cover — maps the [0,1] screen UV onto the image UV. */
  vec2 coverUv(vec2 uv) {
    float screenAspect = uResolution.x / max(uResolution.y, 1.0);
    float imageAspect = uImageResolution.x / max(uImageResolution.y, 1.0);
    vec2 scale = vec2(1.0);
    if (screenAspect > imageAspect) {
      scale = vec2(1.0, imageAspect / screenAspect);
    } else {
      scale = vec2(screenAspect / imageAspect, 1.0);
    }
    return (uv - 0.5) * scale + 0.5;
  }

  void main() {
    vec2 uv = vUv;
    float t = uTime;
    float r = uRipple;

    // Layered surface waves at different frequencies, drifting over time.
    float w1 = sin(uv.y * 26.0 + t * 1.7 + uv.x * 3.0);
    float w2 = sin(uv.y * 14.0 - t * 1.15);
    float w3 = sin((uv.x + uv.y) * 20.0 + t * 2.3);
    float w4 = cos(uv.x * 32.0 - t * 1.9);

    // Horizontal-dominant refraction — how water actually reads.
    vec2 offset = vec2(
      w1 * 0.45 + w2 * 0.30 + w4 * 0.18,
      w2 * 0.50 + w1 * 0.22 + w3 * 0.16
    );

    vec2 uvR = uv + offset * 0.022 * r;
    vec3 color = texture2D(uTexture, coverUv(uvR)).rgb;

    // A thin specular sheen riding the crests.
    float sheen = (w1 * 0.5 + w2 * 0.5) * 0.5 + 0.5;
    color += sheen * 0.06 * r;

    gl_FragColor = vec4(color, 1.0);
  }
`;
