/**
 * about-3d-scene.js
 * Three.js workstation scene for the About section.
 *
 * - Loads a licensed character GLB from the stage's data-model-url (empty by default). If set, it is
 *   animated with AnimationMixer (real clips only) with optional head tracking
 *   and blinking when the rig supports them.
 * - If the model file is missing or fails, the workstation (desk, laptop, lamp,
 *   orbit, code badge) renders on its own. No human character is faked.
 * - Renders only while visible, caps pixel ratio, respects reduced motion and
 *   disposes everything on destroy().
 */
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";


const PALETTE = {
  dark:  { key: 0xffd9a0, keyI: 2.2, amb: 0x6b5f52, ambI: 0.55, desk: 0x3a2f26, wall: 0x2a2724, screen: 0.9 },
  light: { key: 0xffe2b5, keyI: 2.0, amb: 0xfff3e0, ambI: 0.95, desk: 0x8a6a4a, wall: 0xe7ddcc, screen: 0.65 },
};

export function createAboutScene(stage, { onState = () => {} } = {}) {
  const canvas = stage.querySelector("canvas");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const isTouch = window.matchMedia("(pointer: coarse)").matches;
  const isSmall = window.matchMedia("(max-width: 767px)").matches;

  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: !isSmall, alpha: true, powerPreference: "low-power" });
  } catch (err) {
    onState("unsupported");
    return { destroy() {} };
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, isSmall ? 1.5 : 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = !isSmall;          // one soft shadow only, desktop
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 50);
  const camBase = new THREE.Vector3(0, 3.0, 8.6);
  const lookAt = new THREE.Vector3(0, 2.3, 0);
  camera.position.copy(camBase);

  const disposables = [];
  const track = (o) => { disposables.push(o); return o; };
  const mat = (opts) => track(new THREE.MeshStandardMaterial(opts));

  /* ---------- lights ---------- */
  const amb = new THREE.AmbientLight(0xffffff, 0.8);
  const key = new THREE.DirectionalLight(0xffffff, 2);
  key.position.set(-3, 5, 4);
  key.castShadow = !isSmall;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4; key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;   key.shadow.camera.bottom = -2;
  key.shadow.radius = 5;
  const lampLight = new THREE.PointLight(0xffb870, 14, 7, 2);
  lampLight.position.set(-2.1, 2.5, 0.4);
  const fill = new THREE.PointLight(0xfff1dc, 9, 12, 2); fill.position.set(1.5, 3.6, 5);
  const rim = new THREE.PointLight(0xd9854b, 8, 10, 2); rim.position.set(-3, 4, -3);
  scene.add(amb, key, lampLight, fill, rim);

  /* ---------- workstation ---------- */
  const rig = new THREE.Group();
  scene.add(rig);

  const deskMat = mat({ color: 0x8a6a4a, roughness: 0.62, metalness: 0.05 });
  const desk = new THREE.Mesh(track(new THREE.BoxGeometry(6, 0.14, 2.6)), deskMat);
  desk.position.set(0, 0.75, 0.2); desk.receiveShadow = true; desk.castShadow = true;
  rig.add(desk);
  const legGeo = track(new THREE.BoxGeometry(0.12, 1.5, 0.12));
  const legMat = mat({ color: 0x2b2926, roughness: 0.5, metalness: 0.4 });
  [[-2.8, 0.9], [2.8, 0.9], [-2.8, -0.5], [2.8, -0.5]].forEach(([x, z]) => {
    const leg = new THREE.Mesh(legGeo, legMat); leg.position.set(x, 0, z); leg.castShadow = true; rig.add(leg);
  });
  const floor = new THREE.Mesh(track(new THREE.PlaneGeometry(14, 8)), track(new THREE.ShadowMaterial({ opacity: 0.12 })));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.74; floor.receiveShadow = true; rig.add(floor);

  // laptop
  const alu = mat({ color: 0xcfc9bf, roughness: 0.5, metalness: 0.25 });
  const laptop = new THREE.Group(); laptop.position.set(0, 0.82, 0.35); laptop.rotation.y = Math.PI; rig.add(laptop);
  const base = new THREE.Mesh(track(new THREE.BoxGeometry(2.1, 0.07, 1.4)), alu); base.castShadow = true; laptop.add(base);
  const keys = new THREE.Mesh(track(new THREE.PlaneGeometry(1.8, 0.7)),
    mat({ color: 0x24221f, roughness: 0.9 }));
  keys.rotation.x = -Math.PI / 2; keys.position.set(0, 0.04, -0.12); laptop.add(keys);
  const hinge = new THREE.Group(); hinge.position.set(0, 0.04, -0.68); hinge.rotation.x = -0.28; laptop.add(hinge);
  const lid = new THREE.Mesh(track(new THREE.BoxGeometry(2.1, 1.1, 0.05)), alu); lid.position.y = 0.55; lid.castShadow = true; hinge.add(lid);

  // screen texture (code lines, redrawn at a low rate)
  const sc = document.createElement("canvas"); sc.width = 512; sc.height = 320;
  const sctx = sc.getContext("2d");
  const screenTex = track(new THREE.CanvasTexture(sc)); screenTex.colorSpace = THREE.SRGBColorSpace;
  const screenMat = track(new THREE.MeshBasicMaterial({ map: screenTex, toneMapped: false }));
  const screen = new THREE.Mesh(track(new THREE.PlaneGeometry(1.94, 0.98)), screenMat);
  screen.position.set(0, 0.55, 0.03); hinge.add(screen);
  const codeRows = [[0, 0.5, "#C9A66B"], [1, 0.72, "#d9d2c5"], [2, 0.38, "#D9854B"], [2, 0.6, "#d9d2c5"], [1, 0.46, "#d9d2c5"],
                    [0, 0.66, "#C9A66B"], [1, 0.3, "#8f887c"], [2, 0.7, "#d9d2c5"], [1, 0.52, "#D9854B"], [0, 0.4, "#C9A66B"]];
  function drawScreen(t) {
    sctx.fillStyle = "#1c1b19"; sctx.fillRect(0, 0, 512, 320);
    sctx.fillStyle = "#2a2825"; sctx.fillRect(0, 0, 512, 26);
    ["#D9854B", "#C9A66B", "#8f887c"].forEach((c, i) => { sctx.fillStyle = c; sctx.beginPath(); sctx.arc(18 + i * 18, 13, 4, 0, 6.3); sctx.fill(); });
    const shift = Math.floor(t / 900) % codeRows.length;
    codeRows.forEach((_, i) => {
      const [indent, w, color] = codeRows[(i + shift) % codeRows.length];
      sctx.fillStyle = color; sctx.globalAlpha = 0.9;
      sctx.fillRect(28 + indent * 28, 52 + i * 25, w * 360, 9);
    });
    sctx.globalAlpha = 1; sctx.fillStyle = "#C9A66B"; sctx.fillRect(28, 52 + 10 * 25, 10, 14);
    screenTex.needsUpdate = true;
  }
  drawScreen(0);

  // desk lamp (left)
  const lamp = new THREE.Group(); lamp.position.set(-2.2, 0.82, -0.2); rig.add(lamp);
  const metal = mat({ color: 0x2f2c28, roughness: 0.4, metalness: 0.7 });
  const lampBase = new THREE.Mesh(track(new THREE.CylinderGeometry(0.28, 0.32, 0.06, 28)), metal);
  const arm1 = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 10)), metal);
  arm1.position.set(0, 0.68, 0); arm1.rotation.z = 0.12;
  const arm2 = new THREE.Mesh(track(new THREE.CylinderGeometry(0.03, 0.03, 0.9, 10)), metal);
  arm2.position.set(0.28, 1.28, 0); arm2.rotation.z = -1.0;
  const shade = new THREE.Mesh(track(new THREE.ConeGeometry(0.3, 0.38, 28, 1, true)),
    mat({ color: 0xc9a66b, roughness: 0.45, metalness: 0.6, side: THREE.DoubleSide, emissive: 0x5b3a12, emissiveIntensity: 0.6 }));
  shade.position.set(0.62, 1.46, 0.05); shade.rotation.z = -0.5;
  [lampBase, arm1, arm2, shade].forEach((m) => { m.castShadow = true; lamp.add(m); });
  lampLight.position.set(-2.2 + 0.62, 0.82 + 1.3, -0.1);


  // external monitor facing the viewer, shows the same code
  const monitor = new THREE.Group(); monitor.position.set(2.05, 0.82, -0.15); monitor.rotation.y = -0.4; rig.add(monitor);
  const stand = new THREE.Mesh(track(new THREE.CylinderGeometry(0.05, 0.05, 0.55, 12)), metal); stand.position.y = 0.3;
  const foot = new THREE.Mesh(track(new THREE.CylinderGeometry(0.3, 0.3, 0.04, 24)), metal); foot.position.y = 0.03;
  const bezel = new THREE.Mesh(track(new THREE.BoxGeometry(1.6, 1.0, 0.05)), mat({ color: 0x1d1c1a, roughness: 0.5, metalness: 0.5 }));
  bezel.position.y = 0.95; bezel.castShadow = true;
  const mscreen = new THREE.Mesh(track(new THREE.PlaneGeometry(1.5, 0.9)), screenMat); mscreen.position.set(0, 0.95, 0.03);
  monitor.add(stand, foot, bezel, mscreen);

  // mug + books
  const mug = new THREE.Mesh(track(new THREE.CylinderGeometry(0.17, 0.15, 0.3, 24)), mat({ color: 0xf1ebe0, roughness: 0.5 }));
  mug.position.set(1.35, 0.97, 0.95); mug.castShadow = true; rig.add(mug);
  const bookColors = [0x393129, 0xc9a66b, 0x6c5a47];
  bookColors.forEach((c, i) => {
    const b = new THREE.Mesh(track(new THREE.BoxGeometry(1.15 - i * 0.08, 0.12, 0.8)), mat({ color: c, roughness: 0.7 }));
    b.position.set(-1.35 - i * 0.02, 0.88 + i * 0.12, 0.8); b.rotation.y = 0.18 - i * 0.12; b.castShadow = true; rig.add(b);
  });

  // gold orbit + code badge
  const orbit = new THREE.Mesh(track(new THREE.TorusGeometry(2.6, 0.014, 8, 160)),
    track(new THREE.MeshBasicMaterial({ color: 0xc9a66b, transparent: true, opacity: 0.85 })));
  orbit.position.set(0, 2.6, -2.0); orbit.rotation.set(1.05, 0.15, 0.3); rig.add(orbit);
  const bc = document.createElement("canvas"); bc.width = 256; bc.height = 160;
  const bctx = bc.getContext("2d");
  bctx.fillStyle = "#FFFCF7"; bctx.beginPath(); bctx.roundRect(4, 4, 248, 152, 28); bctx.fill();
  bctx.strokeStyle = "#C9A66B"; bctx.lineWidth = 4; bctx.stroke();
  bctx.fillStyle = "#242321"; bctx.font = "600 70px ui-monospace, Menlo, Consolas, monospace";
  bctx.textAlign = "center"; bctx.textBaseline = "middle"; bctx.fillText("</>", 128, 84);
  const badgeTex = track(new THREE.CanvasTexture(bc)); badgeTex.colorSpace = THREE.SRGBColorSpace;
  const badge = new THREE.Mesh(track(new THREE.PlaneGeometry(0.9, 0.56)),
    track(new THREE.MeshBasicMaterial({ map: badgeTex, transparent: true, toneMapped: false })));
  badge.position.set(1.55, 3.45, 0.2); rig.add(badge);


  /* ---------- procedural stylized developer (animated in code) ---------- */
  const dev = new THREE.Group(); dev.position.set(0, 0, -1.0); rig.add(dev);
  const skin = mat({ color: 0xc08a64, roughness: 0.6 });
  const hoodie = mat({ color: 0x34312d, roughness: 0.92 });
  const dark = mat({ color: 0x15110f, roughness: 0.85 });
  const add = (geo, m, x, y, z, parent = dev, sx = 1, sy = 1, sz = 1) => {
    const o = new THREE.Mesh(track(geo), m); o.position.set(x, y, z); o.scale.set(sx, sy, sz); o.castShadow = true; parent.add(o); return o;
  };
  // chair back + seat
  add(new THREE.BoxGeometry(1.7, 1.9, 0.14), mat({ color: 0x2f2c28, roughness: 0.6 }), 0, 1.7, -0.62);
  add(new THREE.BoxGeometry(1.5, 0.16, 1.1), mat({ color: 0x2f2c28, roughness: 0.6 }), 0, 1.05, -0.05);
  // torso + hood
  const torso = add(new THREE.CapsuleGeometry(0.5, 0.5, 8, 24), hoodie, 0, 1.75, 0, dev, 1.25, 1, 0.72);
  const hood = add(new THREE.TorusGeometry(0.34, 0.12, 12, 28), hoodie, 0, 2.5, -0.1, dev);
  hood.rotation.x = Math.PI / 2.4;
  [-0.09, 0.09].forEach((x) => add(new THREE.CylinderGeometry(0.012, 0.012, 0.4, 6), mat({ color: 0xd9d2c5, roughness: 0.7 }), x, 2.2, 0.34));
  // arms (shoulder pivots; forearms swing for typing)
  const arms = [-1, 1].map((side) => {
    const sh = new THREE.Group(); sh.position.set(side * 0.7, 2.22, 0); dev.add(sh);
    add(new THREE.SphereGeometry(0.25, 20, 16), hoodie, 0, 0, 0, sh);
    const upper = new THREE.Group(); upper.rotation.x = -0.55; sh.add(upper);
    add(new THREE.CylinderGeometry(0.17, 0.15, 0.8, 16), hoodie, 0, -0.4, 0, upper);
    const fore = new THREE.Group(); fore.position.y = -0.8; fore.rotation.x = -0.85; upper.add(fore);
    add(new THREE.CylinderGeometry(0.14, 0.12, 0.72, 16), hoodie, 0, -0.36, 0, fore);
    add(new THREE.SphereGeometry(0.13, 16, 12), skin, 0, -0.76, 0, fore);
    return { fore, upper, side };
  });
  // head (pivot at neck)
  const head = new THREE.Group(); head.position.set(0, 2.5, 0.02); dev.add(head);
  add(new THREE.CylinderGeometry(0.14, 0.17, 0.2, 16), skin, 0, 0.02, 0, head);
  add(new THREE.SphereGeometry(0.4, 40, 30), skin, 0, 0.45, 0, head, 1, 1.08, 1);
  add(new THREE.SphereGeometry(0.425, 40, 20, 0, Math.PI * 2, 0, Math.PI * 0.52), dark, 0, 0.5, -0.03, head, 1, 1.08, 1); // hair
  add(new THREE.SphereGeometry(0.415, 40, 20, 0, Math.PI * 2, Math.PI * 0.64, Math.PI * 0.36), dark, 0, 0.45, 0.01, head, 1, 1.08, 1); // short beard
  add(new THREE.SphereGeometry(0.06, 12, 10), skin, 0, 0.42, 0.4, head, 1, 0.9, 1);                      // nose
  [-1, 1].forEach((s) => add(new THREE.SphereGeometry(0.07, 12, 10), skin, s * 0.4, 0.43, 0, head, 0.6, 1, 1)); // ears
  const mouth = add(new THREE.BoxGeometry(0.16, 0.025, 0.02), mat({ color: 0xd88f7c, roughness: 0.6 }), 0, 0.22, 0.4, head);
  const eyes = [-1, 1].map((s) => {
    const g = new THREE.Group(); g.position.set(s * 0.15, 0.5, 0.35); head.add(g);
    add(new THREE.SphereGeometry(0.052, 14, 12), mat({ color: 0xffffff, roughness: 0.3 }), 0, 0, 0, g);
    add(new THREE.SphereGeometry(0.03, 12, 10), mat({ color: 0x1a1210, roughness: 0.3 }), 0, 0, 0.034, g);
    add(new THREE.BoxGeometry(0.14, 0.025, 0.03), dark, 0, 0.1, 0.03, head).position.set(s * 0.15, 0.6, 0.37); // brow
    const lens = new THREE.Mesh(track(new THREE.TorusGeometry(0.11, 0.013, 8, 28)), mat({ color: 0x0f0e0d, roughness: 0.4, metalness: 0.5 }));
    lens.position.set(0, 0, 0.04); g.add(lens);
    return g;
  });
  add(new THREE.BoxGeometry(0.07, 0.014, 0.014), mat({ color: 0x0f0e0d, roughness: 0.4 }), 0, 0.5, 0.4, head); // glasses bridge
  head.rotation.x = 0.08;

  // gold dust (kept tiny: a few slow points)
  const N = isSmall ? 28 : 70, pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) { pos[i * 3] = (Math.random() - 0.5) * 7; pos[i * 3 + 1] = Math.random() * 5; pos[i * 3 + 2] = (Math.random() - 0.5) * 3; }
  const dustGeo = track(new THREE.BufferGeometry()); dustGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const dust = new THREE.Points(dustGeo, track(new THREE.PointsMaterial({ color: 0xc9a66b, size: 0.045, transparent: true, opacity: 0.65, depthWrite: false })));
  scene.add(dust);

  let nextBlink = 2000;
  /* ---------- optional character (real GLB only) ---------- */
  const characterSlot = new THREE.Group(); characterSlot.position.set(0.1, 0, -0.55); rig.add(characterSlot);
  let mixer = null, headBone = null, blinkTargets = [], modelLoaded = false;
  let disposed = false;

  async function loadCharacter() {
    try {
      const MODEL_URL = stage.dataset.modelUrl;          // empty until a licensed GLB is supplied
      if (!MODEL_URL) return false;
      const head = await fetch(MODEL_URL, { method: "HEAD", cache: "no-cache" });
      if (!head.ok) return false;                         // no model supplied: workstation only
      const gltf = await new GLTFLoader().loadAsync(MODEL_URL);
      if (disposed) return false;
      const model = gltf.scene;
      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());
      const s = 2.5 / Math.max(size.y, 0.001);            // seated model ~2.5 units tall
      model.scale.setScalar(s);
      box.setFromObject(model);
      const c = box.getCenter(new THREE.Vector3());
      model.position.set(-c.x, 0.82 - box.min.y + 0.0, -c.z);
      model.traverse((o) => {
        if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
        if (o.isBone && /head$/i.test(o.name) && !headBone) headBone = o;
        if (o.isMesh && o.morphTargetDictionary) {
          const idx = Object.keys(o.morphTargetDictionary).filter((k) => /blink/i.test(k));
          if (idx.length) blinkTargets.push({ mesh: o, ids: idx.map((k) => o.morphTargetDictionary[k]) });
        }
      });
      characterSlot.add(model); dev.visible = false;
      if (gltf.animations && gltf.animations.length) {      // use real clips only
        mixer = new THREE.AnimationMixer(model);
        const pick = (re) => gltf.animations.find((a) => re.test(a.name));
        const clip = pick(/typ|work/i) || pick(/idle|breath/i) || gltf.animations[0];
        const action = mixer.clipAction(clip); action.reset().fadeIn(0.6).play();
      }
      modelLoaded = true;
      return true;
    } catch (err) {
      console.warn("[about-3d] character model unavailable, showing workstation only:", err.message);
      return false;
    }
  }

  /* ---------- theme ---------- */
  function applyTheme() {
    const p = PALETTE[document.documentElement.getAttribute("data-theme") === "light" ? "light" : "dark"];
    key.color.setHex(p.key); key.intensity = p.keyI;
    amb.color.setHex(p.amb); amb.intensity = p.ambI;
    deskMat.color.setHex(p.desk);
    screenMat.color.setScalar(p.screen + 0.1);
    renderOnce();
  }
  const themeObserver = new MutationObserver(applyTheme);
  themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });

  /* ---------- sizing ---------- */
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.position.z = camBase.z * (camera.aspect < 0.9 ? 1.18 : 1);
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(() => { resize(); renderOnce(); });
  ro.observe(stage);

  /* ---------- pointer (desktop only, eased) ---------- */
  const target = { x: 0, y: 0 }, cur = { x: 0, y: 0 };
  function onMove(e) {
    const r = stage.getBoundingClientRect();
    target.x = THREE.MathUtils.clamp(((e.clientX - r.left) / r.width) * 2 - 1, -1, 1);
    target.y = THREE.MathUtils.clamp(((e.clientY - r.top) / r.height) * 2 - 1, -1, 1);
  }
  function onLeave() { target.x = 0; target.y = 0; }
  if (!isTouch && !reduceMotion) {
    stage.addEventListener("pointermove", onMove);
    stage.addEventListener("pointerleave", onLeave);
  }

  /* ---------- loop (runs only while visible) ---------- */
  const clock = new THREE.Clock();
  let raf = 0, visible = false, last = 0;
  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (isSmall && now - last < 33) return;               // ~30fps on phones
    last = now;
    const dt = Math.min(clock.getDelta(), 0.05), t = now / 1000;
    cur.x += (target.x - cur.x) * 0.06; cur.y += (target.y - cur.y) * 0.06;
    camera.position.x = camBase.x + cur.x * 0.45;
    camera.position.y = camBase.y - cur.y * 0.22;
    camera.lookAt(lookAt);
    if (!reduceMotion) {
      orbit.rotation.z = 0.3 + t * 0.12;
      badge.position.y = 3.45 + Math.sin(t * 0.9) * 0.07;
      badge.lookAt(camera.position);
      if (Math.floor(now / 900) !== Math.floor((now - 33) / 900)) drawScreen(now);

      // procedural developer: breathing, typing sway, blink, gaze toward pointer
      if (dev.visible) {
        torso.scale.y = 1 + Math.sin(t * 1.6) * 0.012;
        arms.forEach(({ fore, upper, side }, k) => {
          fore.rotation.x = -0.85 + Math.sin(t * 8 + k * 2.4) * 0.05;
          upper.rotation.x = -0.55 + Math.sin(t * 4 + k * 1.7) * 0.015;
        });
        head.rotation.y = THREE.MathUtils.lerp(head.rotation.y, cur.x * 0.5 + Math.sin(t * 0.5) * 0.04, 0.07);
        head.rotation.x = THREE.MathUtils.lerp(head.rotation.x, 0.08 + cur.y * 0.22 + Math.sin(t * 1.1) * 0.015, 0.07);
        const closing = now > nextBlink && now < nextBlink + 130;
        eyes.forEach((e) => (e.scale.y = closing ? 0.12 : 1));
        if (now > nextBlink + 130) nextBlink = now + 2200 + Math.random() * 3200;
      }
      const dp = dustGeo.attributes.position;
      for (let i = 0; i < N; i++) { let y = dp.getY(i) + dt * 0.12; if (y > 5) y = 0; dp.setY(i, y); }
      dp.needsUpdate = true;
      if (mixer) mixer.update(dt);
      if (headBone) {                                      // gentle gaze toward pointer, limited
        headBone.rotation.y = THREE.MathUtils.lerp(headBone.rotation.y, cur.x * 0.35, 0.08);
        headBone.rotation.x = THREE.MathUtils.lerp(headBone.rotation.x, cur.y * 0.18, 0.08);
      }
      if (blinkTargets.length && now > nextBlink) {
        blinkTargets.forEach(({ mesh, ids }) => ids.forEach((i) => (mesh.morphTargetInfluences[i] = 1)));
        setTimeout(() => blinkTargets.forEach(({ mesh, ids }) => ids.forEach((i) => (mesh.morphTargetInfluences[i] = 0))), 120);
        nextBlink = now + 2500 + Math.random() * 3500;
      }
    }
    renderer.render(scene, camera);
  }
  function renderOnce() { if (!raf) { resize(); camera.lookAt(lookAt); renderer.render(scene, camera); } }
  function start() { if (!raf && !reduceMotion) { clock.start(); raf = requestAnimationFrame(frame); } }
  function stop() { if (raf) { cancelAnimationFrame(raf); raf = 0; } }

  const io = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting && !document.hidden;
    visible ? start() : stop();
    if (visible) renderOnce();
  }, { threshold: 0.05 });
  io.observe(stage);
  const onVis = () => { (visible && !document.hidden) ? start() : stop(); };
  document.addEventListener("visibilitychange", onVis);

  // context loss: show the fallback instead of a dead canvas
  canvas.addEventListener("webglcontextlost", (e) => { e.preventDefault(); stop(); onState("unsupported"); });

  applyTheme();
  resize();
  renderOnce();
  onState("ready");
  loadCharacter().then((ok) => { if (ok) stage.dataset.model = "loaded"; else stage.dataset.model = "workstation-only"; renderOnce(); });

  return {
    destroy() {
      disposed = true; stop();
      io.disconnect(); ro.disconnect(); themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVis);
      stage.removeEventListener("pointermove", onMove);
      stage.removeEventListener("pointerleave", onLeave);
      scene.traverse((o) => { if (o.geometry) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach((m) => { m.map && m.map.dispose(); m.dispose(); }); });
      disposables.forEach((d) => d.dispose && d.dispose());
      renderer.dispose();
    },
  };
}
