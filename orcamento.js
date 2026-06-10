/* =========================================================
   GM TROFÉUS — Orçamento
   Formulário monta uma mensagem e abre no WhatsApp.

   ⚠️ INTEGRAÇÃO FUTURA: para enviar a um CRM/e-mail em vez do
   WhatsApp, troque o corpo do submit (buildWhats / window.open)
   por um fetch POST para seu endpoint com os mesmos campos.
========================================================= */
(function () {
  'use strict';
  var WA_PHONE = '5514991021312';
  var $ = function (s) { return document.querySelector(s); };

  var form    = $('#orcForm');
  var nome    = $('#nome');
  var tel     = $('#tel');
  var email   = $('#email');
  var empresa = $('#empresa');
  var msg     = $('#msg');
  var errReq  = $('#errReq');
  var errProd = $('#errProd');

  /* ---------- máscara telefone BR ---------- */
  function maskPhone(v) {
    var d = (v || '').replace(/\D+/g, '').slice(0, 11);
    if (d.length <= 2) return d.length ? '(' + d : '';
    if (d.length <= 6) return '(' + d.slice(0, 2) + ') ' + d.slice(2);
    if (d.length <= 10) return '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6);
    return '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7);
  }
  tel.addEventListener('input', function () {
    tel.value = maskPhone(tel.value);
    errReq.classList.remove('show');
  });
  [nome, email].forEach(function (el) {
    el.addEventListener('input', function () { errReq.classList.remove('show'); });
  });

  /* ---------- produtos (multi-select) ---------- */
  var selProds = [];
  document.querySelectorAll('#prodGrid .prod').forEach(function (b) {
    b.addEventListener('click', function () {
      var p = b.getAttribute('data-prod');
      var i = selProds.indexOf(p);
      if (i >= 0) { selProds.splice(i, 1); b.classList.remove('sel'); }
      else { selProds.push(p); b.classList.add('sel'); }
      errProd.classList.remove('show');
    });
  });

  /* ---------- quantidade (single-select, toggle) ---------- */
  var selQty = '';
  document.querySelectorAll('#qtyGrid .qty').forEach(function (b) {
    b.addEventListener('click', function () {
      if (b.classList.contains('sel')) { b.classList.remove('sel'); selQty = ''; return; }
      document.querySelectorAll('#qtyGrid .qty').forEach(function (x) { x.classList.remove('sel'); });
      b.classList.add('sel');
      selQty = b.getAttribute('data-qty');
    });
  });

  /* ---------- montar mensagem ---------- */
  function buildWhats() {
    var L = [];
    L.push('Olá! Quero um orçamento na GM Troféus.');
    L.push('');
    L.push('Nome: ' + nome.value.trim());
    L.push('Telefone: ' + tel.value.trim());
    L.push('E-mail: ' + email.value.trim());
    if (empresa.value.trim()) L.push('Empresa: ' + empresa.value.trim());
    L.push('Produtos: ' + selProds.join(', '));
    if (selQty) L.push('Quantidade: ' + selQty);
    if (msg.value.trim()) L.push('Detalhes: ' + msg.value.trim());
    return 'https://api.whatsapp.com/send?phone=' + WA_PHONE + '&text=' + encodeURIComponent(L.join('\n'));
  }

  /* ---------- submit ---------- */
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var okReq = nome.value.trim() && tel.value.replace(/\D+/g, '').length >= 10 && /\S+@\S+\.\S+/.test(email.value);
    if (!okReq) {
      errReq.classList.add('show');
      (nome.value.trim() ? (tel.value.replace(/\D+/g,'').length >= 10 ? email : tel) : nome).focus();
      return;
    }
    if (!selProds.length) {
      errProd.classList.add('show');
      errProd.scrollIntoView ? null : null; // no-op: avoid scrollIntoView per guidelines
      return;
    }
    window.open(buildWhats(), '_blank', 'noopener');
  });
})();
