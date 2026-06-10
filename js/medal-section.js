/* =========================================================
   GM TROFÉUS — Medalha da seção "Garantia do Pódio"
   Sequência de quadros (órbita 360°) pré-carregada, desenhada em
   <canvas> e controlada pelo scroll da seção — com suavização
   (lerp) para um giro fluido. Os quadros têm fundo PRETO e a seção
   também é preta, então a medalha se funde no fundo sem moldura.
========================================================= */
(function () {
  const cv = document.getElementById('medalVidCanvas');
  if (!cv) return;
  const ctx = cv.getContext('2d');
  const sec = cv.closest('section') || cv.parentElement;

  const COUNT = 72, PAD = 4;
  const imgs = [];
  for (let i = 1; i <= COUNT; i++) {
    const im = new Image();
    // quadros PNG com fundo transparente (preto recortado por luminância)
    im.src = (window.__MEDAL2_FRAMES && window.__MEDAL2_FRAMES[i - 1])
      ? window.__MEDAL2_FRAMES[i - 1]
      : 'frames-medal/m_' + String(i).padStart(PAD, '0') + '.png';
    imgs[i - 1] = im;
  }

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const r = cv.getBoundingClientRect();
    cv.width = Math.max(1, Math.round(r.width * dpr));
    cv.height = Math.max(1, Math.round(r.height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  // Progresso-alvo: 0 quando a seção entra por baixo, 1 quando sai por cima.
  function targetProgress() {
    const rr = sec.getBoundingClientRect();
    const vh = window.innerHeight || document.documentElement.clientHeight;
    return Math.max(0, Math.min(1, (vh - rr.top) / (vh + rr.height)));
  }

  function pickImg(p) {
    let idx = Math.round(p * (COUNT - 1));
    idx = Math.max(0, Math.min(COUNT - 1, idx));
    let im = imgs[idx];
    if (im && im.complete && im.naturalWidth) return im;
    // fallback: vizinho carregado mais próximo
    for (let d = 1; d < COUNT; d++) {
      const lo = imgs[Math.max(0, idx - d)], hi = imgs[Math.min(COUNT - 1, idx + d)];
      if (lo && lo.complete && lo.naturalWidth) return lo;
      if (hi && hi.complete && hi.naturalWidth) return hi;
    }
    return null;
  }

  // Caixa real da medalha + fita dentro do quadro, medida em TODOS os
  // ângulos do giro (união): X 0.21–0.78, Y 0–0.94. Recortamos as margens
  // pretas com folga para a medalha NUNCA ser cortada ao girar.
  const BB = { x0: 0.18, y0: 0.0, x1: 0.81, y1: 0.95 };
  function draw(p) {
    const r = cv.getBoundingClientRect();
    const cw = r.width, ch = r.height;
    ctx.clearRect(0, 0, cw, ch);
    const im = pickImg(p);
    if (!im) return;
    const iw = im.naturalWidth, ih = im.naturalHeight;
    const sx = iw * BB.x0, sy = ih * BB.y0;
    const sw = iw * (BB.x1 - BB.x0), sh = ih * (BB.y1 - BB.y0);
    const scale = Math.min(cw / sw, ch / sh) * 0.94; // respiro p/ nunca encostar nas bordas
    const dw = sw * scale, dh = sh * scale;
    const dx = (cw - dw) / 2;          // centralizado na horizontal
    // no mobile a fita cola no topo (emenda com a seção branca acima);
    // no desktop mantém um respiro maior.
    const dyFactor = (window.innerWidth < 700) ? 0.0 : 0.30;
    const dy = (ch - dh) * dyFactor;
    ctx.drawImage(im, sx, sy, sw, sh, dx, dy, dw, dh);
  }

  // suavização: a posição exibida persegue o alvo do scroll (giro fluido)
  let cur = targetProgress();
  function loop() {
    const t = targetProgress();
    cur += (t - cur) * 0.14;
    if (Math.abs(t - cur) < 0.0005) cur = t;
    draw(cur);
    requestAnimationFrame(loop);
  }
  loop();
})();
