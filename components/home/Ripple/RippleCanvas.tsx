"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { rippleConfig } from "@/config/site";
import { rippleVertex, rippleFragment } from "./rippleShaders";

/**
 * WebGL layer that refracts the banner image like water.
 *
 * A single full-screen quad runs the ripple shader. The ripple strength is
 * driven by the SCROLL VELOCITY (px/s, read off the — Lenis-smoothed — window
 * scroll each frame): fast scroll agitates the water, stopping lets it ease
 * back to a slow ambient breathing. Transparent until the texture loads, so the
 * plain `<img>` underneath shows first; opaque once it renders, hiding it.
 */
export function RippleCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (reduceMotion) return;

    const cfg = rippleConfig;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    // Transparent until the texture is ready, so the <img> beneath shows first.
    const renderer = new THREE.WebGLRenderer({ antialias: false, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uImageResolution: {
        value: new THREE.Vector2(cfg.imageSize.width, cfg.imageSize.height),
      },
      uTime: { value: 0 as number },
      uRipple: { value: cfg.idleRipple as number },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader: rippleVertex,
      fragmentShader: rippleFragment,
      uniforms,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    let alive = true;
    let inView = true;
    let ripple: number = cfg.idleRipple;
    let prevY = window.scrollY;

    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    loader.load(
      cfg.image,
      (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        // No colour-space decode: the shader writes the sampled bytes straight
        // through, so the canvas matches the plain <img> exactly.
        tex.colorSpace = THREE.NoColorSpace;
        uniforms.uTexture.value = tex;
      },
      undefined,
      () => {
        // Image failed — keep the canvas transparent so the <img> stays.
        alive = false;
      },
    );

    const resize = () => {
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
    };

    const tick = (time: number, deltaMS: number) => {
      const dt = Math.max(1, deltaMS);
      const y = window.scrollY;
      const velocity = Math.abs(y - prevY) / (dt / 1000);
      prevY = y;

      // Ease every frame so the ripple always settles to idle — even while the
      // section is off-screen — and never re-enters mid-swell.
      const target = inView
        ? THREE.MathUtils.clamp(
            velocity * cfg.velocityScale,
            cfg.idleRipple,
            cfg.maxRipple,
          )
        : cfg.idleRipple;
      const k = 1 - Math.exp((-cfg.ease * dt) / 1000);
      ripple += (target - ripple) * k;

      if (!alive || !inView || !uniforms.uTexture.value) return;

      uniforms.uRipple.value = ripple;
      uniforms.uTime.value = time;
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    const io = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
      },
      { rootMargin: "120px" },
    );
    io.observe(container);
    resize();

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      io.disconnect();
      uniforms.uTexture.value?.dispose();
      material.dispose();
      geometry.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0" aria-hidden="true" />
  );
}
