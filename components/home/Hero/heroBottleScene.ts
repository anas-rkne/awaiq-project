import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";

/*
 * The hero's own 3D bottle — the SAME product as the hands finale
 * (`/models/bottle-mid.glb`, Draco + WebP), lifted into the main hero as a
 * floating centerpiece between the copy column and the resting art.
 *
 * What carries over from the finale (so the product reads identical):
 *   - the untouched GLB material (baked baseColor + metallicRoughness);
 *   - the studio `RoomEnvironment` reflections attached as the material's own
 *     `envMap` (reflections only, no colour repaint), swept by the pointer so
 *     a light streak roams across the glass;
 *   - the golden Fresnel rim injected into the standard shader;
 *   - the interaction grammar: MOVE follows the cursor, DRAG spins the bottle
 *     with release momentum and an elastic pitch settle. Mouse-only, so touch
 *     keeps scrolling the page — exactly the finale's contract. The finale's
 *     WHEEL dolly is deliberately NOT copied: in the hero the wheel belongs
 *     to the page scroll.
 *
 * What is NEW here (the hero reading the user asked for):
 *   - the bottle is TILTED 45° to the right (`rotation.z`), and turns 360°
 *     around its OWN (tilted) axis — the spin lives on the innermost group;
 *   - it is fitted BIG: the 45°-tilted bounding diagonal fills `FIT_SHARE` of
 *     the container's visible height — clearly larger than the finale's
 *     gap-sized product;
 *   - the canvas is transparent and message-free (no composer, no mist):
 *     it floats over the hero stage's own navy + pattern + art.
 */

/** Vertical field of view and camera distance — the fit math below depends on
 *  both, so they live together. */
const FOV = 35;
const CAMERA_Z = 4;
/** Share of the container's VISIBLE height the 45°-tilted bottle fills
 *  (`(size.x + size.y) * √½` is the tilted extent, so the lean never clips). */
const FIT_SHARE = 0.8;
/** The lean: top of the bottle toward the RIGHT (three.js z is CCW). */
const TILT_Z = -Math.PI / 4;
/** Idle spin — one full turn ≈ 21s, the finale's own turntable cadence. */
const SPIN_SPEED = 0.005;
/** Pointer-follow ceiling (radians) and drag sensitivities — finale values. */
const FOLLOW_YAW = 0.6;
const FOLLOW_PITCH = 0.4;
const PITCH_MAX = 0.7;
const DRAG_YAW = 0.01;
const DRAG_PITCH = 0.006;
const SPIN_DECAY = 0.92;

export type HeroBottleHandle = {
  dispose: () => void;
};

const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

export function createHeroBottleScene(container: HTMLElement): HeroBottleHandle {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const reducedMotion =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isMobile =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 1023px)").matches;
  /** The phone tier renders the bottle BIG (up to 92vw square), so the shaded
   *  area grew with it — 1.25 keeps the frame budget while the cap stays
   *  invisible on a ~390px-wide screen. */
  const dprCap =
    typeof window !== "undefined" &&
    window.matchMedia("(max-width: 479px)").matches
      ? 1.25
      : isMobile
        ? 1.5
        : 2;
  const dpr = Math.min(window.devicePixelRatio || 1, dprCap);

  const renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  });
  renderer.setClearColor(0x000000, 0);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.pointerEvents = "auto";
  renderer.domElement.style.touchAction = "pan-y";
  renderer.domElement.dataset.heroBottle = "1";
  container.appendChild(renderer.domElement);
  const dom = renderer.domElement;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 100);
  camera.position.set(0, 0, CAMERA_Z);
  camera.lookAt(0, 0, 0);

  // Studio "softbox" reflections — the one environment the bottle uses.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // The lean (fixed) → the pitch (drag/follow wobble) → the spin (the bottle's
  // own axis). Compose outside-in: the innermost yaw spins WITHIN the tilt, so
  // the bottle turns around itself, not around world-up.
  const tilt = new THREE.Group();
  tilt.rotation.z = TILT_Z;
  scene.add(tilt);
  const pitchG = new THREE.Group();
  tilt.add(pitchG);
  const spin = new THREE.Group();
  pitchG.add(spin);

  // C — golden Fresnel rim, injected into the standard shader (same uniforms
  // as the finale's bottle; its own cache key keeps the program separate).
  const rimUniforms = {
    uRimColor: { value: new THREE.Color(0xcd9e61) },
    uRimPower: { value: 3.0 },
    uRimStrength: { value: 0.55 },
  };
  const bottleMats: THREE.MeshStandardMaterial[] = [];

  let modelReady = false;
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(
    "/models/bottle-mid.glb",
    (gltf) => {
      const bottle = gltf.scene;
      bottle.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (!mesh.geometry.getAttribute("normal")) mesh.geometry.computeVertexNormals();
        const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (!mat) return;
        mat.envMap = studioEnv;
        mat.envMapIntensity = 0.7;
        mat.envMapRotation = new THREE.Euler(0, 0, 0);
        mat.onBeforeCompile = (shader) => {
          Object.assign(shader.uniforms, rimUniforms);
          shader.vertexShader = shader.vertexShader
            .replace(
              "#include <common>",
              "#include <common>\nvarying vec3 vRimNormal;\nvarying vec3 vRimViewPos;"
            )
            .replace(
              "#include <begin_vertex>",
              "#include <begin_vertex>\nvRimNormal = normalize( normalMatrix * objectNormal );\nvRimViewPos = ( modelViewMatrix * vec4( transformed, 1.0 ) ).xyz;"
            );
          shader.fragmentShader = shader.fragmentShader
            .replace(
              "#include <common>",
              "#include <common>\nvarying vec3 vRimNormal;\nvarying vec3 vRimViewPos;\nuniform vec3 uRimColor;\nuniform float uRimPower;\nuniform float uRimStrength;"
            )
            .replace(
              "#include <emissivemap_fragment>",
              "#include <emissivemap_fragment>\nfloat vRim = pow( 1.0 - clamp( dot( normalize( vRimNormal ), normalize( -vRimViewPos ) ), 0.0, 1.0 ), uRimPower );\ntotalEmissiveRadiance += uRimColor * ( vRim * uRimStrength );"
            );
        };
        mat.customProgramCacheKey = () => "heroBottleRim";
        mat.needsUpdate = true;
        bottleMats.push(mat);
      });
      // Recentre on the bbox, then fit the TILTED diagonal to the view.
      const bbox = new THREE.Box3().setFromObject(bottle);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      bottle.position.sub(center);
      const visibleH = 2 * CAMERA_Z * Math.tan((FOV * Math.PI) / 360);
      const tiltedExtent = (size.x + size.y) * Math.SQRT1_2 || 1;
      bottle.scale.setScalar((visibleH * FIT_SHARE) / tiltedExtent);
      spin.add(bottle);
      modelReady = true;
      container.dataset.heroBottleReady = "1";
    },
    undefined,
    (err) => console.error("[hero-bottle] load failed", err)
  );

  // Interaction state (the finale's grammar).
  const clock = new THREE.Clock();
  let raf = 0;
  let ioVisible = true;
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  let followYaw = 0;
  let followPitch = 0;
  let targetFollowYaw = 0;
  let targetFollowPitch = 0;
  let pointerNX = 0;
  let pointerNY = 0;
  let idle = 0;
  let dragYaw = 0;
  let dragPitch = 0;
  let spinVel = 0;

  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !modelReady) return;
    dragging = true;
    lastX = e.clientX;
    lastY = e.clientY;
    spinVel = 0;
    try {
      dom.setPointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
    dom.style.cursor = "grabbing";
  };
  const onPointerMove = (e: PointerEvent) => {
    const r = container.getBoundingClientRect();
    if (r.width > 0 && r.height > 0) {
      pointerNX = clampN(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
      pointerNY = clampN(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
    }
    if (!dragging) {
      targetFollowYaw = pointerNX * FOLLOW_YAW;
      targetFollowPitch = pointerNY * FOLLOW_PITCH;
      return;
    }
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    dragYaw += dx * DRAG_YAW;
    dragPitch += dy * DRAG_PITCH;
    spinVel = dx * DRAG_YAW;
  };
  const onPointerLeave = () => {
    targetFollowYaw = 0;
    targetFollowPitch = 0;
  };
  const onPointerUp = (e: PointerEvent) => {
    if (!dragging) return;
    dragging = false;
    dom.style.cursor = "";
    try {
      dom.releasePointerCapture(e.pointerId);
    } catch {
      /* noop */
    }
  };
  dom.addEventListener("pointerdown", onPointerDown);
  dom.addEventListener("pointermove", onPointerMove);
  dom.addEventListener("pointerup", onPointerUp);
  dom.addEventListener("pointercancel", onPointerUp);
  dom.addEventListener("pointerleave", onPointerLeave);

  const io = new IntersectionObserver(
    (entries) => {
      ioVisible = entries[0]?.isIntersecting ?? true;
    },
    { rootMargin: "120px" }
  );
  io.observe(container);

  const resize = () => {
    const w = container.clientWidth;
    const h = container.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const animate = () => {
    raf = requestAnimationFrame(animate);
    if (!ioVisible || document.hidden) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reducedMotion) idle += SPIN_SPEED * Math.min(dt * 60, 1.5);

    // Release momentum + elastic pitch settle — the finale's own physics.
    if (!dragging && spinVel !== 0) {
      dragYaw += spinVel;
      spinVel *= SPIN_DECAY;
      if (Math.abs(spinVel) < 0.0004) spinVel = 0;
    }
    if (!dragging) dragPitch += (0 - dragPitch) * 0.07;

    followYaw += (targetFollowYaw - followYaw) * 0.08;
    followPitch += (targetFollowPitch - followPitch) * 0.08;
    spin.rotation.y = idle + dragYaw + followYaw;
    pitchG.rotation.x = clampN(dragPitch + followPitch, -PITCH_MAX, PITCH_MAX);

    // Sweep the studio reflections with the cursor — a light streak roams the
    // glass as you move, exactly like the finale.
    for (let i = 0; i < bottleMats.length; i++) {
      bottleMats[i].envMapRotation.set(pointerNY * 0.35, pointerNX * 0.5, 0);
    }

    renderer.render(scene, camera);
  };
  animate();
  container.dataset.heroBottleRunning = "1";

  return {
    dispose() {
      ioVisible = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      ro.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("pointerleave", onPointerLeave);
      spin.traverse((obj) => {
        const mesh = obj as THREE.Mesh;
        if (!mesh.isMesh) return;
        mesh.geometry?.dispose?.();
        const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (mat) {
          mat.map?.dispose?.();
          mat.normalMap?.dispose?.();
          mat.roughnessMap?.dispose?.();
          mat.metalnessMap?.dispose?.();
          mat.dispose();
        }
      });
      dracoLoader.dispose();
      studioEnv.dispose();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}
