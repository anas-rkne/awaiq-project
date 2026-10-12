import * as THREE from "three";
import { FBXLoader } from "three/addons/loaders/FBXLoader.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { DRACOLoader } from "three/addons/loaders/DRACOLoader.js";
import { HDRLoader } from "three/addons/loaders/HDRLoader.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { AfterimagePass } from "three/addons/postprocessing/AfterimagePass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { heroSceneConfig } from "@/config/site";
import { heroMistBackgroundFragment } from "@/components/home/Hero/heroMistShader";

/*
 * Brand integration of the miroleon CodePen "Fractal Glass Distortion" —
 * the SOURCE scene stays (metal hands, scripted orbit, AfterimagePass,
 * bloom, center-region displacement) but the background swaps from the raw
 * HDR look to the brand atmosphere approved in the design decision:
 *
 *   - navy vertical gradient base (matches the page sky, deepened)
 *   - the SAME procedural mist bank the section→section transitions use
 *     (`HeroMist`), drawn here as a RESTING fullscreen bank behind the hands
 *   - reflections on the metal come from a generated navy→gold→beige env
 *     (the HDR gradient is replaced by the brand gradient)
 *   - navy FogExp2 for depth without drowning the hands
 *
 * Layer Q: the mist MUST blend (alpha) but paint BEHIND the opaque hands. A
 * material with `transparent:false` is treated as opaque by the renderer,
 * which disables blending entirely and the bright mist shader clamps to white.
 * So the background (gradient + mist) is rendered each frame into an offscreen
 * RenderTarget and used as `scene.background` — the single RenderPass draws it
 * first, then paints the opaque hands over it. (Two chained RenderPasses do
 * NOT work: the composer ping-pongs their targets, so a `clear=false` second
 * pass reads the other, empty buffer.) Because the composer (Afterimage +
 * Bloom) outputs opaque, the "seamless page continuation" is achieved by
 * composition: everything the tokens expect is painted exactly behind the
 * hands.
 */

export type HandsSceneOptions = {
  handsUrl: string;
  displacementUrl: string;
  roughnessUrl: string;
  /**
   * The brand bottle, loaded INSIDE the scene so the hands can genuinely
   * occlude it (a flat DOM overlay can only ever paint on top). Draco +
   * WebP compressed GLB, recentred + scaled to sit in the gap between the
   * hands.
   */
  bottleUrl?: string;
  /**
   * Optional host element carrying `data-hands-active`. When present, the
   * scene renders ONLY while the host is flagged active — the hero pin
   * finale keeps it dormant until the timeline reveals it, so the hidden
   * overlay costs no GPU until its window.
   */
  host?: HTMLElement | null;
};

export type HandsSceneHandle = {
  /** Timeline-driven dolly base (1 = close inspection view, >1 = pulled back). */
  setBaseZoom: (z: number) => void;
  /** Current effective dolly (base × wheel). */
  getZoom: () => number;
  dispose: () => void;
};

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function disposeMat(mat: THREE.Material): void {
  const anyMat = mat as unknown as {
    map?: THREE.Texture | null;
    envMap?: THREE.Texture | null;
    roughnessMap?: THREE.Texture | null;
  };
  anyMat.map?.dispose?.();
  anyMat.envMap?.dispose?.();
  anyMat.roughnessMap?.dispose?.();
  mat.dispose();
}

/** Shared fullscreen NDC triangle used by every background layer. */
function makeFullscreenGeometry(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute(
    "position",
    new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3)
  );
  return geo;
}

/** Navy vertical gradient (deep → mid → ink) — the base that matches the
 *  page sky, kind of the solid floor under the mist. */
function makeGradientLayer() {
  const geo = makeFullscreenGeometry();
  const mat = new THREE.ShaderMaterial({
    vertexShader: `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: `
      uniform vec2 uResolution;
      void main() {
        vec2 v = gl_FragCoord.xy / uResolution;
        vec3 deep = vec3(0.055, 0.165, 0.290);   // #0e2a4a
        vec3 mid  = vec3(0.110, 0.235, 0.380);   // #1c3c61
        vec3 ink  = vec3(0.141, 0.259, 0.373);   // #24425f
        vec3 col = mix(deep, mid, smoothstep(0.0, 0.55, v.y));
        col = mix(col, ink, smoothstep(0.55, 1.0, v.y));
        gl_FragColor = vec4(col, 1.0);
      }
    `,
    uniforms: {
      uResolution: { value: new THREE.Vector2() },
    },
    transparent: false,
    blending: THREE.NoBlending,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 0;
  return {
    mesh,
    resize: (w: number, h: number) => mat.uniforms.uResolution.value.set(w, h),
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
}

/** The ONE procedural mist, as a scene layer — the SAME domain-warped FBM bank
 *  the section→section transition uses (`HeroMist`), drawn here as a RESTING
 *  background (constant intensity, slow drift) instead of the clouds. It runs
 *  on `gl_FragCoord`, so a fullscreen triangle in camera space renders it
 *  pixel-identically to the DOM canvas. Lives in the background scene so it can
 *  be honestly transparent over the navy gradient. */
function makeMistLayer(backgroundScene: THREE.Scene) {
  const geo = makeFullscreenGeometry();
  const uniforms = {
    uResolution: { value: new THREE.Vector2() },
    uTime: { value: 0 },
    // Sub-full so the bank reads as atmosphere, not a milky wall (config-owned).
    uIntensity: { value: heroSceneConfig.mist.restIntensity },
  };
  const mat = new THREE.ShaderMaterial({
    vertexShader: `
      void main() {
        gl_Position = vec4(position.xy, 0.0, 1.0);
      }
    `,
    fragmentShader: heroMistBackgroundFragment(),
    uniforms,
    transparent: true,
    depthTest: false,
    depthWrite: false,
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.frustumCulled = false;
  mesh.renderOrder = 1;
  backgroundScene.add(mesh);
  return {
    mesh,
    resize: (w: number, h: number) => uniforms.uResolution.value.set(w, h),
    dispose: () => {
      geo.dispose();
      mat.dispose();
    },
  };
}

/** Brand equirect environment: navy sky → a BIG bright gold band → warm
 *  beige horizon, so the metal hands ALWAYS read as the brand moment: navy
 *  chrome on top, molten gold from the equator down. The gold band is wide —
 *  a metal surface facing the camera reflects the whole equator strip, so
 *  width, not brightness, is what makes the hands pop. */
function makeBrandEnv(): THREE.CanvasTexture {
  const w = 256;
  const h = 128;
  const cvs = document.createElement("canvas");
  cvs.width = w;
  cvs.height = h;
  const ctx = cvs.getContext("2d");
  if (!ctx) return new THREE.CanvasTexture(cvs);
  const grad = ctx.createLinearGradient(0, 0, 0, h);
  grad.addColorStop(0.0, "#27466b"); // navy — upper reflections
  grad.addColorStop(0.28, "#2f4e78"); // brand navy mid
  grad.addColorStop(0.42, "#c2a04e"); // gold rises fast
  grad.addColorStop(0.62, "#e6c87e"); // bright gold
  grad.addColorStop(0.85, "#f0e2b8"); // lit horizon
  grad.addColorStop(1.0, "#faecc8");
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, w, h);
  const tex = new THREE.CanvasTexture(cvs);
  tex.mapping = THREE.EquirectangularReflectionMapping;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** E — soft elliptical CONTACT SHADOW: a radial-gradient alpha painted on a
 *  small plane, laid flat under the product so it reads as grounded. It is a
 *  billboard-free ground plane; the scene moves it with the cursor + dolly. */
function makeContactShadow(): THREE.Mesh {
  const s = 256;
  const cvs = document.createElement("canvas");
  cvs.width = s;
  cvs.height = s;
  const ctx = cvs.getContext("2d");
  if (ctx) {
    const g = ctx.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
    g.addColorStop(0.0, "rgba(0,0,0,0.9)");
    g.addColorStop(0.5, "rgba(0,0,0,0.4)");
    g.addColorStop(1.0, "rgba(0,0,0,0)");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, s, s);
  }
  const mat = new THREE.MeshBasicMaterial({
    map: new THREE.CanvasTexture(cvs),
    transparent: true,
    opacity: 0,
    depthWrite: false,
    color: 0x000000,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
  mesh.rotation.x = -Math.PI / 2;
  return mesh;
}

export function createHandsScene(container: HTMLElement, opts: HandsSceneOptions): HandsSceneHandle {
  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || window.innerHeight;
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setClearColor(0x0e2a4a);
  renderer.setPixelRatio(dpr);
  renderer.setSize(width, height);
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  renderer.domElement.dataset.hands = "true";
  container.appendChild(renderer.domElement);

  // Distance field so background layers know the device-px framebuffer size.
  const fbSize = () => ({ width: renderer.domElement.width, height: renderer.domElement.height });

  // BACKGROUND: navy gradient + mist are rendered to an offscreen target
  // each frame, then used as `scene.background`. This is the ONLY pattern that
  // is correct with EffectComposer: two chained RenderPasses ping-pong their
  // targets, so a `clear=false` second pass reads the other (empty) buffer — a
  // `scene.background` texture is drawn first by the single RenderPass, so the
  // transparent mist blend honestly BEHIND the opaque hands.
  const bgScene = new THREE.Scene();
  const bgCamera = new THREE.PerspectiveCamera(50, width / height, 0.1, 10);
  const bgRT = new THREE.WebGLRenderTarget(1, 1, { depthBuffer: false, stencilBuffer: false });
  bgRT.texture.colorSpace = THREE.SRGBColorSpace;
  const gradient = makeGradientLayer();
  bgScene.add(gradient.mesh);
  const backgroundSize = fbSize();
  bgRT.setSize(backgroundSize.width, backgroundSize.height);
  gradient.resize(backgroundSize.width, backgroundSize.height);
  const mist = makeMistLayer(bgScene);
  mist.resize(backgroundSize.width, backgroundSize.height);

  // HANDS scene: the source scene, opaque, over the background texture.
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
  // Intro start distance — the CLOSE orbit (the model fills the frame, hands
  // past the edges). The finale opens close, so there is no far-to-near dolly.
  camera.position.set(0, 0, 3);
  scene.background = bgRT.texture;

  const brandEnv = makeBrandEnv();
  scene.environment = brandEnv;

  // A STUDIO environment (soft "softbox" highlights) applied to the BOTTLE
  // material's own `envMap` — REFLECTIONS ONLY, the base colours are untouched
  // (still the GLB's baked map). This is what gives the glass its moving light
  // streaks. The brand env stays the scene default for the hands.
  const pmrem = new THREE.PMREMGenerator(renderer);
  const studioEnv = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  // Navy mist for depth — far softer than the source fog so the hands stay
  // metallic-readable (brand object, not a blackhole).
  scene.fog = new THREE.FogExp2(0x1a3350, 0.14);

  const surfaceImperfection = new THREE.TextureLoader().load(opts.roughnessUrl);
  surfaceImperfection.wrapT = THREE.RepeatWrapping;
  surfaceImperfection.wrapS = THREE.RepeatWrapping;

  const handsMat = new THREE.MeshPhysicalMaterial({
    color: 0xe9d6b4,
    roughness: 0.3,
    metalness: 0.88,
    roughnessMap: surfaceImperfection,
    envMap: brandEnv,
    envMapIntensity: 1.25,
  });

  // A SOFT BEIGE metal — brand-harmonious, light, and never clashing with the
  // bottle's gold/cream glass. The tutorial's neutral "GRADIENT_01_01" HDR is
  // swapped in as the hands' environment (the brand navy→gold env was tinting
  // the metal gold and fighting the bottle). Lower metalness + a touch more
  // roughness turn the hard chrome into a satin beige that reads warm, not
  // mirror. (brandEnv stays as a fallback until the HDR arrives.)
  let hdrEnv: THREE.Texture | null = null;
  new HDRLoader().load("/hdr/GRADIENT_01_01_comp.hdr", (tex) => {
    tex.mapping = THREE.EquirectangularReflectionMapping;
    hdrEnv = tex;
    handsMat.envMap = tex;
    handsMat.needsUpdate = true;
  });

  let handsGroup: THREE.Group | null = null;
  new FBXLoader().load(
    opts.handsUrl,
    (object) => {
      object.traverse((child) => {
        if ((child as THREE.Mesh).isMesh) {
          (child as THREE.Mesh).material = handsMat;
        }
      });
      object.position.set(0, 0, 0);
      object.scale.setScalar(0.06);
      scene.add(object);
      handsGroup = object;

      container.dataset.handsModel = "1";
    },

    undefined,
    (err) => {
      console.error("[hands] fbx load failed", err);
    }
  );

  // ── BOTTLE FINALE (inside the scene so the hands occlude it) ────────────
  // A flat DOM overlay can only ever paint ON TOP of the canvas, so the
  // product read as "in front of" the hands. Loading the Draco-compressed GLB
  // INTO the scene gives real depth testing: fingers in front hide it, the
  // gap reveals it — it genuinely sits BETWEEN the hands. It is recentred on
  // its own bbox and scaled BY WIDTH so it fits the hands' (narrow) gap rather
  // than the tall full frame.
  const BOTTLE_WIDTH = 0.384;
  const BOTTLE_POS = new THREE.Vector3(0.1764, -0.192, -0.1332);
  let bottleHolder: THREE.Group | null = null;
  // Interaction-effect state:
  //   bottleMats  — materials whose `envMapRotation` is swept by the cursor (A)
  //   bottleShadow— the moving contact shadow (E)
  //   bottleHalfH — half the on-screen height, to seat the shadow (E)
  const bottleMats: THREE.MeshStandardMaterial[] = [];
  let bottleShadow: THREE.Mesh | null = null;
  let bottleHalfH = 0.3;
  // C — golden Fresnel rim, injected into the standard shader of the bottle.
  const rimUniforms = {
    uRimColor: { value: new THREE.Color(0xcd9e61) },
    uRimPower: { value: 3.0 },
    uRimStrength: { value: 0.55 },
  };
  const dracoLoader = new DRACOLoader();
  dracoLoader.setDecoderPath("/draco/");
  const gltfLoader = new GLTFLoader();
  gltfLoader.setDRACOLoader(dracoLoader);
  gltfLoader.load(
    opts.bottleUrl ?? "/models/bottle-mid.glb",
    (gltf) => {
      const bottle = gltf.scene;
      // The ORIGINAL baked material is kept (the GLB's own `pbr_material`:
      // baseColor + metallicRoughness, colours untouched) — we only ATTACH the
      // studio `envMap` to it so the glass carries the soft moving light
      // reflections. No processed texture, no self-emissive boost, no navy cap
      // repaint: reflections only.
      bottle.traverse((child) => {
        const mesh = child as THREE.Mesh;
        if (!mesh.isMesh) return;
        if (!mesh.geometry.getAttribute("normal")) mesh.geometry.computeVertexNormals();
        const mat = mesh.material as THREE.MeshStandardMaterial | undefined;
        if (!mat) return;
        // A — the studio reflections are what make the glass carry moving light
        // streaks; their orientation is swept by the cursor each frame.
        mat.envMap = studioEnv;
        mat.envMapIntensity = 0.7;
        mat.envMapRotation = new THREE.Euler(0, 0, 0);
        // C — golden Fresnel rim, injected into the standard shader (only this
        // material compiles this variant, so the hands are untouched).
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
        mat.customProgramCacheKey = () => "bottleRim";
        mat.needsUpdate = true;
        bottleMats.push(mat);
      });
      const bbox = new THREE.Box3().setFromObject(bottle);
      const center = bbox.getCenter(new THREE.Vector3());
      const size = bbox.getSize(new THREE.Vector3());
      bottle.position.sub(center);
      bottle.scale.setScalar(BOTTLE_WIDTH / (size.x || 1));
      bottleHolder = new THREE.Group();
      bottleHolder.add(bottle);
      bottleHolder.position.copy(BOTTLE_POS);
      scene.add(bottleHolder);
      // E — seat the contact shadow just under the (recentred) bottle.
      bottleHalfH = (size.y * (BOTTLE_WIDTH / (size.x || 1))) / 2;
      bottleShadow = makeContactShadow();
      bottleShadow.scale.set(BOTTLE_WIDTH * 1.7, BOTTLE_WIDTH * 0.8, 1);
      bottleShadow.position.set(
        BOTTLE_POS.x,
        BOTTLE_POS.y - bottleHalfH - 0.015,
        BOTTLE_POS.z
      );
      scene.add(bottleShadow);
      container.dataset.bottleReady = "1";
      container.dataset.bottleSize = JSON.stringify(size.toArray().map((n) => +n.toFixed(3)));
    },
    undefined,
    (err) => console.error("[hands] bottle load failed", err)
  );

  const composer = new EffectComposer(renderer);

  // Single pass — the hands scene draws its `scene.background` (the atmosphere
  // RT) first, then the opaque hands over it.
  const renderPass = new RenderPass(scene, camera);
  composer.addPass(renderPass);

  const afterimagePass = new AfterimagePass();
  afterimagePass.uniforms.damp.value = 0.9;
  if (!reducedMotion) composer.addPass(afterimagePass);

  // Bloom tuned for the brand: threshold lifted onto the metallic highlights
  // so the bright highlights don't white out (the source 0.1 threshold would).
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(width, height),
    1.2,
    0.8,
    0.68
  );
  composer.addPass(bloomPass);

  const displacementTexture = new THREE.TextureLoader().load(opts.displacementUrl);

  // Subtle "thin glass" refraction — NOT a glitch. The source's full-strength
  // `scale 0.025` + `tileFactor 2` + hard centre box (a sharp rectangle seam)
  // read as a violent warp, so the wave is softened on every axis:
  //   - intensity:  scale 0.025 -> 0.01
  //   - frequency:  tileFactor 2 -> 0.3   (fewer, larger, softer waves)
  //   - UV scaling: sampled at `vUv * tileFactor` (the low factor = big waves)
  //   - centred:    (rg - 0.5) removes the uniform push, so it ripples both ways
  //   - no hard rectangle: applied across the whole frame, no seam
  const displacementShader = {
    uniforms: {
      tDiffuse: { value: null as THREE.Texture | null },
      displacement: { value: displacementTexture },
      scale: { value: 0.01 },
      tileFactor: { value: 0.3 },
    },
    vertexShader: `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      uniform sampler2D tDiffuse;
      uniform sampler2D displacement;
      uniform float scale;
      uniform float tileFactor;
      varying vec2 vUv;
      void main() {
        vec2 disp = (texture2D(displacement, vUv * tileFactor).rg - 0.5) * scale;
        gl_FragColor = texture2D(tDiffuse, vUv + disp);
      }
    `,
  };
  composer.addPass(new ShaderPass(displacementShader));

  let theta = 0;
  let ioVisible = true;
  let raf = 0;
  let transitionProgress = 0;
  const transitionStartPosition = new THREE.Vector3(0, 0, 3);
  const startQuaternion = camera.quaternion.clone();
  const clock = new THREE.Clock();

  // Activation gate (hero pin finale). No host -> always active (standalone
  // section). With a host, the scene stays dormant until the timeline flips
  // `data-hands-active` to "1"; the first flip ALSO restarts the intro so the
  // orbit always plays from its scripted entry pose, however late it appears.
  const host = opts.host ?? null;
  const hostActive = () => !host || host.getAttribute("data-hands-active") !== "0";
  const restartIntro = () => {
    transitionProgress = 0;
    transitionStartPosition.copy(camera.position);
    startQuaternion.copy(camera.quaternion);
    clock.getDelta();
  };
  let wasActive = hostActive();
  let hostObserver: MutationObserver | null = null;
  if (host) {
    hostObserver = new MutationObserver(() => {
      const active = hostActive();
      if (active && !wasActive) restartIntro();
      wasActive = active;
    });
    hostObserver.observe(host, { attributes: true, attributeFilter: ["data-hands-active"] });
  }

  // The finale is fully interactive, with three independent inputs:
  //   - MOVE  → the bottle eases toward the pointer (it "follows" the cursor).
  //   - DRAG  → extra rotation stacked on top of the follow, so you can spin it
  //             right around to see every side.
  //   - WHEEL → dollying the camera in/out with a soft range, so no matter how
  //             close the scripted orbit swings, you can always back off.
  // Only the MOUSE is handled, so touch keeps scrolling the page; and the
  // overlay is `visibility:hidden` unless the finale is active, so enabling
  // pointer events on the canvas is inert the rest of the time.
  const clampN = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));
  const dom = renderer.domElement;
  dom.style.pointerEvents = "auto";
  dom.style.touchAction = "pan-y";
  let dragging = false;
  let lastX = 0;
  let lastY = 0;
  // Pointer-follow (smoothed toward the target each frame).
  let followYaw = 0;
  let followPitch = 0;
  let targetFollowYaw = 0;
  let targetFollowPitch = 0;
  // Raw pointer position in [-1,1] — drives the cursor light sweep (A).
  let pointerNX = 0;
  let pointerNY = 0;
  // Drag rotation, accumulated on top of the follow, plus the released
  // velocity used for the spring/momentum settle (D).
  let dragYaw = 0;
  let dragPitch = 0;
  let spinVel = 0;
  // Camera dolly = baseZoom (timeline-driven) × wheelZoom (user wheel).
  // baseZoom: the scripted pull-back — 1.3 = the slightly pulled-back entrance,
  // 1.0 = the close inspection view the section settles on. The scroll-scrubbed
  // timeline drives this (see useHeroMotion), so scrolling up pulls back a
  // little before the handoff to the previous section.
  // wheelZoom: a fine-tune multiplier the visitor drives with the wheel.
  let baseZoom = 1.3;
  let wheelZoom = 1.0;
  const zoom = () => baseZoom * wheelZoom;
  // Wheel range (a fine-tune around the scripted base). 0.8 = push closer,
  // 1.5 = pull back. At the limit the wheel is released back to the page.
  const WHEEL_MIN = 0.8;
  const WHEEL_MAX = 1.5;
  const onPointerDown = (e: PointerEvent) => {
    if (e.pointerType !== "mouse" || !bottleHolder || !hostActive()) return;
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
      targetFollowYaw = pointerNX * 0.6;
      targetFollowPitch = pointerNY * 0.4;
      return;
    }
    if (!bottleHolder) return;
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    lastX = e.clientX;
    lastY = e.clientY;
    dragYaw += dx * 0.01;
    dragPitch += dy * 0.006;
    spinVel = dx * 0.01; // D — last flick, replayed as release momentum
  };
  const onPointerLeave = () => {
    targetFollowYaw = 0;
    targetFollowPitch = 0;
  };
  const onWheel = (e: WheelEvent) => {
    if (!ioVisible || !hostActive()) return;
    // Inverted: scroll up = pull back (farther), scroll down = push closer —
    // matching the timeline's pull-back so the two never fight.
    const next = clampN(wheelZoom * (1 - e.deltaY * 0.0012), WHEEL_MIN, WHEEL_MAX);
    // At a dolly limit the wheel is released back to the page: scrolling down
    // stops at the edge (cut stays hidden), and scrolling up lets the story
    // play in reverse — a smooth return from the hands into China.
    if (next === wheelZoom) return;
    e.preventDefault();
    wheelZoom = next;
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
  dom.addEventListener("wheel", onWheel, { passive: false });

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
    composer.setSize(w, h);
    const s = fbSize();
    bgRT.setSize(s.width, s.height);
    gradient.resize(s.width, s.height);
    mist.resize(s.width, s.height);
  };
  const ro = new ResizeObserver(resize);
  ro.observe(container);

  const animate = () => {
    raf = requestAnimationFrame(animate);
    if (!ioVisible || !hostActive()) return;
    const dt = Math.min(clock.getDelta(), 0.05);
    if (!reducedMotion) theta += 0.005 * Math.min(dt * 60, 1.5);

    // D — release momentum: after the drag the bottle keeps spinning a little
    // and sheds speed; the pitch eases back to level (elastic settle).
    if (!dragging && spinVel !== 0) {
      dragYaw += spinVel;
      spinVel *= 0.92;
      if (Math.abs(spinVel) < 0.0004) spinVel = 0;
    }
    if (!dragging) dragPitch += (0 - dragPitch) * 0.07;

    if (bottleHolder) {
      followYaw += (targetFollowYaw - followYaw) * 0.08;
      followPitch += (targetFollowPitch - followPitch) * 0.08;
      bottleHolder.rotation.y = dragYaw + followYaw;
      bottleHolder.rotation.x = clampN(dragPitch + followPitch, -0.7, 0.7);
    }

    // A — sweep the studio reflections with the cursor, so a light streak roams
    // across the glass as you move.
    for (let i = 0; i < bottleMats.length; i++) {
      bottleMats[i].envMapRotation.set(pointerNY * 0.35, pointerNX * 0.5, 0);
    }

    // E — the contact shadow slides opposite the cursor and fades as the camera
    // pulls back, so it feels anchored to the product, not the frame.
    if (bottleShadow) {
      bottleShadow.position.x = BOTTLE_POS.x - targetFollowYaw * 0.06;
      bottleShadow.position.z = BOTTLE_POS.z - targetFollowPitch * 0.06;
      const shadowMat = bottleShadow.material as THREE.MeshBasicMaterial;
      shadowMat.opacity = clampN(0.42 / zoom(), 0.1, 0.42);
    }


    const radius = 3 * zoom();
    const targetPosition = new THREE.Vector3(Math.sin(theta) * radius, Math.sin(theta) * zoom(), Math.cos(theta) * radius);
    const targetQuaternion = new THREE.Quaternion().setFromEuler(new THREE.Euler(0, -theta, 0));

    if (transitionProgress < 1) {
      transitionProgress += dt / 0.8;
      const eased = easeInOutCubic(Math.min(transitionProgress, 1));
      camera.position.lerpVectors(transitionStartPosition, targetPosition, eased);
      camera.quaternion.copy(startQuaternion).slerp(targetQuaternion, eased);
    } else {
      camera.position.copy(targetPosition);
      camera.quaternion.copy(targetQuaternion);
    }
    camera.lookAt(scene.position);

    const mistUni = mist.mesh.material as THREE.ShaderMaterial;
    if (!reducedMotion) mistUni.uniforms.uTime.value += dt;

    // Paint the atmosphere (gradient + mist) into bgRT; the hands pass
    // samples it as `scene.background` before drawing the hands.
    renderer.setRenderTarget(bgRT);
    renderer.render(bgScene, bgCamera);
    renderer.setRenderTarget(null);

    composer.render();
  };

  animate();
  container.dataset.handsReady = "true";

  return {
    setBaseZoom(z: number) {
      baseZoom = Math.min(1.8, Math.max(0.7, z));
    },
    getZoom() {
      return zoom();
    },
    dispose() {
      ioVisible = false;
      cancelAnimationFrame(raf);
      io.disconnect();
      hostObserver?.disconnect();
      ro.disconnect();
      dom.removeEventListener("pointerdown", onPointerDown);
      dom.removeEventListener("pointermove", onPointerMove);
      dom.removeEventListener("pointerup", onPointerUp);
      dom.removeEventListener("pointercancel", onPointerUp);
      dom.removeEventListener("pointerleave", onPointerLeave);
      dom.removeEventListener("wheel", onWheel);
      if (handsGroup) handsGroup.traverse((obj) => ((obj as THREE.Mesh).geometry?.dispose?.()));
      if (bottleHolder)
        bottleHolder.traverse((obj) => {
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
      if (bottleShadow) {
        bottleShadow.geometry?.dispose?.();
        const sm = bottleShadow.material as THREE.MeshBasicMaterial;
        sm.map?.dispose?.();
        sm.dispose();
      }
      dracoLoader.dispose();
      hdrEnv?.dispose();
      studioEnv.dispose();
      pmrem.dispose();
      disposeMat(handsMat);
      displacementTexture.dispose();
      surfaceImperfection.dispose();
      mist.dispose();
      gradient.dispose();
      brandEnv.dispose();
      bgRT.dispose();
      renderPass.dispose();
      afterimagePass.dispose();
      bloomPass.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    },
  };
}