import * as THREE from "three";
import { galleryConfig } from "@/config/gallery";

/**
 * The gallery's theatre curtain — two THREE.js velvet planes ("halves") that
 * hang over the chapter and part from the centre as the scroll advances.
 * NOTHING here listens to scroll: `GallerySection`'s own scrub timeline feeds
 * the opening in through `setOpen(t)` (0 = closed, 1 = fully parted).
 *
 * How the velvet reads (tuned against real theatre drapes):
 * - An all-cool lighting rig carries the deep navy body (a warm keylight is
 *   the trap this scene avoids): cool key, a cool silver-blue sheen, navy
 *   ambient and a sky/floor hemisphere — no gold or warm cast ever touches
 *   the fabric. `NeutralToneMapping` rolls the highlights off filmically
 *   without shifting the navy's hue.
 * - PLEATS are baked into the mesh as many narrow folds (≈90px apart on a
 *   desktop screen), with a second-harmonic "twist" so they read as gathered
 *   fabric rather than a clean sine, a forward curve for drape volume, and a
 *   taper that deepens them toward the floor. A subtle procedural grain
 *   (colour + roughness) breaks the sheen into fibre.
 * - WIND (desktop only): every frame the vertices are displaced along Z by a
 *   sum of travelling waves — a slow bulk sway, a mid flutter running along
 *   the fabric, a fast fine shimmer — seeded per half so the two drapes never
 *   move in sync. The envelope is ZERO at the centre seam (the halves are tied
 *   there) and at the top rail, growing to full throw at the free, lower,
 *   outer corner. Normals are recomputed every pass so the light catches the
 *   moving ripple.
 * - The OPENING is a rigid slide of each half about the centre (the chapter's
 *   `motion.open` window, eased there) — simple by design; the life is in
 *   the wind.
 *
 * Budget (mirrors `HeroIncense` / `HeroBottle`):
 * - ONE renderer, DPR-capped; the mesh density follows `curtain.segments`
 *   per viewport and rebuilds on a breakpoint switch without touching the
 *   DOM around it.
 * - The wind runs only while the canvas is on screen and the tab is visible;
 *   on mobile there is NO wind at all — the scene then renders ONLY when the
 *   opening (or a resize) actually changes, the raw-three equivalent of a
 *   demand frameloop.
 * - Pure decoration: `pointer-events: none`, `aria-hidden` upstream.
 */

export type GalleryCurtainHandle = {
  /** The chapter's scrub feeds the EASED opening here (0 closed → 1 parted). */
  setOpen: (t: number) => void;
  dispose: () => void;
};

/** Height (local) over which the top rail damps the wind to zero. */
const TOP_DAMP = 0.12;

/**
 * The fabric grain — a small procedural noise canvas used twice: as a very
 * light colour map and as a roughness map, so the sheen varies fibre by fibre
 * instead of across a mathematically perfect surface. Fine vertical streaks
 * ride on top (loom direction).
 */
function buildGrainCanvas(): HTMLCanvasElement | null {
  const size = 256;
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;
  const image = ctx.createImageData(size, size);
  const columns = new Float32Array(size);
  for (let x = 0; x < size; x++) columns[x] = 0.94 + Math.random() * 0.06;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const v = Math.min(
        255,
        Math.round((218 + Math.random() * 37) * columns[x])
      );
      image.data[i] = v;
      image.data[i + 1] = v;
      image.data[i + 2] = v;
      image.data[i + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvas;
}

export function createGalleryCurtain(
  container: HTMLElement,
  getOpen: () => number,
  onReady?: () => void
): GalleryCurtainHandle {
  const c = galleryConfig.curtain;
  const mobileQuery = window.matchMedia("(max-width: 1023px)");

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "none";
  container.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(c.fov, 1, 0.1, 50);
  camera.position.set(0, 0, c.cameraZ);
  camera.lookAt(0, 0, 0);

  // The lighting rig (see docblock): all cool — the key carries the navy
  // body, the sheen is silver-blue, and the ambient + hemisphere keep the
  // depth. No warm light touches the fabric.
  const key = new THREE.DirectionalLight(c.light.color, c.light.intensity);
  key.position.set(...c.light.position);
  scene.add(key);
  scene.add(new THREE.AmbientLight(c.ambient.color, c.ambient.intensity));
  scene.add(
    new THREE.HemisphereLight(c.hemi.sky, c.hemi.ground, c.hemi.intensity)
  );

  // The fabric grain — one canvas, two texture views (colour + roughness).
  const grainCanvas = buildGrainCanvas();
  const grainMap = grainCanvas ? new THREE.CanvasTexture(grainCanvas) : null;
  const grainRough = grainCanvas ? new THREE.CanvasTexture(grainCanvas) : null;
  const maxAniso = renderer.capabilities.getMaxAnisotropy();
  for (const tex of [grainMap, grainRough]) {
    if (!tex) continue;
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(3, 2);
    tex.anisotropy = maxAniso;
  }
  if (grainMap) grainMap.colorSpace = THREE.SRGBColorSpace;

  const material = new THREE.MeshPhysicalMaterial({
    color: c.color,
    roughness: c.roughness,
    metalness: c.metalness,
    sheen: c.sheen,
    sheenColor: c.sheenColor,
    sheenRoughness: c.sheenRoughness,
    side: THREE.DoubleSide,
    map: grainMap ?? undefined,
    roughnessMap: grainRough ?? undefined,
  });

  type Half = {
    side: -1 | 1;
    mesh: THREE.Mesh;
    geometry: THREE.PlaneGeometry;
    /** Local rest positions (pleats baked in) — wind writes base + offset. */
    base: Float32Array;
    phase: number;
  };

  const buildHalf = (side: -1 | 1): Half => {
    const seg = mobileQuery.matches ? c.segments.mobile : c.segments.desktop;
    const geometry = new THREE.PlaneGeometry(1, 1, seg.x, seg.y);
    const pos = geometry.getAttribute("position") as THREE.BufferAttribute;
    const base = new Float32Array(pos.array.length);
    // The gathered pleats: a narrow sine (phase-shifted between the halves so
    // the seam joins fold-to-fold), a second harmonic for a gathered-fabric
    // profile, a forward curve for drape volume, and a taper that deepens the
    // folds toward the floor.
    const phase = side === -1 ? 0 : 1.9;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const theta =
        (x + 0.5) * Math.PI * 2 * c.fold.count + (side === -1 ? 0 : Math.PI / 2);
      const taper = 1 + c.fold.taper * (0.5 - y) * 0.5;
      const pleat =
        Math.sin(theta) + c.fold.twist * Math.sin(theta * 2 + 0.9);
      const curve = c.fold.curve * (1 - (2 * x) * (2 * x));
      const z = c.fold.depth * taper * pleat + curve;
      pos.setZ(i, z);
      base[i * 3] = x;
      base[i * 3 + 1] = y;
      base[i * 3 + 2] = z;
    }
    pos.needsUpdate = true;
    geometry.computeVertexNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);
    return { side, mesh, geometry, base, phase };
  };

  let halves: Half[] = [buildHalf(-1), buildHalf(1)];

  // --- viewport frame --------------------------------------------------------

  let openT = 0;
  let dirty = true;

  /** The visible world box at the curtain plane, from the live camera. */
  const frame = () => {
    const h = 2 * c.cameraZ * Math.tan((c.fov * Math.PI) / 360);
    return { w: h * camera.aspect, h };
  };

  const applyOpen = () => {
    const f = frame();
    const slide = f.w * c.slide;
    for (const half of halves) {
      const x = half.side * (f.w * c.width) * 0.5 + half.side * slide * openT;
      half.mesh.position.x = x;
    }
  };

  const resize = () => {
    const w = container.clientWidth || window.innerWidth;
    const h = container.clientHeight || window.innerHeight;
    renderer.setPixelRatio(
      Math.min(
        window.devicePixelRatio || 1,
        mobileQuery.matches ? c.maxDprMobile : c.maxDpr
      )
    );
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    const f = frame();
    const planeW = f.w * c.width;
    const planeH = f.h * 1.02;
    for (const half of halves) {
      half.mesh.scale.set(planeW, planeH, 1);
    }
    applyOpen();
    dirty = true;
  };

  /** A breakpoint switch swaps the MESH DENSITY mid-flight — geometries are
   *  rebuilt in place, never the canvas or the DOM around it. */
  const rebuildDensity = () => {
    for (const half of halves) {
      scene.remove(half.mesh);
      half.geometry.dispose();
    }
    halves = [buildHalf(-1), buildHalf(1)];
    resize();
  };

  const ro = new ResizeObserver(resize);
  ro.observe(container);
  mobileQuery.addEventListener("change", rebuildDensity);
  resize();

  // --- wind ------------------------------------------------------------------

  const windEnabled = () => !mobileQuery.matches;

  const waveTotal = c.wind.waves.reduce((sum, wave) => sum + wave.weight, 0);

  const applyWind = (t: number) => {
    const { amp, waves } = c.wind;
    for (const half of halves) {
      const pos = half.geometry.getAttribute("position") as THREE.BufferAttribute;
      const arr = pos.array as Float32Array;
      const { base, phase, side } = half;
      for (let i = 0; i < arr.length; i += 3) {
        const x = base[i];
        const y = base[i + 1];
        const z0 = base[i + 2];
        // Zero at the centre seam (the halves are tied there) × zero at the
        // top rail (the drape hangs from the rod) — full throw at the free
        // outer, lower corner.
        const seamD = side === -1 ? 0.5 - x : x + 0.5;
        const s = Math.min(1, (0.5 - y) / TOP_DAMP);
        const envY = s * s * (3 - 2 * s);
        const env = seamD * envY;
        // Travelling waves: kx/ky shape the ripple, omega its speed, the
        // per-wave offsets + per-half phase keep the two drapes out of sync.
        let w = 0;
        for (let k = 0; k < waves.length; k++) {
          const wave = waves[k];
          w +=
            wave.weight *
            Math.sin(
              wave.kx * x +
                wave.ky * y -
                wave.omega * t +
                phase * (1 + k * 0.6) +
                k * 2.4
            );
        }
        arr[i + 2] = z0 + (env * amp * w) / waveTotal;
      }
      pos.needsUpdate = true;
      half.geometry.computeVertexNormals();
    }
  };

  // --- loop ------------------------------------------------------------------

  let raf = 0;
  let visible = true;
  let time = 0;
  let last = performance.now();

  const animate = (now: number) => {
    raf = requestAnimationFrame(animate);
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    if (!visible || document.hidden) return;
    if (windEnabled()) {
      time += dt;
      applyWind(time);
      dirty = true;
    }
    if (dirty) {
      renderer.render(scene, camera);
      dirty = false;
    }
  };

  const io = new IntersectionObserver(
    (entries) => {
      visible = entries[0]?.isIntersecting ?? true;
      dirty = true;
    },
    { rootMargin: "120px" }
  );
  io.observe(container);

  // First paint (pleats + closed pose), then sync to wherever the chapter's
  // scrub already is — the chunk may land while the reader is deep in the
  // chapter — and tell the wrapper the velvet is on.
  openT = Math.min(1, Math.max(0, getOpen()));
  applyOpen();
  renderer.render(scene, camera);
  dirty = false;
  raf = requestAnimationFrame(animate);
  onReady?.();

  return {
    setOpen(t: number) {
      openT = Math.min(1, Math.max(0, t));
      applyOpen();
      dirty = true;
    },
    dispose() {
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      mobileQuery.removeEventListener("change", rebuildDensity);
      for (const half of halves) {
        half.geometry.dispose();
      }
      material.dispose();
      grainMap?.dispose();
      grainRough?.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
