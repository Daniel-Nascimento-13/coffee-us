/* ============================================
   SCROLL PARA O TOPO AO RECARREGAR
   ============================================ */
if ('scrollRestoration' in history) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);


/* ============================================
   FUNÇÕES UTILITÁRIAS
   ============================================ */
function lerp(a, b, t)    { return a + (b - a) * t; }
function clamp(v, lo, hi) { return Math.min(Math.max(v, lo), hi); }
function easeOut(t)       { return 1 - Math.pow(1 - t, 3); }
function easeInOut(t)     { return t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2; }


/* ============================================
   REFERÊNCIAS DO HERO
   ============================================ */
const videoWrap      = document.getElementById('videoReveal');
const heroSection    = document.getElementById('hero');
const heroEyebrow    = document.getElementById('heroEyebrow');
const heroTitleBlock = document.getElementById('heroTitleBlock');
const scrollHint     = document.getElementById('scrollHint');

let posicaoInicial = null;

// CAPTURA A ALTURA UMA VEZ ANTES DE QUALQUER SCROLL.
// NO SAFARI MOBILE WINDOW.INNERHEIGHT MUDA QUANDO A BARRA SOME,
// CAUSANDO O GAP. USAR O VALOR FIXO RESOLVE ISSO.
let alturaViewportFixa = window.innerHeight;


/* ============================================
   POSIÇÃO ORIGINAL DO VÍDEO
   ============================================ */
function medirPosicaoInicial() {
  const tCoffee = document.getElementById('tCoffee');
  const tUs     = document.getElementById('tUs');

  if (!tCoffee || !tUs) {
    return { top: alturaViewportFixa * 0.48, w: 220, h: 130 };
  }

  const rCoffee   = tCoffee.getBoundingClientRect();
  const rUs       = tUs.getBoundingClientRect();
  const gapCenter = (rCoffee.bottom + rUs.top) / 2;

  const w = Math.min(window.innerWidth * 0.30, 350);
  const h = w * 0.5625;

  const isMobile = window.innerWidth <= 768;
  return {
    top: gapCenter - (h / 2) + (isMobile ? -5 : 1),
    w:   w,
    h:   h
  };
}


/* ============================================
   ANIMAÇÃO DE SCROLL DO HERO
   ============================================ */
let animacaoHeroConcluida = false;

function aoScrollar() {
  const lv        = window.innerWidth;
  const ah        = alturaViewportFixa;
  const maxScroll = heroSection.offsetHeight - ah;
  const progresso = clamp(window.scrollY / maxScroll, 0, 1);

  if (progresso === 0) animacaoHeroConcluida = false;
  if (animacaoHeroConcluida) return;

  const fase1 = easeInOut(clamp(progresso / 0.7, 0, 1));
  const fase2 = easeOut(clamp((progresso - 0.6) / 0.4, 0, 1));

  const inicio = posicaoInicial;
  if (!inicio) return;

  const larguraFinal = lv * 1.0;
  const alturaFinal  = larguraFinal * (9 / 16);

  const w   = lerp(inicio.w, larguraFinal, fase1);
  const h   = lerp(inicio.h, alturaFinal,  fase1);
  const r   = lerp(12, 0,                  fase1);
  const rot = lerp(-6, 0,                  fase1);

  const topoFinal = ah - h;
  const topo      = lerp(inicio.top, topoFinal, fase2);

  videoWrap.style.width        = w + 'px';
  videoWrap.style.height       = h + 'px';
  videoWrap.style.borderRadius = r + 'px';
  videoWrap.style.top          = topo + 'px';
  videoWrap.style.left         = '50%';
  videoWrap.style.transform    = `translateX(-50%) rotate(${rot}deg)`;

  heroEyebrow.style.opacity      = clamp(1 - fase1 * 4,   0, 1);
  heroTitleBlock.style.opacity   = clamp(1 - fase1 * 1.8, 0, 1);
  heroTitleBlock.style.transform = `translateY(${fase1 * -20}px)`;

  if (scrollHint) {
    scrollHint.style.opacity = clamp(1 - progresso * 6, 0, 1);
  }

  if (progresso >= 1) animacaoHeroConcluida = true;
}


/* ============================================
   EVENTOS GLOBAIS
   ============================================ */
window.addEventListener('resize', () => {
  // SÓ RECALCULA EM RESIZE REAL (ROTAÇÃO DE TELA), NÃO EM SCROLL
  alturaViewportFixa = window.innerHeight;
  posicaoInicial = medirPosicaoInicial();
  aoScrollar();
});

window.addEventListener('scroll', aoScrollar, { passive: true });

// ESCONDE O VÍDEO ATÉ O LAYOUT ESTABILIZAR
videoWrap.style.opacity    = '0';
videoWrap.style.transition = 'opacity 0.3s ease';

document.fonts.ready.then(() => {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      alturaViewportFixa = window.innerHeight;
      posicaoInicial     = medirPosicaoInicial();
      aoScrollar();
      videoWrap.style.opacity = '1';
    });
  });
});


/* ============================================
   TIMELINE — ANIMAÇÃO SEQUENCIAL
   ============================================ */
const timelineSteps = document.querySelectorAll('.timeline-step:not(.last)');
const observerTimeline = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      timelineSteps.forEach((step, i) => {
        setTimeout(() => step.classList.add('ativo'), i * 700);
      });
      observerTimeline.disconnect();
    }
  });
}, { threshold: 0.3 });
const timelineSection = document.getElementById('timeline');
if (timelineSection) observerTimeline.observe(timelineSection);


/* ============================================
   GALERIA — NAVEGAÇÃO POR SETAS
   ============================================ */
const galeriaCards = document.querySelectorAll('.card-polaroid');
const totalCards   = galeriaCards.length;
const rotacoes = [-6, 4, -3, 7, -5, 3, -4];
let cardAtual      = 0;
let animando       = false;

// APLICA ROTAÇÕES E ESCONDE TODOS PRIMEIRO
galeriaCards.forEach((card, i) => {
  card.style.setProperty('--rot', rotacoes[i] + 'deg');
  card.style.transition = 'none';
  card.style.opacity    = '0';
  card.style.transform  = `rotate(${rotacoes[i]}deg) translateX(60px)`;
});

// CRIA OS DOTS
const dotsWrap = document.getElementById('galeriaDots');
galeriaCards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'galeria-dot' + (i === 0 ? ' ativo' : '');
  dot.setAttribute('aria-label', `Card ${i + 1}`);
  dot.addEventListener('click', () => irParaCard(i));
  dotsWrap.appendChild(dot);
});

function atualizarDots() {
  document.querySelectorAll('.galeria-dot').forEach((dot, i) => {
    dot.classList.toggle('ativo', i === cardAtual);
  });
}

function irParaCard(novoIdx, direcao) {
  if (animando || novoIdx === cardAtual) return;
  animando = true;

  const dir          = direcao ?? (novoIdx > cardAtual ? 'dir' : 'esq');
  const cardSaindo   = galeriaCards[cardAtual];
  const cardEntrando = galeriaCards[novoIdx];

  cardEntrando.style.transition = 'none';
  cardEntrando.style.opacity    = '0';
  cardEntrando.style.transform  = `rotate(${rotacoes[novoIdx]}deg) translateX(${dir === 'dir' ? '80px' : '-80px'})`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cardEntrando.style.transition = '';
      cardEntrando.style.opacity    = '1';
      cardEntrando.style.transform  = `rotate(${rotacoes[novoIdx]}deg) translateX(0)`;
      cardEntrando.style.pointerEvents = 'auto';

      cardSaindo.style.transition  = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      cardSaindo.style.opacity     = '0';
      cardSaindo.style.transform   = `rotate(${rotacoes[cardAtual]}deg) translateX(${dir === 'dir' ? '-80px' : '80px'})`;
      cardSaindo.style.pointerEvents = 'none';

      cardAtual = novoIdx;
      atualizarDots();

      setTimeout(() => { animando = false; }, 520);
    });
  });
}

// ATIVA O PRIMEIRO CARD APÓS LAYOUT ESTABILIZAR
requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const primeiro = galeriaCards[0];
    primeiro.style.transition   = 'opacity 0.5s ease, transform 0.5s ease';
    primeiro.style.opacity      = '1';
    primeiro.style.transform    = `rotate(${rotacoes[0]}deg) translateX(0)`;
    primeiro.style.pointerEvents = 'auto';
  });
});

// BOTÕES SETA
document.getElementById('galeriaAnterior').addEventListener('click', () => {
  irParaCard((cardAtual - 1 + totalCards) % totalCards, 'esq');
});
document.getElementById('galeriaProximo').addEventListener('click', () => {
  irParaCard((cardAtual + 1) % totalCards, 'dir');
});

// SWIPE TOUCH (MOBILE)
let touchStartX = 0;
const galeriaEl = document.getElementById('galeriaCards');
galeriaEl.addEventListener('touchstart', e => {
  touchStartX = e.touches[0].clientX;
}, { passive: true });
galeriaEl.addEventListener('touchend', e => {
  const diff = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) irParaCard((cardAtual + 1) % totalCards, 'dir');
    else          irParaCard((cardAtual - 1 + totalCards) % totalCards, 'esq');
  }
}, { passive: true });


/* ============================================
   DEGUSTAÇÃO — LEQUE 3 FOTOS
   ============================================ */
const deguEsq    = document.getElementById('deguEsq');
const deguCentro = document.getElementById('deguCentro');
const deguDir    = document.getElementById('deguDir');

if (deguEsq && deguCentro && deguDir) {
  const totalDegu = 9;
  let idx = 3;

  function aplicarPosicao(el, posicao) {
    const pos = {
      esq:    'rotate(-12deg) translateX(-180px) translateY(20px)',
      centro: 'rotate(0deg) translateY(-10px)',
      dir:    'rotate(12deg) translateX(180px) translateY(20px)',
      fora:   'rotate(18deg) translateX(400px) translateY(20px)',
    };
    const op = { esq: '0.8', centro: '1', dir: '0.8', fora: '0' };
    const z  = { esq: '1',   centro: '3', dir: '1',   fora: '0' };
    el.style.transform = pos[posicao];
    el.style.opacity   = op[posicao];
    el.style.zIndex    = z[posicao];
  }

  deguEsq.style.transition    = 'none';
  deguCentro.style.transition = 'none';
  deguDir.style.transition    = 'none';

  aplicarPosicao(deguEsq,    'esq');
  aplicarPosicao(deguCentro, 'centro');
  aplicarPosicao(deguDir,    'dir');

  const deguNova        = document.createElement('div');
  deguNova.className    = 'degu-foto';
  deguNova.style.transition = 'none';
  deguNova.style.position   = 'absolute';
  deguNova.innerHTML    = `<img src="./arquivos/cafe${idx + 1}.webp" alt="">`;
  deguDir.parentElement.appendChild(deguNova);
  aplicarPosicao(deguNova, 'fora');

  const fila = [deguEsq, deguCentro, deguDir, deguNova];

  function rodar() {
    const transition = 'transform 0.7s cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 0.7s ease';
    const [f0, f1, f2, f3] = fila;
    [f0, f1, f2, f3].forEach(el => el.style.transition = transition);

    f0.style.transform = 'rotate(-18deg) translateX(-400px) translateY(20px)';
    f0.style.opacity   = '0';
    aplicarPosicao(f1, 'esq');
    aplicarPosicao(f2, 'centro');
    aplicarPosicao(f3, 'dir');

    setTimeout(() => {
      f0.style.transition = 'none';
      aplicarPosicao(f0, 'fora');
      idx = (idx + 1) % totalDegu;
      f0.querySelector('img').src = `./arquivos/cafe${idx + 1}.webp`;
      fila.push(fila.shift());
    }, 750);
  }
  setInterval(rodar, 2500);
}


/* ============================================
   FEEDBACKS — NAVEGAÇÃO POR SETAS
   ============================================ */
const feedbackCards  = document.querySelectorAll('.feedback-card');
const totalFeedbacks = feedbackCards.length;
let feedbackAtual    = 0;
let feedbackAnimando = false;

const feedbackRotacoes = [-4, 3, -2, 5, -3, 4, -3, 2];

feedbackCards.forEach((card, i) => {
  card.style.transition = 'none';
  card.style.opacity    = '0';
  card.style.transform  = `rotate(${feedbackRotacoes[i]}deg) translateX(60px)`;
});

const feedbackDotsWrap = document.getElementById('feedbacksDots');
feedbackCards.forEach((_, i) => {
  const dot = document.createElement('button');
  dot.className = 'feedbacks-dot' + (i === 0 ? ' ativo' : '');
  dot.setAttribute('aria-label', `Feedback ${i + 1}`);
  dot.addEventListener('click', () => irParaFeedback(i));
  feedbackDotsWrap.appendChild(dot);
});

function atualizarFeedbackDots() {
  document.querySelectorAll('.feedbacks-dot').forEach((dot, i) => {
    dot.classList.toggle('ativo', i === feedbackAtual);
  });
}

function irParaFeedback(novoIdx, direcao) {
  if (feedbackAnimando || novoIdx === feedbackAtual) return;
  feedbackAnimando = true;

  const dir            = direcao ?? (novoIdx > feedbackAtual ? 'dir' : 'esq');
  const cardSaindo     = feedbackCards[feedbackAtual];
  const cardEntrando   = feedbackCards[novoIdx];
  const rotEntrada     = feedbackRotacoes[novoIdx];
  const rotSaida       = feedbackRotacoes[feedbackAtual];

  cardEntrando.style.transition = 'none';
  cardEntrando.style.opacity    = '0';
  cardEntrando.style.transform  = `rotate(${rotEntrada}deg) translateX(${dir === 'dir' ? '80px' : '-80px'})`;

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      cardEntrando.style.transition    = '';
      cardEntrando.style.opacity       = '1';
      cardEntrando.style.transform     = `rotate(${rotEntrada}deg) translateX(0)`;
      cardEntrando.style.pointerEvents = 'auto';

      cardSaindo.style.transition  = 'opacity 0.5s ease, transform 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      cardSaindo.style.opacity     = '0';
      cardSaindo.style.transform   = `rotate(${rotSaida}deg) translateX(${dir === 'dir' ? '-80px' : '80px'})`;
      cardSaindo.style.pointerEvents = 'none';

      feedbackAtual = novoIdx;
      atualizarFeedbackDots();

      setTimeout(() => { feedbackAnimando = false; }, 520);
    });
  });
}

requestAnimationFrame(() => {
  requestAnimationFrame(() => {
    const primeiro = feedbackCards[0];
    primeiro.style.transition    = 'opacity 0.5s ease, transform 0.5s ease';
    primeiro.style.opacity       = '1';
    primeiro.style.transform     = `rotate(${feedbackRotacoes[0]}deg) translateX(0)`;
    primeiro.style.pointerEvents = 'auto';
  });
});

document.getElementById('feedbackAnterior').addEventListener('click', () => {
  irParaFeedback((feedbackAtual - 1 + totalFeedbacks) % totalFeedbacks, 'esq');
});
document.getElementById('feedbackProximo').addEventListener('click', () => {
  irParaFeedback((feedbackAtual + 1) % totalFeedbacks, 'dir');
});

let fbTouchStartX = 0;
const fbCardsEl = document.getElementById('feedbacksCards');
fbCardsEl.addEventListener('touchstart', e => {
  fbTouchStartX = e.touches[0].clientX;
}, { passive: true });
fbCardsEl.addEventListener('touchend', e => {
  const diff = fbTouchStartX - e.changedTouches[0].clientX;
  if (Math.abs(diff) > 40) {
    if (diff > 0) irParaFeedback((feedbackAtual + 1) % totalFeedbacks, 'dir');
    else          irParaFeedback((feedbackAtual - 1 + totalFeedbacks) % totalFeedbacks, 'esq');
  }
}, { passive: true });


/* ============================================
   CASES — TOGGLE EXPANSÃO
   ============================================ */
function toggleCases() {
  const faixa  = document.getElementById('casesFaixa');
  const painel = document.getElementById('casesPainel');
  const ver    = document.getElementById('cfVer');

  const aberto = painel.classList.toggle('aberto');
  faixa.classList.toggle('aberto', aberto);
  ver.textContent = aberto ? 'Fechar' : 'Ver';
}


/* ============================================
   MODAL — WHATSAPP
   ============================================ */
function abrirModal() {
  document.getElementById('modalOverlay').classList.add('aberto');
}
function fecharModal() {
  document.getElementById('modalOverlay').classList.remove('aberto');
}
function fecharFora(event) {
  if (event.target === document.getElementById('modalOverlay')) fecharModal();
}
function enviarModal() {
  const nome       = document.getElementById('m-nome').value      || '[preencha aqui]';
  const ocasiao    = document.getElementById('m-ocasiao').value   || '[preencha aqui]';
  const data       = document.getElementById('m-data').value      || '[preencha aqui]';
  const local      = document.getElementById('m-local').value     || '[preencha aqui]';
  const convidados = document.getElementById('m-convidados').value || '[preencha aqui]';

  const mensagem =
`Olá! Gostaria de levar a experiência da Coffee Us para o meu evento.

Poderiam me enviar um orçamento? Seguem os detalhes:

Data: ${data}
Local: ${local}
Nº de convidados: ${convidados}
Ocasião: ${ocasiao}

Fico no aguardo do retorno! — ${nome}`;

  const url = `https://wa.me/5551996106703?text=${encodeURIComponent(mensagem)}`;
  window.open(url, '_blank');
  fecharModal();
}


/* ============================================
   VAPOR DE CAFÉ
   ============================================ */
const canvas = document.getElementById('beansCanvas');
const ctx    = canvas.getContext('2d');
let W, H, t  = 0;
let fios     = [];

function resizeCanvas() {
  W = canvas.width  = canvas.offsetWidth;
  H = canvas.height = canvas.offsetHeight;
}
resizeCanvas();
window.addEventListener('resize', () => { resizeCanvas(); });

class Fio {
  constructor(offsetX, delay) { this.offsetX = offsetX; this.delay = delay; this.reset(); }
  reset() {
    this.baseX = W * (window.innerWidth <= 768 ? 0.16 : 0.21) + this.offsetX;
    this.baseY = H * (window.innerWidth <= 768 ? 0.23 : 0.30);
    this.comprimento = 180 + Math.random() * 80;
    this.phase       = Math.random() * Math.PI * 2;
    this.speed       = 0.008 + Math.random() * 0.004;
    this.alphaMax    = 0.55 + Math.random() * 0.2;
    this.espMax      = 3.5  + Math.random() * 1.5;
  }
  draw(t) {
    const passos = 100;
    const pontos = [];
    for (let i = 0; i <= passos; i++) {
      const prog = i / passos;
      const onda = Math.sin(prog * Math.PI * 2.2 + t + this.phase) * (28 * prog);
      pontos.push({ x: this.baseX + onda + this.offsetX * prog * 0.3, y: this.baseY - this.comprimento * prog });
    }
    for (let i = 1; i < pontos.length; i++) {
      const prog  = i / pontos.length;
      const alpha = this.alphaMax * Math.pow(Math.sin(prog * Math.PI), 1.4) * Math.min(1, (t - this.delay) * 0.5);
      const esp   = this.espMax * Math.pow(1 - prog, 0.6);
      if (alpha <= 0 || esp <= 0) continue;
      ctx.beginPath();
      ctx.moveTo(pontos[i-1].x, pontos[i-1].y);
      ctx.lineTo(pontos[i].x,   pontos[i].y);
      ctx.strokeStyle = `rgba(230, 204, 177, ${alpha})`;
      ctx.lineWidth   = esp;
      ctx.lineCap     = 'round';
      ctx.lineJoin    = 'round';
      ctx.stroke();
    }
  }
}

function criarFios() {
  fios = [];
  fios.push(new Fio(  0, 0.0));
  fios.push(new Fio(-10, 0.3));
  fios.push(new Fio( 10, 0.6));
}
criarFios();

function animar() {
  ctx.clearRect(0, 0, W, H);
  t += 0.012;
  fios.forEach(f => f.draw(t));
  requestAnimationFrame(animar);
}
animar();


/* ============================================
   ASSINATURA — EFEITO DIGITAÇÃO
   ============================================ */
const elTexto = document.getElementById('assinaturaTexto');
const observerAssinatura = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const textoAlvo = 'Daniel';
      let charIdx = 0;
      function digitarAssinatura() {
        if (charIdx < textoAlvo.length) {
          elTexto.textContent += textoAlvo[charIdx];
          charIdx++;
          setTimeout(digitarAssinatura, 120);
        }
      }
      setTimeout(digitarAssinatura, 400);
      observerAssinatura.disconnect();
    }
  });
}, { threshold: 0.5 });
if (elTexto) observerAssinatura.observe(elTexto);


/* ============================================
   CARROSSEL — FORÇA REPAINT NA PRIMEIRA CARGA
   ============================================ */
window.addEventListener('load', () => {
  const track = document.getElementById('parceirosTrack');
  if (track) {
    track.style.animation = 'none';
    track.offsetHeight;
    track.style.animation = '';
  }
});