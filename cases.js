
/* ============================================
   TOGGLE DO CASE
   ============================================ */
function toggleCase(toggle) {
  const painel = toggle.nextElementSibling;
  const ver    = toggle.querySelector('.ct-ver');
  const aberto = painel.classList.toggle('aberto');
  toggle.classList.toggle('aberto', aberto);
  ver.textContent = aberto ? 'Fechar' : 'Ver';

  if (!aberto) {
    const case_section = toggle.closest('.case');
    case_section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function fecharCase(btn) {
  const case_section = btn.closest('.case');
  const toggle       = case_section.querySelector('.case-toggle');
  const painel       = case_section.querySelector('.case-painel');
  const ver          = toggle.querySelector('.ct-ver');

  painel.classList.remove('aberto');
  toggle.classList.remove('aberto');
  ver.textContent = 'Ver';

  case_section.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function abrirWhats() {
  const msg = 'Olá! Vim pelos cases de eventos da COFFEE US. Podemos dar andamento em um orçamento?';
  window.open('https://wa.me/5551996106703?text=' + encodeURIComponent(msg), '_blank');
}