/* =========================================================
   GM TROFÉUS — Área do Cliente
   Consulta de pedido por CPF.

   ⚠️  BACKEND / INTEGRAÇÃO FUTURA
   Hoje a consulta usa os pedidos de exemplo em DEMO_ORDERS
   (site estático, sem servidor). Quando ligar a API real
   (ERP + API das transportadoras p/ rastreio), troque APENAS
   a função lookupOrder(cpf) abaixo por um fetch, ex.:

     async function lookupOrder(cpf){
       const r = await fetch('/api/pedido?cpf=' + cpf, {headers:{Authorization:'...'}});
       if(!r.ok) return null;
       return await r.json();   // mesmo formato dos objetos em DEMO_ORDERS
     }

   O restante (máscara, render, etapas) continua funcionando.
   As 6 etapas fixas estão em STEPS; "currentStep" é o índice
   da etapa atual (0..5). Quando a transportadora devolver o
   rastreio, preencha o campo "tracking" e ele aparece na etapa Envio.
========================================================= */
(function(){
  'use strict';

  /* 6 etapas de produção (na ordem) */
  var STEPS = [
    { key:'orcamento',  label:'Orçamento' },
    { key:'layout',     label:'Layout' },
    { key:'producao',   label:'Produção' },
    { key:'acabamento', label:'Acabamento' },
    { key:'envio',      label:'Envio' },
    { key:'entregue',   label:'Entregue' }
  ];

  var STEP_ICONS = {
    orcamento:  '<path d="M6 2.5h9l4 4V21H6Z"/><path d="M9 8h6M9 12h6M9 16h3"/>',
    layout:     '<path d="M12 3 4 7v6c0 4 3.5 6.5 8 8 4.5-1.5 8-4 8-8V7Z"/><path d="M9 12l2 2 4-4"/>',
    producao:   '<circle cx="12" cy="12" r="3.2"/><path d="M19.4 13.5a7.8 7.8 0 0 0 0-3l1.7-1.3-2-3.4-2 .8a7.6 7.6 0 0 0-2.6-1.5L14 2h-4l-.5 2.6A7.6 7.6 0 0 0 7 6.1l-2-.8-2 3.4 1.7 1.3a7.8 7.8 0 0 0 0 3L3 14.8l2 3.4 2-.8a7.6 7.6 0 0 0 2.6 1.5L10 22h4l.5-2.6a7.6 7.6 0 0 0 2.6-1.5l2 .8 2-3.4Z"/>',
    acabamento: '<path d="m12 3 2.3 5.5L20 9l-4.4 3.7L17 19l-5-3.3L7 19l1.4-6.3L4 9l5.7-.5Z"/>',
    envio:      '<path d="M3 16V7a1 1 0 0 1 1-1h9v10"/><path d="M13 9h4l3 3.5V16"/><circle cx="6.5" cy="17" r="1.8"/><circle cx="17" cy="17" r="1.8"/>',
    entregue:   '<path d="M20 7 9.5 17.5 4 12"/>'
  };

  /* =====================================================
     PEDIDOS DE EXEMPLO (demo). Troque por API depois.
     status = índice da etapa atual em STEPS (0..5)
  ===================================================== */
  var DEMO_ORDERS = {
    '12345678909': {
      name: 'João Ribeiro',
      order: 'GM-2026-0481',
      date: '14/05/2026',
      deadline: '12/06/2026',
      currentStep: 2,            // Produção
      items: '60 troféus + 200 medalhas',
      note: 'Sua produção está a todo vapor. Próxima etapa: acabamento.'
    },
    '98765432100': {
      name: 'Associação Corrida Jaú',
      order: 'GM-2026-0503',
      date: '02/05/2026',
      deadline: '28/05/2026',
      currentStep: 4,            // Envio
      items: '500 medalhas personalizadas',
      tracking: 'BR123456789BR',
      note: 'Pedido despachado. Use o código de rastreio com a transportadora.'
    },
    '11122233344': {
      name: 'Maria Fernanda Alves',
      order: 'GM-2026-0517',
      date: '20/05/2026',
      deadline: '17/06/2026',
      currentStep: 0,            // Orçamento
      items: '1 troféu de campeão + base',
      note: 'Orçamento aprovado! Vamos iniciar o layout da sua peça.'
    }
  };

  /* ---------- lookup (TROCAR POR API) ---------- */
  function lookupOrder(cpf){
    return DEMO_ORDERS[cpf] || null;
  }

  /* ---------- helpers ---------- */
  function onlyDigits(s){ return (s||'').replace(/\D+/g,''); }
  function maskCPF(d){
    d = onlyDigits(d).slice(0,11);
    var out = d;
    if(d.length > 9)  out = d.slice(0,3)+'.'+d.slice(3,6)+'.'+d.slice(6,9)+'-'+d.slice(9);
    else if(d.length > 6) out = d.slice(0,3)+'.'+d.slice(3,6)+'.'+d.slice(6);
    else if(d.length > 3) out = d.slice(0,3)+'.'+d.slice(3);
    return out;
  }

  var $ = function(s){ return document.querySelector(s); };
  var input   = $('#cpf');
  var form    = $('#cpfForm');
  var errBox  = $('#cliError');
  var errMsg  = $('#cliErrorMsg');
  var result  = $('#result');
  var stepsEl = $('#steps');
  var fillEl  = $('#stepsFill');

  /* ---------- mask while typing ---------- */
  input.addEventListener('input', function(){
    var pos = input.selectionStart, before = input.value;
    input.value = maskCPF(input.value);
    // keep caret sane on append
    if(pos >= before.length) input.selectionStart = input.selectionEnd = input.value.length;
    errBox.classList.remove('show');
  });

  /* ---------- demo chips ---------- */
  document.querySelectorAll('.demo-chip').forEach(function(b){
    b.addEventListener('click', function(){
      input.value = maskCPF(b.getAttribute('data-cpf'));
      form.requestSubmit ? form.requestSubmit() : form.dispatchEvent(new Event('submit',{cancelable:true}));
    });
  });

  /* ---------- build steps DOM ---------- */
  function renderSteps(current){
    // remove old step nodes (keep .fill)
    Array.prototype.slice.call(stepsEl.querySelectorAll('.step')).forEach(function(n){ n.remove(); });
    STEPS.forEach(function(s, i){
      var done = i < current, isCur = i === current;
      var el = document.createElement('div');
      el.className = 'step' + (done ? ' done' : '') + (isCur ? ' current' : '');
      var icon = (done && !isCur)
        ? '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M20 7 9.5 17.5 4 12"/></svg>'
        : '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(STEP_ICONS[s.key]||'')+'</svg>';
      el.innerHTML = '<span class="dot">'+icon+'</span><span class="lbl">'+s.label+'</span>';
      stepsEl.appendChild(el);
    });
    // animate fill line (0..5 → 0%..100% across the inner 86% track)
    var pct = current <= 0 ? 0 : (current / (STEPS.length - 1)) * 86;
    fillEl.style.width = '0%';
    requestAnimationFrame(function(){ requestAnimationFrame(function(){ fillEl.style.width = pct + '%'; }); });
  }

  /* ---------- render result ---------- */
  function showResult(o){
    $('#rName').textContent     = o.name;
    $('#rOrder').textContent    = o.order;
    $('#rDate').textContent     = o.date;
    $('#rDeadline').innerHTML   = o.deadline + '<small>em contrato</small>';

    var cur = STEPS[o.currentStep] || STEPS[0];
    var delivered = o.currentStep >= STEPS.length - 1;
    var pill = $('#rPill');
    pill.className = 'status-pill' + (delivered ? ' done' : '');
    $('#rStatus').textContent = delivered ? 'Entregue' : cur.label;

    var note = o.note || 'Atualizamos o status a cada etapa concluída na fábrica.';
    if(o.tracking) note += ' Rastreio: ' + o.tracking + '.';
    $('#rNote').textContent = note;

    var waMsg = encodeURIComponent('Olá! Quero saber sobre meu pedido ' + o.order + '.');
    $('#rWa').href = 'https://api.whatsapp.com/send?phone=5514991021312&text=' + waMsg;

    renderSteps(o.currentStep);
    result.classList.add('show');
  }

  /* ---------- submit ---------- */
  form.addEventListener('submit', function(e){
    e.preventDefault();
    var cpf = onlyDigits(input.value);
    if(cpf.length !== 11){
      errMsg.textContent = 'Digite os 11 números do CPF para consultar.';
      errBox.classList.add('show');
      result.classList.remove('show');
      return;
    }
    var order = lookupOrder(cpf);
    if(!order){
      errMsg.textContent = 'Não encontramos nenhum pedido para este CPF. Confira os números ou fale com a gente no WhatsApp.';
      errBox.classList.add('show');
      result.classList.remove('show');
      return;
    }
    errBox.classList.remove('show');
    // re-trigger entrance animation if already shown
    result.classList.remove('show');
    void result.offsetWidth;
    showResult(order);
  });

})();
