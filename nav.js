/* GM Troféus — menu mobile compartilhado (páginas Eventos / Cliente).
   Constrói o sheet a partir dos links do .nlinks e do hambúrguer. */
(function () {
  'use strict';
  var hamb = document.getElementById('hamb');
  var nlinks = document.querySelector('.nlinks');
  if (!hamb || !nlinks) return;

  var menu = document.createElement('div');
  menu.className = 'mobile-menu';

  // clona os links da navegação
  Array.prototype.forEach.call(nlinks.querySelectorAll('a'), function (a) {
    var link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent;
    if (a.classList.contains('active')) link.classList.add('active');
    link.addEventListener('click', close);
    menu.appendChild(link);
  });

  // CTA WhatsApp
  var cta = document.createElement('a');
  cta.className = 'mm-cta';
  cta.href = 'index.html#contato';
  cta.textContent = 'Pedir orçamento';
  menu.appendChild(cta);

  document.body.appendChild(menu);

  var open = false;
  function openMenu() {
    open = true; menu.classList.add('open'); hamb.classList.add('on');
    requestAnimationFrame(function () { menu.classList.add('in'); });
  }
  function close() {
    open = false; menu.classList.remove('in'); hamb.classList.remove('on');
    setTimeout(function () { if (!open) menu.classList.remove('open'); }, 260);
  }
  hamb.addEventListener('click', function () { open ? close() : openMenu(); });
})();
