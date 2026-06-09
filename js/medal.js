import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';

/* =========================================================
   GM TROFÉUS — 3D medal (disco dourado + laurel + fita vermelha)
   Self-contained renderer mounted on #medalCanvas.
========================================================= */
const canvas = document.getElementById('medalCanvas');
if (canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.98;
  renderer.outputColorSpace = THREE.SRGBColorSpace;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
  camera.position.set(0, 1.18, 8.8);
  camera.lookAt(0, 1.18, 0);

  function resize() {
    const w = canvas.clientWidth || 360, h = canvas.clientHeight || 420;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    composer.setSize(w, h);
  }

  renderer.setClearColor(0x000000, 0);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new UnrealBloomPass(new THREE.Vector2(360, 460), 0.16, 0.45, 0.92));
  composer.addPass(new OutputPass());

  /* ---- Studio env ---- */
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envScene = new THREE.Scene();
  const gctx = document.createElement('canvas'); gctx.width = 2; gctx.height = 256;
  const g2d = gctx.getContext('2d');
  const grd = g2d.createLinearGradient(0, 0, 0, 256);
  grd.addColorStop(0, '#6a6252'); grd.addColorStop(0.45, '#27241c'); grd.addColorStop(0.72, '#15130e'); grd.addColorStop(1, '#070708');
  g2d.fillStyle = grd; g2d.fillRect(0, 0, 2, 256);
  envScene.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 32), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: new THREE.CanvasTexture(gctx) })));
  // soft-edged softbox texture for realistic feathered reflections
  const sbTex = (() => {
    const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d');
    const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
    g.addColorStop(0.85, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g; x.fillRect(0, 0, S, S);
    return new THREE.CanvasTexture(c);
  })();
  function panel(x, y, z, c, inten, w, h) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, map: sbTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(x, y, z); m.material.color.multiplyScalar(inten); m.lookAt(0, 1, 0); envScene.add(m); }
  panel(8, 8, 7, 0xfff0cf, 3.2, 14, 14); panel(-9, 3, 5, 0xa8c4ff, 1.4, 12, 12); panel(0, -6, 6, 0xffffff, 0.9, 10, 10);
  panel(2, 1, 10, 0xfff4e0, 0.7, 15, 15);   // frontal fill — no dead-black reflections
  // crisp softbox strips → elongated streaks on the polished disc
  panel(5.5, 2, 7, 0xffffff, 5.0, 0.8, 10);
  panel(-6, 1.5, 6, 0xdce9ff, 2.6, 0.6, 8.5);
  panel(0, 8.5, 4, 0xfff0d6, 3.0, 10, 0.7);
  const envMap = pmrem.fromScene(envScene, 0.018).texture;
  scene.environment = envMap;

  scene.add(new THREE.AmbientLight(0xffffff, 0.22));
  const key = new THREE.DirectionalLight(0xfff2da, 1.7); key.position.set(4, 7, 6); scene.add(key);
  const rim = new THREE.DirectionalLight(0xffb84d, 1.15); rim.position.set(-5, 3, -4); scene.add(rim);

  // imperfection roughness map — believable varied glints on the metal
  const roughTex = (() => {
    const S = 512, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d');
    x.fillStyle = '#d6d6d6'; x.fillRect(0, 0, S, S);
    for (let i = 0; i < 60; i++) {
      const px = Math.random() * S, py = Math.random() * S, r = 30 + Math.random() * 140;
      const g = x.createRadialGradient(px, py, 0, px, py, r);
      const d = 150 + Math.random() * 55;
      g.addColorStop(0, `rgba(${d},${d},${d},0.5)`); g.addColorStop(1, 'rgba(150,150,150,0)');
      x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill();
    }
    const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(2, 2);
    return t;
  })();

  const gold = new THREE.MeshPhysicalMaterial({ color: 0xDDA82A, metalness: 1, roughness: 0.22, roughnessMap: roughTex, envMap, envMapIntensity: 1.9, clearcoat: 0.6, clearcoatRoughness: 0.12 });
  const goldBr = new THREE.MeshPhysicalMaterial({ color: 0xF4C84E, metalness: 1, roughness: 0.14, roughnessMap: roughTex, envMap, envMapIntensity: 2.1, clearcoat: 0.65, clearcoatRoughness: 0.1 });
  const goldDp = new THREE.MeshPhysicalMaterial({ color: 0xA1740E, metalness: 1, roughness: 0.34, roughnessMap: roughTex, envMap, envMapIntensity: 1.55, clearcoat: 0.5, clearcoatRoughness: 0.22 });
  const red = new THREE.MeshStandardMaterial({ color: 0xC2202D, metalness: 0.06, roughness: 0.58, envMap, envMapIntensity: 0.5, side: THREE.DoubleSide });
  const redDk = new THREE.MeshStandardMaterial({ color: 0x8E1620, metalness: 0.06, roughness: 0.6, side: THREE.DoubleSide });

  const root = new THREE.Group();
  scene.add(root);

  /* ---- Ribbon — two straps that CONVERGE at the eyelet and thread
     through it (proper medal hang), with a folded knot hiding the join. ---- */
  const ribbon = new THREE.Group();
  const PIVOT_Y = 1.06;        // straps meet here, at the eyelet
  function strap(side) {
    const g = new THREE.Group();
    const h = 2.7;
    const b = new THREE.Mesh(new THREE.BoxGeometry(0.44, h, 0.06), red);
    b.position.y = h / 2;                       // box rises from the pivot
    g.add(b);
    // subtle darker underside fold for depth
    const fold = new THREE.Mesh(new THREE.BoxGeometry(0.44, h, 0.05), redDk);
    fold.position.set(0, h / 2, -0.05); g.add(fold);
    g.position.set(0, PIVOT_Y, -0.05);
    g.rotation.z = side * 0.24;                 // fan upward/outward into a V
    return g;
  }
  ribbon.add(strap(1)); ribbon.add(strap(-1));
  // folded knot at the convergence, sits in front of the eyelet
  const knot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.12), red);
  knot.position.set(0, PIVOT_Y + 0.02, 0.04); ribbon.add(knot);
  const knotShade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), redDk);
  knotShade.position.set(0, PIVOT_Y - 0.08, 0.05); ribbon.add(knotShade);
  root.add(ribbon);

  /* ---- Inscription overlay (engraved) — only the bottom arc so the
     ribbon at the top NEVER covers the brand. Transparent canvas. ---- */
  function makeInscription() {
    const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d'), cx = S / 2, cy = S / 2;
    function arcText(txt, radius, centerAng, dir, font, color, spacing) {
      x.save(); x.fillStyle = color; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
      const total = (txt.length - 1) * spacing;
      for (let i = 0; i < txt.length; i++) {
        const a = centerAng + dir * (i * spacing - total / 2);
        x.save();
        x.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
        x.rotate(a + (dir > 0 ? Math.PI / 2 : -Math.PI / 2));
        x.fillText(txt[i], 0, 0); x.restore();
      }
      x.restore();
    }
    const R = S * 0.40;
    // bottom arc — engraved shadow then bright top edge
    arcText('GM  TROFÉUS', R + 3, Math.PI / 2, -1, '600 46px Georgia, serif', 'rgba(60,38,4,0.85)', 0.116);
    arcText('GM  TROFÉUS', R, Math.PI / 2, -1, '600 46px Georgia, serif', 'rgba(255,238,176,0.9)', 0.116);
    // small flanking stars near the top sides (decorative, clear of ribbon)
    [Math.PI * 1.18, Math.PI * 1.82].forEach((a) => {
      x.save(); x.translate(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
      x.fillStyle = 'rgba(255,238,176,0.85)'; x.font = '30px Georgia'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText('✦', 0, 0); x.restore();
    });
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8; tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }
  const inscriptionTex = makeInscription();

  /* ---- Medal disc — REAL 3D relief (no flat sticker) ---- */
  const disc = new THREE.Group();
  // connector nub from disc top up to the eyelet
  const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 24), goldBr);
  neck.position.y = 0.99; disc.add(neck);
  // eyelet ring the ribbon threads through (sits just behind the knot)
  const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 20, 48), goldBr);
  eyelet.position.set(0, 1.12, -0.02); disc.add(eyelet);
  // metal blank (edge thickness)
  const body = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.16, 120), gold);
  body.rotation.x = Math.PI / 2; disc.add(body);
  // bright polished face plate
  const faceMat = new THREE.MeshPhysicalMaterial({ color: 0xE6B43E, metalness: 1, roughness: 0.15, roughnessMap: roughTex, envMap, envMapIntensity: 2.1, clearcoat: 0.6, clearcoatRoughness: 0.1 });
  const face = new THREE.Mesh(new THREE.CircleGeometry(0.95, 160), faceMat);
  face.position.z = 0.081; disc.add(face);
  const back = new THREE.Mesh(new THREE.CircleGeometry(0.95, 160), gold);
  back.position.z = -0.081; back.rotation.y = Math.PI; disc.add(back);
  // recessed central field (darker polished gold, sits slightly below the face)
  const fieldMat = new THREE.MeshPhysicalMaterial({ color: 0xB78A24, metalness: 1, roughness: 0.28, roughnessMap: roughTex, envMap, envMapIntensity: 1.7, clearcoat: 0.5, clearcoatRoughness: 0.18 });
  const field = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 96), fieldMat);
  field.rotation.x = Math.PI / 2; field.position.z = 0.07; disc.add(field);
  // inner step ring catching a bright highlight at the field edge
  const stepRing = new THREE.Mesh(new THREE.TorusGeometry(0.625, 0.022, 18, 150), goldBr);
  stepRing.position.z = 0.085; disc.add(stepRing);
  // engraved inscription overlay (bottom arc)
  const insMat = new THREE.MeshBasicMaterial({ map: inscriptionTex, transparent: true, depthWrite: false });
  const ins = new THREE.Mesh(new THREE.CircleGeometry(0.95, 96), insMat);
  ins.position.z = 0.072; disc.add(ins);
  // smooth raised polished rim
  const rimT = new THREE.Mesh(new THREE.TorusGeometry(0.945, 0.05, 28, 180), goldBr);
  disc.add(rimT);

  /* ---- Raised 3D "1º" centerpiece (real extruded geometry) ---- */
  const numGroup = new THREE.Group();
  const oneShape = new THREE.Shape();
  oneShape.moveTo(-0.135, -0.26); oneShape.lineTo(0.135, -0.26); oneShape.lineTo(0.135, -0.185);
  oneShape.lineTo(0.062, -0.185); oneShape.lineTo(0.062, 0.27); oneShape.lineTo(-0.045, 0.27);
  oneShape.lineTo(-0.14, 0.185); oneShape.lineTo(-0.085, 0.115); oneShape.lineTo(-0.038, 0.16);
  oneShape.lineTo(-0.038, -0.185); oneShape.lineTo(-0.135, -0.185); oneShape.closePath();
  const numMat = new THREE.MeshPhysicalMaterial({ color: 0xF4CC55, metalness: 1, roughness: 0.13, envMap, envMapIntensity: 2.2, clearcoat: 0.65, clearcoatRoughness: 0.09 });
  const one = new THREE.Mesh(new THREE.ExtrudeGeometry(oneShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 2 }), numMat);
  one.position.set(-0.05, -0.01, 0.05); numGroup.add(one);
  // degree ring "º"
  const deg = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.022, 16, 40), numMat);
  deg.position.set(0.135, 0.16, 0.085); numGroup.add(deg);
  numGroup.scale.set(1.08, 1.08, 1);
  disc.add(numGroup);

  /* ---- Real 3D laurel wreath framing the centerpiece (open at top) ---- */
  const leafMat = goldBr;
  const Rw = 0.46;
  for (let s = -1; s <= 1; s += 2) {
    for (let i = 0; i < 9; i++) {
      const a = Math.PI / 2 + s * (0.32 + i * 0.20);   // sweep up each side from the bottom
      const lx = Math.cos(a) * Rw, ly = Math.sin(a) * Rw;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), leafMat);
      leaf.scale.set(0.42, 1.0, 0.32);
      leaf.position.set(lx, ly, 0.075);
      leaf.rotation.z = a - Math.PI / 2 + s * 0.5;
      disc.add(leaf);
    }
  }
  // berries where the sprigs meet at the bottom
  for (let i = -1; i <= 1; i++) {
    const b = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), numMat);
    b.position.set(i * 0.05, -Rw - 0.01, 0.08); disc.add(b);
  }
  root.add(disc);

  root.position.y = -0.15;

  /* ---- Animate ---- */
  const clock = new THREE.Clock();
  let inView = true;
  function frame() {
    const t = clock.getElapsedTime();
    disc.rotation.y = Math.sin(t * 0.45) * 0.26;   // small sway, face stays readable
    root.rotation.z = Math.sin(t * 0.8) * 0.04;              // subtle pendulum sway
    root.position.y = -0.15 + Math.sin(t * 0.9) * 0.03;
    composer.render();
  }
  window.__medalFrame = frame;
  function loop() { if (inView) frame(); requestAnimationFrame(loop); }

  // pause when offscreen for perf
  const sec = canvas.closest('section');
  if (sec && 'IntersectionObserver' in window) {
    new IntersectionObserver((es) => { inView = es[0].isIntersecting; }, { threshold: 0.01 }).observe(sec);
  }

  resize();
  window.addEventListener('resize', resize);
  frame();
  loop();
  window.__medalReady = true;
}
