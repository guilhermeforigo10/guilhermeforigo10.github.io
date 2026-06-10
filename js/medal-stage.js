import * as THREE from 'three';

/* =========================================================
   GM TROFÉUS — MEDAL STAGE (scroll-scrubbed, full viewport)
   The medal is the hero star: scrolling advances a 360° turn.

   ── HOW TO SWAP IN YOUR RENDERED ASSET ──────────────────
   Default backend is 'three' (a live 3D medal placeholder so the
   page works today). When your Meshy/Blender export is ready:

   • Frame sequence (RECOMMENDED — transparent, smooth everywhere):
       drop medal_0001.webp … medal_0120.webp into  frames/
       then set:  type: 'frames'

   • Video (fallback — see GUIA-medalha-scroll-video.md):
       set:  type: 'video'  and provide webm + mov sources.
========================================================= */
/* ─────────────────────────────────────────────────────────────────
   MEDALHA DO TOPO — fonte da animação (scroll-scrub)
   ─────────────────────────────────────────────────────────────────
   COMO USAR UM VÍDEO HOSPEDADO no lugar dos quadros:
     1. Cole o link DIRETO do arquivo .mp4 em HOSTED_MP4 abaixo.
        ⚠ Precisa ser o ARQUIVO .mp4 — NÃO o embed/iframe do player.
        Gumlet, ex.:  https://video.gumlet.io/<colecao>/<assetId>/main.mp4
        (o embed play.gumlet.io/embed/... NÃO funciona aqui — é um player,
         não dá para controlar por scroll nem desenhar no canvas.)
     2. Troque  type: 'frames'  por  type: 'video'.
   Os quadros em frames/ continuam como fallback suave e funcionam offline,
   então o site nunca fica sem medalha enquanto o vídeo não está pronto.
───────────────────────────────────────────────────────────────────── */
const HOSTED_MP4 = '';   // ← cole aqui o .mp4 hospedado (Gumlet/servidor)

const MEDAL_SOURCE = {
  type: 'frames',                // 'frames' | 'video' | 'three'
  frames: { dir: 'frames/', prefix: 'medal_', count: 120, pad: 4, ext: 'jpg' },
  video:  { mp4: HOSTED_MP4 || 'assets/medal-orbit.mp4' },
};
// Render de origem é um quadro QUADRADO 1000×1000 (órbita do troféu + medalha).
const SRC_W = 1000, SRC_H = 1000;

const canvas = document.getElementById('medalStage');
const showcase = document.getElementById('showcase');
if (canvas && showcase) {
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const isMobile = () => window.matchMedia('(max-width: 759px)').matches;
  const isTablet = () => window.matchMedia('(min-width: 760px) and (max-width: 1179px)').matches;
  const scTexts = [...showcase.querySelectorAll('.sctext')];

  /* scroll progress across hero + showcase (0 → 1) */
  let scrollY = window.scrollY;
  function range() { return Math.max(1, showcase.offsetTop + showcase.offsetHeight - window.innerHeight * 0.55); }
  function progress() { return clamp(scrollY / range(), 0, 1); }
  // fade the whole stage out as we approach the white section
  function stageOpacity(p) { return 1 - clamp((p - 0.9) / 0.1, 0, 1); }

  // medal sits on the RIGHT (text lives on the left) → never overlaps copy.
  function screenX() { return isMobile() ? 0 : (isTablet() ? 2.45 : 1.95); }
  function medalScale() { return isMobile() ? 1.05 : (isTablet() ? 1.25 : 1.55); }

  /* text choreography: text is visible while ITS panel is centered in the
     viewport — tied to real scroll position, so it stays readable the whole
     time you're on it and only crossfades at the seam between panels. */
  function setTextFade(active) {
    if (!scTexts.length) return;
    const vh = window.innerHeight, mid = vh / 2;
    scTexts.forEach((el) => {
      if (!active) { el.style.opacity = ''; return; }
      const panel = el.closest('.scpanel') || el;
      const r = panel.getBoundingClientRect();
      const dist = Math.abs((r.top + r.height / 2) - mid);
      const o = 1 - clamp((dist - vh * 0.42) / (vh * 0.16), 0, 1);
      el.style.opacity = o.toFixed(3);
    });
  }

  /* ---- Shared cinematic framing for the 16:9 source (frames OR video).
     Fit the FULL trophy by height, push it aside so the text column stays
     clear. Mobile keeps it centered, higher, smaller. ---- */
  function fitParams() {
    const vh = window.innerHeight;
    // Square source: fit by height, push the piece to the RIGHT so the
    // left text column stays clear. Mobile centers it, higher and smaller.
    if (isMobile())  return { scale: (vh / SRC_H) * 0.34, ox: 0.0,  oy: -0.18 };
    if (isTablet())  return { scale: (vh / SRC_H) * 0.918, ox: 0.15, oy: 0.0 };
    return                  { scale: (vh / SRC_H) * 1.044, ox: 0.205, oy: 0.0 };
  }
  function drawCover(ctx, src) {
    const vw = window.innerWidth, vh = window.innerHeight;
    const f = fitParams();
    const dw = SRC_W * f.scale, dh = SRC_H * f.scale;
    const dx = (vw - dw) / 2 + f.ox * vw, dy = (vh - dh) / 2 + f.oy * vh;
    ctx.clearRect(0, 0, vw, vh);
    try { ctx.drawImage(src, dx, dy, dw, dh); } catch (e) {}
  }

  /* ============================================================
     BACKEND: three — live 3D medal placeholder (transparent)
  ============================================================ */
  function initThree() {
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.98;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 100);
    camera.position.set(0, 0, 8.4);
    camera.lookAt(0, 0, 0);

    function resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h; camera.updateProjectionMatrix();
    }

    /* studio environment */
    const pmrem = new THREE.PMREMGenerator(renderer);
    const envScene = new THREE.Scene();
    const gctx = document.createElement('canvas'); gctx.width = 2; gctx.height = 256;
    const g2d = gctx.getContext('2d');
    const grd = g2d.createLinearGradient(0, 0, 0, 256);
    grd.addColorStop(0, '#6a6252'); grd.addColorStop(0.45, '#27241c'); grd.addColorStop(0.72, '#15130e'); grd.addColorStop(1, '#070708');
    g2d.fillStyle = grd; g2d.fillRect(0, 0, 2, 256);
    envScene.add(new THREE.Mesh(new THREE.SphereGeometry(40, 32, 32), new THREE.MeshBasicMaterial({ side: THREE.BackSide, map: new THREE.CanvasTexture(gctx) })));
    const sbTex = (() => {
      const S = 128, c = document.createElement('canvas'); c.width = c.height = S;
      const x = c.getContext('2d');
      const g = x.createRadialGradient(S / 2, S / 2, 4, S / 2, S / 2, S / 2);
      g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.55, 'rgba(255,255,255,0.85)');
      g.addColorStop(0.85, 'rgba(255,255,255,0.25)'); g.addColorStop(1, 'rgba(255,255,255,0)');
      x.fillStyle = g; x.fillRect(0, 0, S, S);
      return new THREE.CanvasTexture(c);
    })();
    function panel(x, y, z, c, inten, w, h) { const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: c, map: sbTex, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.position.set(x, y, z); m.material.color.multiplyScalar(inten); m.lookAt(0, 0, 0); envScene.add(m); }
    panel(8, 8, 7, 0xfff0cf, 3.2, 14, 14); panel(-9, 3, 5, 0xa8c4ff, 1.4, 12, 12); panel(0, -6, 6, 0xffffff, 0.9, 10, 10);
    panel(2, 1, 10, 0xfff4e0, 0.7, 15, 15);
    panel(5.5, 2, 7, 0xffffff, 5.0, 0.8, 10); panel(-6, 1.5, 6, 0xdce9ff, 2.6, 0.6, 8.5); panel(0, 8.5, 4, 0xfff0d6, 3.0, 10, 0.7);
    const envMap = pmrem.fromScene(envScene, 0.018).texture;
    scene.environment = envMap;
    scene.add(new THREE.AmbientLight(0xffffff, 0.22));
    const key = new THREE.DirectionalLight(0xfff2da, 1.7); key.position.set(4, 7, 6); scene.add(key);
    const rim = new THREE.DirectionalLight(0xffb84d, 1.15); rim.position.set(-5, 3, -4); scene.add(rim);

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
    const red = new THREE.MeshStandardMaterial({ color: 0xC2202D, metalness: 0.06, roughness: 0.58, envMap, envMapIntensity: 0.5, side: THREE.DoubleSide });
    const redDk = new THREE.MeshStandardMaterial({ color: 0x8E1620, metalness: 0.06, roughness: 0.6, side: THREE.DoubleSide });

    const root = new THREE.Group(); scene.add(root);

    /* ribbon */
    const ribbon = new THREE.Group();
    const PIVOT_Y = 1.06;
    function strap(side) {
      const g = new THREE.Group(); const h = 2.7;
      g.add(new THREE.Mesh(new THREE.BoxGeometry(0.44, h, 0.06), red)).position.y = h / 2;
      const fold = new THREE.Mesh(new THREE.BoxGeometry(0.44, h, 0.05), redDk); fold.position.set(0, h / 2, -0.05); g.add(fold);
      g.position.set(0, PIVOT_Y, -0.05); g.rotation.z = side * 0.24; return g;
    }
    ribbon.add(strap(1)); ribbon.add(strap(-1));
    const knot = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.28, 0.12), red); knot.position.set(0, PIVOT_Y + 0.02, 0.04); ribbon.add(knot);
    const knotShade = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.1, 0.1), redDk); knotShade.position.set(0, PIVOT_Y - 0.08, 0.05); ribbon.add(knotShade);
    root.add(ribbon);

    /* inscription overlay */
    function makeInscription() {
      const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
      const x = c.getContext('2d'), cx = S / 2, cy = S / 2;
      function arcText(txt, radius, centerAng, dir, font, color, spacing) {
        x.save(); x.fillStyle = color; x.font = font; x.textAlign = 'center'; x.textBaseline = 'middle';
        const total = (txt.length - 1) * spacing;
        for (let i = 0; i < txt.length; i++) {
          const a = centerAng + dir * (i * spacing - total / 2);
          x.save(); x.translate(cx + Math.cos(a) * radius, cy + Math.sin(a) * radius);
          x.rotate(a + (dir > 0 ? Math.PI / 2 : -Math.PI / 2)); x.fillText(txt[i], 0, 0); x.restore();
        }
        x.restore();
      }
      const R = S * 0.40;
      arcText('GM  TROFÉUS', R + 3, Math.PI / 2, -1, '600 46px Georgia, serif', 'rgba(60,38,4,0.85)', 0.116);
      arcText('GM  TROFÉUS', R, Math.PI / 2, -1, '600 46px Georgia, serif', 'rgba(255,238,176,0.9)', 0.116);
      const tex = new THREE.CanvasTexture(c); tex.anisotropy = 8; tex.colorSpace = THREE.SRGBColorSpace; return tex;
    }
    const inscriptionTex = makeInscription();

    /* disc */
    const disc = new THREE.Group();
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.09, 0.16, 24), goldBr); neck.position.y = 0.99; disc.add(neck);
    const eyelet = new THREE.Mesh(new THREE.TorusGeometry(0.13, 0.05, 20, 48), goldBr); eyelet.position.set(0, 1.12, -0.02); disc.add(eyelet);
    const body = new THREE.Mesh(new THREE.CylinderGeometry(0.95, 0.95, 0.16, 120), gold); body.rotation.x = Math.PI / 2; disc.add(body);
    const faceMat = new THREE.MeshPhysicalMaterial({ color: 0xE6B43E, metalness: 1, roughness: 0.15, roughnessMap: roughTex, envMap, envMapIntensity: 2.1, clearcoat: 0.6, clearcoatRoughness: 0.1 });
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.95, 160), faceMat); face.position.z = 0.081; disc.add(face);
    const back = new THREE.Mesh(new THREE.CircleGeometry(0.95, 160), gold); back.position.z = -0.081; back.rotation.y = Math.PI; disc.add(back);
    const fieldMat = new THREE.MeshPhysicalMaterial({ color: 0xB78A24, metalness: 1, roughness: 0.28, roughnessMap: roughTex, envMap, envMapIntensity: 1.7, clearcoat: 0.5, clearcoatRoughness: 0.18 });
    const field = new THREE.Mesh(new THREE.CylinderGeometry(0.62, 0.62, 0.04, 96), fieldMat); field.rotation.x = Math.PI / 2; field.position.z = 0.07; disc.add(field);
    const stepRing = new THREE.Mesh(new THREE.TorusGeometry(0.625, 0.022, 18, 150), goldBr); stepRing.position.z = 0.085; disc.add(stepRing);
    const insMat = new THREE.MeshBasicMaterial({ map: inscriptionTex, transparent: true, depthWrite: false });
    const ins = new THREE.Mesh(new THREE.CircleGeometry(0.95, 96), insMat); ins.position.z = 0.072; disc.add(ins);
    const rimT = new THREE.Mesh(new THREE.TorusGeometry(0.945, 0.05, 28, 180), goldBr); disc.add(rimT);

    /* raised "1º" */
    const numGroup = new THREE.Group();
    const oneShape = new THREE.Shape();
    oneShape.moveTo(-0.135, -0.26); oneShape.lineTo(0.135, -0.26); oneShape.lineTo(0.135, -0.185);
    oneShape.lineTo(0.062, -0.185); oneShape.lineTo(0.062, 0.27); oneShape.lineTo(-0.045, 0.27);
    oneShape.lineTo(-0.14, 0.185); oneShape.lineTo(-0.085, 0.115); oneShape.lineTo(-0.038, 0.16);
    oneShape.lineTo(-0.038, -0.185); oneShape.lineTo(-0.135, -0.185); oneShape.closePath();
    const numMat = new THREE.MeshPhysicalMaterial({ color: 0xF4CC55, metalness: 1, roughness: 0.13, envMap, envMapIntensity: 2.2, clearcoat: 0.65, clearcoatRoughness: 0.09 });
    const one = new THREE.Mesh(new THREE.ExtrudeGeometry(oneShape, { depth: 0.05, bevelEnabled: true, bevelThickness: 0.018, bevelSize: 0.016, bevelSegments: 2 }), numMat);
    one.position.set(-0.05, -0.01, 0.05); numGroup.add(one);
    const deg = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.022, 16, 40), numMat); deg.position.set(0.135, 0.16, 0.085); numGroup.add(deg);
    numGroup.scale.set(1.08, 1.08, 1); disc.add(numGroup);

    /* laurel */
    const Rw = 0.46;
    for (let s = -1; s <= 1; s += 2) for (let i = 0; i < 9; i++) {
      const a = Math.PI / 2 + s * (0.32 + i * 0.20);
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.05, 12, 10), goldBr);
      leaf.scale.set(0.42, 1.0, 0.32); leaf.position.set(Math.cos(a) * Rw, Math.sin(a) * Rw, 0.075);
      leaf.rotation.z = a - Math.PI / 2 + s * 0.5; disc.add(leaf);
    }
    for (let i = -1; i <= 1; i++) { const b = new THREE.Mesh(new THREE.SphereGeometry(0.028, 12, 12), numMat); b.position.set(i * 0.05, -Rw - 0.01, 0.08); disc.add(b); }
    root.add(disc);
    root.position.y = -0.1;

    resize();
    window.addEventListener('resize', resize);

    return function renderThree(p, op) {
      const t = performance.now() / 1000;
      const sx = screenX(), sc = medalScale();
      root.position.x += (sx - root.position.x) * 0.12;
      root.scale.setScalar(sc);
      // SCROLL drives the 360° turn; gentle pendulum keeps it alive at rest
      disc.rotation.y = p * Math.PI * 2;
      root.rotation.z = Math.sin(t * 0.7) * 0.035;
      root.position.y = -0.1 + Math.sin(t * 0.8) * 0.03;
      renderer.render(scene, camera);
    };
  }

  /* ============================================================
     BACKEND: frames — image sequence scrubber (2D canvas)
  ============================================================ */
  function initFrames() {
    const ctx = canvas.getContext('2d');
    const { dir, prefix, count, pad, ext } = MEDAL_SOURCE.frames;
    const imgs = []; let loaded = 0;
    for (let i = 1; i <= count; i++) {
      const im = new Image();
      im.src = (window.__MEDAL_FRAMES && window.__MEDAL_FRAMES[i - 1])
        ? window.__MEDAL_FRAMES[i - 1]
        : `${dir}${prefix}${String(i).padStart(pad, '0')}.${ext}`;
      im.onload = () => { loaded++; };
      imgs[i - 1] = im;
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener('resize', resize);
    return function renderFrames(p) {
      const idx = clamp(Math.round(p * (count - 1)), 0, count - 1);
      let im = imgs[idx];
      if (!im || !im.complete || !im.naturalWidth) {
        for (let d = 1; d < count && (!im || !im.complete || !im.naturalWidth); d++) {
          const lo = imgs[clamp(idx - d, 0, count - 1)], hi = imgs[clamp(idx + d, 0, count - 1)];
          im = (lo && lo.complete && lo.naturalWidth) ? lo : ((hi && hi.complete && hi.naturalWidth) ? hi : null);
        }
      }
      if (!im || !im.complete || !im.naturalWidth) return;
      drawCover(ctx, im);
    };
  }

  /* ============================================================
     BACKEND: video — scrubbed (2D canvas drawImage)
  ============================================================ */
  function initVideo() {
    const ctx = canvas.getContext('2d');
    const v = document.createElement('video');
    v.muted = true; v.playsInline = true; v.setAttribute('playsinline', ''); v.preload = 'auto';
    // NÃO definir crossOrigin: para um .mp4 remoto sem CORS o vídeo ainda
    // desenha no canvas (a tela tinge, mas só exibimos — nunca lemos pixels).
    v.src = MEDAL_SOURCE.video.mp4;
    v.load();
    let ready = false, lastT = -1;
    v.addEventListener('loadedmetadata', () => { ready = true; });
    v.addEventListener('error', () => { console.warn('[medal] vídeo hospedado não carregou:', v.error && v.error.message); });
    // prime decode so scroll-seeking is responsive
    v.addEventListener('loadeddata', () => { v.play().then(() => { v.pause(); v.currentTime = 0; }).catch(() => {}); }, { once: true });
    // se o navegador suporta, redesenha exatamente o quadro após cada seek
    if ('requestVideoFrameCallback' in v) {
      const onVF = () => { drawCover(ctx, v); v.requestVideoFrameCallback(onVF); };
      v.requestVideoFrameCallback(onVF);
    }
    function resize() {
      const dpr = Math.min(window.devicePixelRatio, 2);
      canvas.width = window.innerWidth * dpr; canvas.height = window.innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize(); window.addEventListener('resize', resize);
    return function renderVideo(p) {
      if (!ready || !v.duration || v.readyState < 1) return;
      const target = clamp(p, 0, 1) * (v.duration - 0.05);
      if (Math.abs(target - lastT) > 0.012) { v.currentTime = target; lastT = target; }
      if (v.readyState >= 2) drawCover(ctx, v);
    };
  }

  /* ---- boot ---- */
  const scrim = document.getElementById('stageScrim');
  let render;
  if (MEDAL_SOURCE.type === 'frames') render = initFrames();
  else if (MEDAL_SOURCE.type === 'video') render = initVideo();
  else render = initThree();

  window.addEventListener('scroll', () => { scrollY = window.scrollY; }, { passive: true });

  function loop() {
    const p = progress();
    const op = stageOpacity(p);
    canvas.style.opacity = op.toFixed(3);
    if (scrim) scrim.style.opacity = op.toFixed(3);
    const active = op > 0.02;
    setTextFade(active && !isMobile());
    if (active) render(p, op);
    requestAnimationFrame(loop);
  }
  loop();
  window.__medalStageReady = true;
  // hide loader once first frame is up — hard-hide via JS (the continuous WebGL
  // render loop can starve the CSS opacity transition, so don't rely on it).
  function hideLoader() {
    const l = document.getElementById('loader');
    if (!l) return;
    l.classList.add('done');
    setTimeout(() => { l.style.opacity = '0'; l.style.visibility = 'hidden'; l.style.pointerEvents = 'none'; }, 60);
    setTimeout(() => { l.style.display = 'none'; }, 700);
  }
  requestAnimationFrame(() => setTimeout(hideLoader, 350));
}
