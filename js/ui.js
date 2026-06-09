/* =========================================================
   GM TROFÉUS — UI logic (icons, timeline, cards, gallery,
   adaptive nav, reveals). No emoji — thin-stroke SVG icons.
========================================================= */
(function () {
  'use strict';
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  /* ---------- Icon set (1.5 stroke, currentColor) ---------- */
  /* Duotone set: f = soft fill shape (depth), l = crisp stroke markup.
     Geometry refined toward Lucide proportions. */
  const I = {
    chat: {
      f: 'M21 11.5a8.5 8.5 0 0 1-12.3 7.6L4 20.5l1.4-4.6A8.5 8.5 0 1 1 21 11.5Z',
      l: '<path d="M21 11.5a8.5 8.5 0 0 1-12.3 7.6L4 20.5l1.4-4.6A8.5 8.5 0 1 1 21 11.5Z"/><path d="M8.5 11.5h.01"/><path d="M12 11.5h.01"/><path d="M15.5 11.5h.01"/>' },
    receipt: {
      f: 'M6 2.5h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z',
      l: '<path d="M6 2.5h12v18l-2-1.3-2 1.3-2-1.3-2 1.3-2-1.3-2 1.3Z"/><path d="M9 8h6"/><path d="M9 11.5h6"/><path d="M9 15h4"/>' },
    box: {
      f: 'M12 2.7 20 7v10l-8 4.3L4 17V7Z',
      l: '<path d="M12 2.7 20 7v10l-8 4.3L4 17V7Z"/><path d="M4.2 7.2 12 11.6 19.8 7.2"/><path d="M12 11.6v9.7"/>' },
    factory: {
      f: 'M2.5 21V10.2l5.5 3.5v-3.5l5.5 3.5v-3.5l5.5 3.5V21Z',
      l: '<path d="M2.5 21V10.2l5.5 3.5v-3.5l5.5 3.5v-3.5l5.5 3.5V21Z"/><path d="M2 21h20"/><path d="M6.8 21v-3.2h2.4V21"/><path d="M13.4 21v-3.2h2.4V21"/>' },
    badge: {
      f: 'M9.7 3.4a3 3 0 0 1 4.6 0 3 3 0 0 0 2.1.9 3 3 0 0 1 3.3 3.3 3 3 0 0 0 .9 2.1 3 3 0 0 1 0 4.6 3 3 0 0 0-.9 2.1 3 3 0 0 1-3.3 3.3 3 3 0 0 0-2.1.9 3 3 0 0 1-4.6 0 3 3 0 0 0-2.1-.9 3 3 0 0 1-3.3-3.3 3 3 0 0 0-.9-2.1 3 3 0 0 1 0-4.6 3 3 0 0 0 .9-2.1 3 3 0 0 1 3.3-3.3 3 3 0 0 0 2.1-.9Z',
      l: '<path d="M9.7 3.4a3 3 0 0 1 4.6 0 3 3 0 0 0 2.1.9 3 3 0 0 1 3.3 3.3 3 3 0 0 0 .9 2.1 3 3 0 0 1 0 4.6 3 3 0 0 0-.9 2.1 3 3 0 0 1-3.3 3.3 3 3 0 0 0-2.1.9 3 3 0 0 1-4.6 0 3 3 0 0 0-2.1-.9 3 3 0 0 1-3.3-3.3 3 3 0 0 0-.9-2.1 3 3 0 0 1 0-4.6 3 3 0 0 0 .9-2.1 3 3 0 0 1 3.3-3.3 3 3 0 0 0 2.1-.9Z"/><path d="M8.5 12l2.3 2.3L15.5 9.5"/>' },
    truck: {
      f: 'M3 6.6h10.5V16H3Z',
      l: '<path d="M3 16.2V7.6a1 1 0 0 1 1-1h8.5a1 1 0 0 1 1 1v8.6"/><path d="M14 9.5h3.3a1 1 0 0 1 .8.4l2.4 3.1a1 1 0 0 1 .2.6v2.6"/><path d="M3 16.2h1.4"/><path d="M9.6 16.2H8"/><path d="M14.6 16.2h.6"/><path d="M21 16.2h.3"/><circle cx="6.2" cy="16.4" r="2"/><circle cx="17.4" cy="16.4" r="2"/>' },
    tag: {
      f: 'M3.6 12.8V4.7a1 1 0 0 1 1-1h8a1 1 0 0 1 .7.3l7 7a1 1 0 0 1 0 1.4l-7.8 7.8a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1-.3-.7Z',
      l: '<path d="M3.6 12.8V4.7a1 1 0 0 1 1-1h8a1 1 0 0 1 .7.3l7 7a1 1 0 0 1 0 1.4l-7.8 7.8a1 1 0 0 1-1.4 0l-7-7a1 1 0 0 1-.3-.7Z"/><circle cx="7.6" cy="7.7" r="1.1"/>' },
    shield: {
      f: 'M12 3 5 5.8v5.4c0 4.3 3 7.4 7 8.6 4-1.2 7-4.3 7-8.6V5.8Z',
      l: '<path d="M12 3 5 5.8v5.4c0 4.3 3 7.4 7 8.6 4-1.2 7-4.3 7-8.6V5.8Z"/><path d="M8.8 12l2.2 2.2 4.2-4.4"/>' },
    headset: {
      f: 'M3.6 13h3.4v6H3.6Z M17 13h3.4v6H17Z',
      l: '<path d="M4 13v-1a8 8 0 0 1 16 0v1"/><rect x="3.6" y="13" width="3.4" height="6" rx="1.1"/><rect x="17" y="13" width="3.4" height="6" rx="1.1"/><path d="M20.2 18.2a3.2 3.2 0 0 1-3.2 3.2h-3"/>' },
    gem: {
      f: 'M6 3.5h12l3.5 5.5-9.5 11.5L2.5 9Z',
      l: '<path d="M6 3.5h12l3.5 5.5-9.5 11.5L2.5 9Z"/><path d="M2.5 9h19"/><path d="M8.5 3.5 6 9l6 11.5 6-11.5-2.5-5.5"/>' },
    trophy: {
      f: 'M6 4h12v5a6 6 0 0 1-12 0Z',
      l: '<path d="M6 4h12v5a6 6 0 0 1-12 0Z"/><path d="M6 5.6H4.3a2 2 0 0 0 0 4H6"/><path d="M18 5.6h1.7a2 2 0 0 1 0 4H18"/><path d="M12 15v3.4"/><path d="M8.5 21.4h7"/><path d="M9.4 21.4c0-1.9 1.1-2.7 2.6-3.1 1.5.4 2.6 1.2 2.6 3.1"/>' },
    zap: {
      f: 'M13 2.5 4.5 13.5H11l-1 8L19 10.5H12Z',
      l: '<path d="M13 2.5 4.5 13.5H11l-1 8L19 10.5H12Z"/>' },
    clock: {
      f: 'M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Z',
      l: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5v5l3.2 1.9"/>' },
    check: { l: '<path d="M5 12.5l4.5 4.5L19 7.5"/>' },
    searchcheck: {
      f: 'M11 4.5a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13Z',
      l: '<circle cx="11" cy="11" r="6.5"/><path d="M8.4 11l1.8 1.8 3.6-3.7"/><path d="M20.5 20.5 16 16"/>' },
    mappin: {
      f: 'M12 2.5a7.5 7.5 0 0 1 7.5 7.5c0 5.5-7.5 11-7.5 11S4.5 15.5 4.5 10A7.5 7.5 0 0 1 12 2.5Z',
      l: '<path d="M19.5 10c0 5.5-7.5 11-7.5 11S4.5 15.5 4.5 10a7.5 7.5 0 0 1 15 0Z"/><circle cx="12" cy="10" r="2.6"/>' },
  };
  const svg = (name, sw) => {
    const ic = I[name]; if (!ic) return '';
    const fill = ic.f ? `<path d="${ic.f}" fill="currentColor" stroke="none" opacity="0.22"/>` : '';
    return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw || 1.9}" stroke-linecap="round" stroke-linejoin="round">${fill}${ic.l}</svg>`;
  };

  /* ---------- Timeline steps ---------- */
  const steps = [
    { icon: 'chat',    title: 'Chama no WhatsApp', text: 'Manda 3 informações: nome do evento, quantidade de peças e a data. Só isso. Sem formulário, sem cadastro, sem espera.', chip: '2 minutos', chipIcon: 'zap' },
    { icon: 'receipt', title: 'Orçamento fechado em 24h', text: 'Preço de fábrica, prazo e condições, tudo por escrito. O prazo já entra como cláusula: é a Garantia do Pódio.', chip: 'Prazo em contrato', chipIcon: 'clock' },
    { icon: 'box',     title: 'Layout 3D para aprovação', text: 'Desenhamos a sua peça e mandamos o layout em 3D. Ajusta quantas vezes precisar. Só vai pra produção com o seu OK.', chip: 'Arte inclusa, sem custo extra', chipIcon: 'check' },
    { icon: 'factory', title: 'Fabricação no nosso galpão', text: 'Corte, montagem, pintura e gravação feitos aqui dentro, pela equipe da GM. Quer acompanhar? Te mandamos foto da produção.', chip: '100% fabricação própria', chipIcon: 'shield' },
    { icon: 'badge',   title: 'Conferência peça a peça', text: 'Antes de embalar, cada troféu e cada medalha passa por inspeção individual. Peça fora do padrão não viaja.', chip: 'Inspeção individual', chipIcon: 'searchcheck' },
    { icon: 'truck',   title: 'No pódio antes do evento', text: 'Embalagem reforçada e envio rastreado para todo o Brasil, ou retirada na fábrica. Você acompanha o código em tempo real.', chip: 'Rastreio em tempo real', chipIcon: 'mappin' },
  ];
  const tl = $('#timeline');
  steps.forEach((s, i) => {
    const el = document.createElement('div');
    el.className = 'tstep';
    el.innerHTML = `<div class="tnode">${svg(s.icon)}</div>
      <div class="tbody">
        <span class="ghost-n">${String(i + 1).padStart(2, '0')}</span>
        <div class="tnum">Passo ${String(i + 1).padStart(2, '0')} de 06</div>
        <h3>${s.title}</h3>
        <p>${s.text}</p>
        <span class="chip">${svg(s.chipIcon, 1.7)} ${s.chip}</span>
      </div>`;
    tl.appendChild(el);
  });

  /* ---------- Why cards ---------- */
  const feats = [
    { icon: 'tag', title: 'Preço de fábrica', text: 'Sem atravessador na conta. Em pedidos grandes, a diferença paga parte do seu evento.' },
    { icon: 'shield', title: 'Garantia do Pódio', text: 'Prazo de entrega em cláusula escrita no orçamento. Não é promessa de vendedor, é compromisso assinado.' },
    { icon: 'box', title: 'Você aprova antes de existir', text: 'Layout 3D da sua peça antes de qualquer produção. Ajustes ilimitados, sem custo de arte.' },
    { icon: 'headset', title: 'Fala com quem fabrica', text: 'Atendimento direto com quem põe a mão na peça. Nada de vendedor que “vai verificar com o fornecedor”.' },
    { icon: 'gem', title: 'Qualidade conferida uma a uma', text: 'Inspeção individual antes do envio. Peça com defeito não entra na caixa. E se escapar, a gente repõe.' },
    { icon: 'truck', title: 'Envio para todo o Brasil', text: 'Embalagem reforçada e código de rastreio. De Jaú/SP para o pódio do seu evento, em qualquer estado.' },
  ];
  const wg = $('#whygrid');
  feats.forEach((f) => {
    const el = document.createElement('div');
    el.className = 'feat reveal';
    el.innerHTML = `<div class="ico">${svg(f.icon)}</div><h3>${f.title}</h3><p>${f.text}</p>`;
    wg.appendChild(el);
  });

  /* ---------- Portfolio ---------- */
  // Peças reais, fotografadas em estúdio (fundo preto, enquadramento quadrado).
  // Para adicionar outra peça, basta uma nova linha { cat, label, src }.
  const base = 'assets/portfolio/';
  const items = [
    { cat: 'rua',    label: 'Trail Race Rio das Flores · 15KM',    src: base + 'trail-race-rio-das-flores.jpg' },
    { cat: 'rua',    label: 'Corrida das Fadas',                    src: base + 'corrida-das-fadas.jpg' },
    { cat: 'rua',    label: 'Agosto Lilás · TBF',                   src: base + 'agosto-lilas.jpg' },
    { cat: 'rua',    label: '4ª Corrida de Macatuba',              src: base + 'corrida-macatuba.jpg' },
    { cat: 'rua',    label: 'tfsports · Rotary Jarinu',            src: base + 'tfsports-rotary-jarinu.jpg' },
    { cat: 'rua',    label: 'Leomosk Run · 2025',                  src: base + 'leomosk-run.jpg' },
    { cat: 'rua',    label: 'Club 21 RUN · tfsports',              src: base + 'club-21-run.jpg' },
    { cat: 'outros', label: 'Inter Movimento · Shopping Interlagos', src: base + 'inter-movimento.jpg' },
    { cat: 'outros', label: 'OAB por Elas · 5KM',                  src: base + 'oab-por-elas.jpg' },
  ];
  const gallery = $('#gallery');
  const waBase = 'https://api.whatsapp.com/send?phone=5514991021312&text=';
  const wIcon = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>';
  function renderGallery(filter) {
    gallery.innerHTML = '';
    const list = items.filter((it) => filter === 'all' || it.cat === filter).slice(0, 12);
    list.forEach((it, idx) => {
      const big = (idx === 0) ? ' big' : '';
      const msg = encodeURIComponent('Olá! Vim do site e gostei desta peça: ' + it.src + '. Quero algo parecido para o meu evento.');
      const a = document.createElement('a');
      a.className = 'gitem' + big;
      a.href = waBase + msg; a.target = '_blank'; a.rel = 'noopener';
      const imgSrc = (window.__PORTFOLIO_IMG && window.__PORTFOLIO_IMG[it.src]) ? window.__PORTFOLIO_IMG[it.src] : it.src;
      a.innerHTML = `<img src="${imgSrc}" alt="${it.label}, GM Troféus" loading="lazy"><div class="ov"><span class="cat">${it.label}</span><span class="wa">${wIcon} Quero um orçamento</span></div>`;
      gallery.appendChild(a);
    });
  }
  renderGallery('all');
  // esconde filtros sem peças ainda (reaparecem quando você adicionar fotos da categoria)
  $$('.filters button').forEach((b) => {
    const f = b.dataset.f;
    if (f !== 'all' && !items.some((it) => it.cat === f)) b.style.display = 'none';
  });
  $$('.filters button').forEach((b) => {
    b.addEventListener('click', () => {
      $('.filters .active').classList.remove('active');
      b.classList.add('active');
      renderGallery(b.dataset.f);
    });
  });

  /* ---------- Reveal on scroll ---------- */
  const io = new IntersectionObserver((es) => {
    es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
  $$('.reveal').forEach((el) => io.observe(el));

  /* ---------- Adaptive nav (light over white sections) ---------- */
  const nav = $('#nav');
  const navZones = $$('[data-nav]');
  function updateNav() {
    const y = window.scrollY;
    nav.classList.toggle('scrolled', y > 30);
    const probe = 38;
    let theme = 'dark';
    for (const z of navZones) {
      const r = z.getBoundingClientRect();
      if (r.top <= probe && r.bottom > probe) { theme = z.dataset.nav; break; }
    }
    nav.classList.toggle('light', theme === 'light');
  }
  updateNav();
  window.addEventListener('resize', updateNav);

  /* ---------- Timeline fill + node activation + comet + entrance ---------- */
  const fill = $('#tlfill');
  const comet = $('#tlcomet');
  const rail = $('.tl-rail');
  function updateTimeline() {
    if (!tl) return;
    const nodes = $$('.tstep');
    const railRect = rail.getBoundingClientRect();
    const trigger = window.innerHeight * 0.62;
    // fill height = how far the trigger line has descended through the rail
    let h = trigger - railRect.top;
    h = Math.max(0, Math.min(railRect.height, h));
    fill.style.height = h + 'px';
    if (comet) { comet.style.top = (18 + h) + 'px'; comet.style.opacity = (h > 4 && h < railRect.height - 2) ? '1' : '0'; }
    nodes.forEach((n) => {
      const nr = n.querySelector('.tnode').getBoundingClientRect();
      n.classList.toggle('on', (nr.top + nr.height / 2) < trigger);
    });
  }
  // staggered entrance when the timeline scrolls into view
  if (tl) {
    const stepEls = $$('.tstep');
    const tlIO = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (e.isIntersecting) {
          stepEls.forEach((el, i) => setTimeout(() => el.classList.add('seen'), i * 120));
          tlIO.disconnect();
        }
      });
    }, { threshold: 0.15 });
    tlIO.observe(tl);
  }
  updateTimeline();
  window.addEventListener('resize', updateTimeline);

  /* ---------- Single rAF-throttled scroll handler (avoids layout jank) ---------- */
  let scrollTick = false;
  window.addEventListener('scroll', () => {
    if (scrollTick) return;
    scrollTick = true;
    requestAnimationFrame(() => { updateNav(); updateTimeline(); scrollTick = false; });
  }, { passive: true });

  /* ---------- Loader fallback (rAF may be throttled / transition starved) ---------- */
  setTimeout(() => {
    const l = $('#loader');
    if (!l) return;
    l.classList.add('done');
    l.style.opacity = '0'; l.style.visibility = 'hidden'; l.style.pointerEvents = 'none';
    setTimeout(() => { l.style.display = 'none'; }, 700);
  }, 1400);

  /* ---------- Mobile menu ---------- */
  const hamb = $('#hamb');
  if (hamb) {
    let open = false;
    const menu = document.createElement('div');
    menu.style.cssText = 'position:fixed;inset:72px 0 auto 0;z-index:98;background:rgba(0,0,0,.97);backdrop-filter:blur(22px) saturate(140%);border-bottom:1px solid rgba(255,255,255,.12);padding:14px 28px 30px;display:none;flex-direction:column;gap:2px;transform:translateY(-12px);opacity:0;transition:transform .26s cubic-bezier(.16,1,.3,1),opacity .26s';
    const items = ['#showcase|A fábrica', '#processo|Como funciona', '#porque|Por que a GM', '#portfolio|Portfólio', 'Eventos.html|Eventos', 'Cliente.html|Cliente'];
    items.forEach((s) => {
      const [href, label] = s.split('|');
      const a = document.createElement('a');
      a.href = href; a.textContent = label;
      a.style.cssText = 'color:#F4F2EC;font-size:19px;font-weight:500;letter-spacing:-0.01em;padding:15px 2px;border-bottom:1px solid rgba(255,255,255,.07);transition:color .15s,padding-left .2s';
      a.addEventListener('touchstart', () => { a.style.color = '#fff'; a.style.paddingLeft = '8px'; }, { passive: true });
      a.addEventListener('click', () => { open = false; closeMenu(); });
      menu.appendChild(a);
    });
    // CTA at the bottom of the sheet
    const cta = document.createElement('a');
    cta.href = '#contato';
    cta.textContent = 'Pedir orçamento';
    cta.style.cssText = 'margin-top:18px;background:#25D366;color:#04220F;font-size:16px;font-weight:700;text-align:center;padding:16px;border-radius:14px;letter-spacing:-0.01em';
    menu.appendChild(cta);
    document.body.appendChild(menu);

    function closeMenu() {
      menu.style.transform = 'translateY(-12px)'; menu.style.opacity = '0';
      hamb.classList.remove('on');
      setTimeout(() => { if (!open) menu.style.display = 'none'; }, 260);
    }
    function openMenu() {
      menu.style.display = 'flex'; hamb.classList.add('on');
      requestAnimationFrame(() => { menu.style.transform = 'translateY(0)'; menu.style.opacity = '1'; });
    }
    hamb.addEventListener('click', () => { open = !open; open ? openMenu() : closeMenu(); });
  }
})();
