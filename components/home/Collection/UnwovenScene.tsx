"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import { collectionConfig } from "@/config/site";
import { unwovenVertex, unwovenFragment } from "./unwovenShaders";

/**
 * The "unwoven" product strip — ported from the MIT-licensed unwoven demo by
 * Clément Grellier (https://github.com/clementgrellier/unwoven).
 *
 * Each card is a stack of horizontal ribbons, not a flat quad. Mid-screen the
 * ribbons sit flush and the card reads as one solid picture; toward the edges
 * they slide out at their own speeds, splay, flutter and bleach into the page.
 * The strip is infinite (cards recycle), auto-drifts, and responds to drag.
 *
 * The canvas is transparent (`alpha`) so the page-wide cloud sky
 * (`GlobalSkyLayer`) shows through — the collection floats over the SAME
 * atmosphere as every other section, one continuous identity.
 */

/** A simple gradient plate, used until a real image loads (or if it fails). */
function makePlaceholder(seed: number): HTMLCanvasElement {
  const w = 640;
  const h = 832;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d")!;
  const hue = (seed * 47) % 360;
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0, `hsl(${hue}, 32%, 72%)`);
  grad.addColorStop(1, `hsl(${(hue + 40) % 360}, 38%, 48%)`);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  ctx.globalCompositeOperation = "lighter";
  for (let i = 0; i < 5; i++) {
    const cx = ((seed * (i + 3)) % 100) / 100 * w;
    const cy = ((seed * (i + 7)) % 100) / 100 * h;
    const r = (0.35 + ((seed * (i + 1)) % 50) / 100) * w;
    const blob = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    blob.addColorStop(0, `hsla(${(hue + i * 30) % 360}, 45%, 60%, 0.5)`);
    blob.addColorStop(1, "transparent");
    ctx.fillStyle = blob;
    ctx.fillRect(0, 0, w, h);
  }
  return canvas;
}

/** One shared BufferGeometry; each ribbon owns its own vertices. */
function buildRibbonGeometry(
  width: number,
  height: number,
  threads: number,
  segments: number,
): THREE.BufferGeometry {
  const columns = segments + 1;
  const perThread = columns * 2;
  const total = threads * perThread;

  const positions = new Float32Array(total * 3);
  const uvs = new Float32Array(total * 2);
  const rims = new Float32Array(total);
  const threadIds = new Float32Array(total);
  const indices: number[] = [];

  let v = 0;
  for (let t = 0; t < threads; t++) {
    for (let row = 0; row < 2; row++) {
      const vy = (t + row) / threads;
      for (let c = 0; c < columns; c++) {
        const ux = c / segments;
        positions[v * 3 + 0] = (ux - 0.5) * width;
        positions[v * 3 + 1] = (vy - 0.5) * height;
        positions[v * 3 + 2] = 0;
        uvs[v * 2 + 0] = ux;
        uvs[v * 2 + 1] = vy;
        rims[v] = row === 0 ? -1 : 1;
        threadIds[v] = t;
        v++;
      }
    }
    const base = t * perThread;
    for (let c = 0; c < segments; c++) {
      const bl = base + c;
      const br = base + c + 1;
      const tl = base + columns + c;
      const tr = base + columns + c + 1;
      indices.push(bl, br, tl, br, tr, tl);
    }
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvs, 2));
  geometry.setAttribute("aRim", new THREE.BufferAttribute(rims, 1));
  geometry.setAttribute("aThread", new THREE.BufferAttribute(threadIds, 1));
  geometry.setIndex(indices);
  return geometry;
}

export function UnwovenScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const cfg = collectionConfig;
    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(dpr);
    renderer.setClearColor(0x000000, 0);
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";
    renderer.domElement.style.display = "block";
    renderer.domElement.style.touchAction = "pan-y";
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -100, 100);

    const shared = {
      uTime: { value: 0 },
      uHalfWidth: { value: 1 },
      uZone: { value: 1 },
      uStrength: { value: 0 },
      uWobble: { value: reduceMotion ? 0 : 1 },
      uCardSize: { value: new THREE.Vector2(1, 1) },
      uRadius: { value: cfg.cardRadius },
    };

    // One texture + material per image slot, shared by every card on it.
    const slots = cfg.images.map((_, i) => {
      const texture = new THREE.Texture(
        makePlaceholder(i + 1) as unknown as HTMLImageElement,
      );
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
      texture.generateMipmaps = false;
      texture.needsUpdate = true;

      const material = new THREE.ShaderMaterial({
        vertexShader: unwovenVertex,
        fragmentShader: unwovenFragment,
        transparent: true,
        depthTest: false,
        depthWrite: false,
        uniforms: {
          uMap: { value: texture },
          uSeed: { value: (i + 1) * 0.731 },
          uImageAspect: { value: 0.75 },
          uTime: shared.uTime,
          uHalfWidth: shared.uHalfWidth,
          uZone: shared.uZone,
          uStrength: shared.uStrength,
          uWobble: shared.uWobble,
          uCardSize: shared.uCardSize,
          uRadius: shared.uRadius,
        },
      });
      return { texture, material };
    });

    // Swap in the real product shots as they load. The whole texture object is
    // replaced (not just its `.image`) and the material's uniform re-pointed:
    // an in-place image swap on the placeholder texture never re-uploads here,
    // which left the cards showing the gradient fallback.
    const loader = new THREE.TextureLoader();
    loader.setCrossOrigin("anonymous");
    cfg.images.forEach((url, i) => {
      loader.load(url, (tex) => {
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = tex.wrapT = THREE.ClampToEdgeWrapping;
        tex.generateMipmaps = false;
        tex.colorSpace = THREE.SRGBColorSpace;
        const slot = slots[i];
        slot.texture.dispose();
        slot.texture = tex;
        slot.material.uniforms.uMap.value = tex;
        slot.material.uniforms.uImageAspect.value =
          tex.image.width / tex.image.height;
      });
    });

    // ── The strip ──────────────────────────────────────────────────────────
    const cards: { mesh: THREE.Mesh; baseX: number }[] = [];
    let geometry: THREE.BufferGeometry | null = null;
    let cardWidth = 0;
    let cardHeight = 0;
    let pitch = 0;
    let stripSpan = 0;
    let viewportWidth = 0;
    let viewportHeight = 0;

    const rebuildStrip = () => {
      for (const card of cards) {
        scene.remove(card.mesh);
      }
      cards.length = 0;
      geometry?.dispose();
      geometry = buildRibbonGeometry(
        cardWidth,
        cardHeight,
        cfg.threads,
        cfg.segments,
      );
      const count = Math.max(
        8,
        Math.ceil((viewportWidth + pitch * 3) / pitch),
      );
      stripSpan = count * pitch;
      for (let i = 0; i < count; i++) {
        const mesh = new THREE.Mesh(geometry, slots[i % slots.length].material);
        mesh.frustumCulled = false;
        scene.add(mesh);
        cards.push({ mesh, baseX: i * pitch });
      }
    };

    const resize = () => {
      viewportWidth = container.clientWidth;
      viewportHeight = container.clientHeight;
      if (!viewportWidth || !viewportHeight) return;
      renderer.setSize(viewportWidth, viewportHeight);
      camera.left = -viewportWidth / 2;
      camera.right = viewportWidth / 2;
      camera.top = viewportHeight / 2;
      camera.bottom = -viewportHeight / 2;
      camera.updateProjectionMatrix();
      cardHeight = Math.min(
        cfg.cardMaxHeight,
        viewportHeight * cfg.viewportClamp,
      );
      cardWidth = cardHeight * cfg.cardAspect;
      pitch = cardWidth + Math.max(24, cardWidth * cfg.cardGapRatio);
      shared.uHalfWidth.value = viewportWidth / 2;
      shared.uZone.value = Math.min(
        viewportWidth * cfg.tearZoneRatio,
        cfg.tearZoneMax,
      );
      shared.uCardSize.value.set(cardWidth, cardHeight);
      rebuildStrip();
    };

    // ── Motion: autoplay, drag, fling ───────────────────────────────────────
    const baseSpeed = reduceMotion ? 0 : cfg.scrollSpeed;
    const motion = { velocity: 0 };
    let offset = 0;
    gsap.to(motion, {
      velocity: baseSpeed,
      duration: 2.4,
      ease: "power2.out",
      delay: 0.35,
    });
    gsap.to(shared.uStrength, {
      value: 1,
      duration: 1.8,
      ease: "power3.inOut",
      delay: 0.2,
    });

    let dragging = false;
    let lastX = 0;
    let lastTime = 0;
    let dragVelocity = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      lastTime = performance.now();
      dragVelocity = 0;
      container.setPointerCapture(e.pointerId);
      gsap.killTweensOf(motion);
    };
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const now = performance.now();
      const dx = e.clientX - lastX;
      const dt = Math.max(1, now - lastTime) / 1000;
      offset -= dx;
      dragVelocity += (-dx / dt - dragVelocity) * 0.35;
      lastX = e.clientX;
      lastTime = now;
    };
    const endDrag = () => {
      if (!dragging) return;
      dragging = false;
      motion.velocity = gsap.utils.clamp(
        -cfg.flingMax,
        cfg.flingMax,
        dragVelocity,
      );
      gsap.to(motion, { velocity: baseSpeed, duration: 2.2, ease: "power3.out" });
    };
    container.addEventListener("pointerdown", onPointerDown);
    container.addEventListener("pointermove", onPointerMove);
    container.addEventListener("pointerup", endDrag);
    container.addEventListener("pointercancel", endDrag);
    container.addEventListener("lostpointercapture", endDrag);

    // ── Frame loop ──────────────────────────────────────────────────────────
    const tick = (time: number, deltaMS: number) => {
      if (!dragging) offset += motion.velocity * (deltaMS / 1000);
      shared.uTime.value = time;
      const half = stripSpan / 2;
      for (const card of cards) {
        const x =
          (((card.baseX - offset) % stripSpan) + stripSpan) % stripSpan;
        card.mesh.position.x = x - half;
      }
      renderer.render(scene, camera);
    };
    gsap.ticker.add(tick);

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();

    return () => {
      gsap.ticker.remove(tick);
      ro.disconnect();
      container.removeEventListener("pointerdown", onPointerDown);
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerup", endDrag);
      container.removeEventListener("pointercancel", endDrag);
      container.removeEventListener("lostpointercapture", endDrag);
      gsap.killTweensOf(motion);
      gsap.killTweensOf(shared.uStrength);
      for (const card of cards) scene.remove(card.mesh);
      cards.length = 0;
      geometry?.dispose();
      for (const slot of slots) {
        slot.texture.dispose();
        slot.material.dispose();
      }
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 cursor-grab active:cursor-grabbing"
      aria-hidden="true"
    />
  );
}
