// Inicializa apenas os recursos presentes na página depois que o HTML foi carregado.
document.addEventListener('DOMContentLoaded', () => {
  initLegacyRouteRedirect();
  initTheme();
  initMenu();
  initSectionNavigation();
  initBirthdayWelcome();
  initCinematicIntro();
  initIntroParallax();
  initGlobalAudio();
  initRelationshipCounter();
  initDatingCounter();
  initReveal();
  initFavoritePhotoCarousel();
  initGalleryThumbs();
  initGalleryModal();
  initLetterCards();
  initEnvelopeCards();
  initQuiz();
  initWordSearch();
  initAchievements();
  initFavoriteButtons();
  initParticles();
  initPointerGlow();
});

// Pausa efeitos visuais quando a aba fica oculta para economizar recursos.
document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
});

// Mantém links antigos funcionando e leva cada página legada à seção equivalente do início.
function initLegacyRouteRedirect() {
  const legacyRoutes = {
    'historia.html': '#universe',
    'galeria.html': '#universe',
    'futuro.html': '#universe',
    'cartas.html': '#letters',
    'surpresa.html': '#letters',
    'jogos.html': '#challenges'
  };
  const file = window.location.pathname.split('/').pop();
  const target = legacyRoutes[file];
  if (target && window.location.pathname.toLowerCase().includes('/paginas/')) {
    window.location.replace(`../index.html${target}`);
  }
}

// Carrega a preferência de tema salva e sincroniza o botão claro/escuro.
function initTheme() {
  const saved = localStorage.getItem('princesa-tema');
  const shouldLight = saved ? saved === 'light' : false;
  document.body.classList.toggle('theme-light', shouldLight);
  const button = document.querySelector('.theme-toggle');
  if (!button) return;
  const updateButton = () => {
    const light = document.body.classList.contains('theme-light');
    button.setAttribute('aria-label', light ? 'Ativar tema escuro' : 'Ativar tema claro');
    button.setAttribute('title', light ? 'Ativar tema escuro' : 'Ativar tema claro');
    button.setAttribute('aria-pressed', String(light));
  };
  updateButton();
  button.addEventListener('click', () => {
    const active = document.body.classList.toggle('theme-light');
    localStorage.setItem('princesa-tema', active ? 'light' : 'dark');
    updateButton();
  });
}

// Abre e fecha o menu principal; Escape e clique fora também o fecham.
function initMenu() {
  const toggle = document.querySelector('.menu-toggle');
  const panel = document.querySelector('.menu-panel');
  if (!toggle || !panel) return;
  const closeMenu = (restoreFocus = false) => {
    panel.classList.remove('open');
    toggle.setAttribute('aria-expanded', 'false');
    toggle.setAttribute('aria-label', 'Abrir navegação');
    if (restoreFocus) toggle.focus();
  };
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
    toggle.setAttribute('aria-label', isOpen ? 'Fechar navegação' : 'Abrir navegação');
  });
  document.addEventListener('click', (event) => {
    if (!toggle.contains(event.target) && !panel.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu(true);
  });
  panel.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => closeMenu()));
}

// Marca no menu a seção que está visível e acompanha mudanças na âncora da URL.
function initSectionNavigation() {
  const sections = Array.from(document.querySelectorAll('[data-area]'));
  const links = document.querySelectorAll('.menu-link[href^="#"]');
  if (!sections.length || !links.length) return;
  const activate = (id) => {
    links.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('pagina-atual', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  };
  const currentHash = window.location.hash.slice(1);
  activate(sections.some((section) => section.id === currentHash) ? currentHash : sections[0].id);
  window.addEventListener('hashchange', () => {
    const id = window.location.hash.slice(1);
    if (sections.some((section) => section.id === id)) activate(id);
  });
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver((entries) => {
    const visible = entries.filter((entry) => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (visible) activate(visible.target.id);
  }, { rootMargin: '-22% 0px -58% 0px', threshold: [0, 0.2, 0.5] });
  sections.forEach((section) => observer.observe(section));
}

// Mostra a introdução animada uma vez por sessão e conduz à tela de aniversário.
function initCinematicIntro() {
  const intro = document.querySelector('[data-cinematic-intro]');
  if (!intro) return;
  const key = 'princesa-intro-completa';
  const enterButton = intro.querySelector('[data-enter-universe]');
  const skipButton = intro.querySelector('[data-skip-intro]');
  const message = intro.querySelector('[data-intro-message]');
  const pageShell = document.querySelector('.page-shell');
  if (sessionStorage.getItem(key)) {
    showBirthdayWelcome();
    return;
  }

  intro.hidden = false;
  requestAnimationFrame(() => intro.classList.add('visible'));
  // Edite aqui a mensagem que aparece sendo escrita na introdução.
  const text = 'Preparei um universo inteiro para a pessoa mais especial da minha vida.';
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (message) {
    if (reducedMotion) {
      message.textContent = text;
    } else {
      let index = 0;
      const typeNext = () => {
        if (index >= text.length) return;
        message.textContent += text[index];
        index += 1;
        window.setTimeout(typeNext, 34);
      };
      window.setTimeout(typeNext, 450);
    }
  }

  const finish = (animateEntry = false) => {
    if (intro.classList.contains('leaving')) return;
    const shouldAnimateEntry = animateEntry && !reducedMotion;
    sessionStorage.setItem(key, '1');
    if (shouldAnimateEntry) intro.classList.add('launching');
    intro.classList.add('leaving');
    const duration = reducedMotion ? 0 : shouldAnimateEntry ? 1250 : 750;
    window.setTimeout(() => {
      intro.hidden = true;
      if (shouldAnimateEntry && pageShell) {
        pageShell.classList.add('universe-arriving');
        const clearArrival = (event) => {
          if (event.target !== pageShell) return;
          pageShell.classList.remove('universe-arriving');
          pageShell.removeEventListener('animationend', clearArrival);
        };
        pageShell.addEventListener('animationend', clearArrival);
        window.setTimeout(showBirthdayWelcome, 850);
      } else {
        showBirthdayWelcome();
      }
    }, duration);
  };
  enterButton?.addEventListener('click', () => finish(true));
  skipButton?.addEventListener('click', () => finish(false));
}

// Prepara confetes, controla o áudio do aniversário e marca a tela como concluída.
function initBirthdayWelcome() {
  const welcome = document.querySelector('[data-birthday-welcome]');
  const continueButton = welcome?.querySelector('[data-birthday-continue]');
  const birthdayAudio = welcome?.querySelector('[data-birthday-audio]');
  const birthdayAudioToggle = welcome?.querySelector('[data-birthday-audio-toggle]');
  const birthdayAudioLabel = welcome?.querySelector('[data-birthday-audio-label]');
  const birthdayAudioStatus = welcome?.querySelector('[data-birthday-audio-status]');
  const confetti = welcome?.querySelector('[data-birthday-confetti]');
  if (!welcome || !continueButton) return;
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (confetti) {
    for (let index = 0; index < 90; index += 1) {
      const piece = document.createElement('span');
      piece.className = 'birthday-confetti-piece';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.top = `${Math.random() * 100}%`;
      piece.style.setProperty('--hue', String(Math.round(Math.random() * 360)));
      if (!reducedMotion) {
        piece.style.setProperty('--fall-delay', `${Math.random() * -8}s`);
        piece.style.setProperty('--fall-duration', `${4 + Math.random() * 5}s`);
        piece.style.setProperty('--sway', `${Math.round(Math.random() * 160 - 80)}px`);
      }
      confetti.appendChild(piece);
    }
  }

  const setBirthdayAudioState = (playing) => {
    if (!birthdayAudioLabel || !birthdayAudioToggle) return;
    birthdayAudioLabel.textContent = playing ? 'Pausar música' : 'Tocar música';
    birthdayAudioToggle.setAttribute('aria-label', playing ? 'Pausar música de aniversário' : 'Tocar música de aniversário');
    birthdayAudioToggle.setAttribute('aria-pressed', String(playing));
    birthdayAudioStatus.textContent = playing ? 'Tocando para você ♡' : '';
  };

  birthdayAudioToggle?.addEventListener('click', () => {
    if (!birthdayAudio) return;
    if (birthdayAudio.paused) {
      setBirthdayAudioState(true);
      birthdayAudio.play().catch(() => {
        setBirthdayAudioState(false);
        birthdayAudioStatus.textContent = 'Não foi possível tocar o áudio. Confira o arquivo anime-fofo.mp3.';
      });
    } else {
      birthdayAudio.pause();
      setBirthdayAudioState(false);
    }
  });
  birthdayAudio?.addEventListener('pause', () => setBirthdayAudioState(false));
  birthdayAudio?.addEventListener('playing', () => setBirthdayAudioState(true));
  birthdayAudio?.addEventListener('error', () => {
    birthdayAudioStatus.textContent = 'Não foi possível carregar o áudio. Confira o arquivo anime-fofo.mp3.';
  });

  continueButton.addEventListener('click', () => {
    sessionStorage.setItem('princesa-aniversario-completo', '1');
    birthdayAudio?.pause();
    welcome.hidden = true;
    welcome.classList.remove('visible');
    document.querySelector('[data-audio-toggle]')?.click();
  });
}

// Exibe a tela de aniversário enquanto ela ainda não foi concluída nesta sessão.
function showBirthdayWelcome() {
  const welcome = document.querySelector('[data-birthday-welcome]');
  if (!welcome || sessionStorage.getItem('princesa-aniversario-completo')) return;
  welcome.hidden = false;
  requestAnimationFrame(() => {
    welcome.classList.add('visible');
    welcome.querySelector('[data-birthday-continue]')?.focus({ preventScroll: true });
  });
}

// Move as estrelas da introdução conforme o ponteiro, respeitando movimento reduzido.
function initIntroParallax() {
  const intro = document.querySelector('[data-cinematic-intro]');
  if (!intro || window.matchMedia('(prefers-reduced-motion: reduce), (pointer: coarse)').matches) return;
  let frame = 0;
  let x = 0;
  let y = 0;
  intro.addEventListener('pointermove', (event) => {
    x = (event.clientX / window.innerWidth - 0.5) * 8;
    y = (event.clientY / window.innerHeight - 0.5) * 8;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      intro.style.setProperty('--parallax-x', `${x}px`);
      intro.style.setProperty('--parallax-y', `${y}px`);
      frame = 0;
    });
  });
}

// Configura o player persistente do rodapé, volume e mensagens de reprodução/erro.
function initGlobalAudio() {
  const root = document.querySelector('[data-global-audio]');
  if (!root) return;
  const audio = root.querySelector('[data-audio-player]');
  const toggle = root.querySelector('[data-audio-toggle]');
  const volume = root.querySelector('[data-audio-volume]');
  const status = root.querySelector('[data-audio-status]');
  if (!audio || !toggle || !volume || !status) return;
  const source = document.body.dataset.audioSrc.trim();
  const savedVolume = localStorage.getItem('princesa-volume');
  volume.value = savedVolume === null ? '0.55' : savedVolume;
  audio.volume = Number(volume.value);
  if (source) audio.src = source;
  else status.textContent = 'Trilha indisponível: adicione um arquivo autorizado no atributo data-audio-src.';

  const setStatus = (text, error = false) => {
    status.textContent = text;
    status.classList.toggle('audio-error', error);
  };
  audio.addEventListener('playing', () => {
    toggle.textContent = 'Ⅱ';
    toggle.setAttribute('aria-label', 'Pausar música');
    root.classList.add('is-playing');
    setStatus('Reproduzindo nossa trilha sonora.');
  });
  audio.addEventListener('pause', () => {
    toggle.textContent = '▶';
    toggle.setAttribute('aria-label', 'Retomar música');
    root.classList.remove('is-playing');
    if (source) setStatus('Trilha pausada.');
  });
  audio.addEventListener('error', () => {
    root.classList.remove('is-playing');
    setStatus('Não foi possível carregar a faixa. Confira o arquivo e use ▶ para tentar novamente.', true);
  });
  toggle.addEventListener('click', async () => {
    if (!audio.src) {
      setStatus('Música não configurada. Adicione um arquivo autorizado em data-audio-src para ativar.', true);
      return;
    }
    if (!audio.paused) {
      audio.pause();
      return;
    }
    try {
      await audio.play();
    } catch {
      setStatus('A reprodução não pôde começar. Confira a faixa e tente novamente.', true);
    }
  });
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    localStorage.setItem('princesa-volume', volume.value);
  });
}

// Calcula quantos dias se passaram desde o início da história do casal.
function initRelationshipCounter() {
  const counter = document.querySelector('[data-relationship-counter]');
  if (!counter) return;
  const startValue = counter.dataset.relationshipStart.trim();
  const daysElement = counter.querySelector('[data-counter-days]');
  const message = counter.querySelector('[data-counter-message]');
  const startDate = new Date(`${startValue}T00:00:00`);
  if (!startValue || Number.isNaN(startDate.getTime())) return;
  const days = Math.max(0, Math.floor((Date.now() - startDate.getTime()) / 86400000));
  if (daysElement) daysElement.textContent = days.toLocaleString('pt-BR');
  if (message) message.textContent = 'Cada dia é mais uma parte da nossa história.';
}

// Calcula os dias de namoro e a distância até o primeiro aniversário.
function initDatingCounter() {
  const counter = document.querySelector('[data-dating-counter]');
  if (!counter) return;
  const startValue = counter.dataset.datingStart.trim();
  const anniversaryValue = counter.dataset.firstAnniversary.trim();
  const daysElement = counter.querySelector('[data-dating-days]');
  const message = counter.querySelector('[data-dating-message]');
  const startDate = new Date(`${startValue}T00:00:00`);
  const anniversaryDate = new Date(`${anniversaryValue}T00:00:00`);
  if (!startValue || !anniversaryValue || Number.isNaN(startDate.getTime()) || Number.isNaN(anniversaryDate.getTime())) return;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const daysTogether = Math.max(0, Math.floor((today.getTime() - startDate.getTime()) / 86400000));
  const daysUntilAnniversary = Math.max(0, Math.ceil((anniversaryDate.getTime() - today.getTime()) / 86400000));
  if (daysElement) daysElement.textContent = daysTogether.toLocaleString('pt-BR');
  if (message) {
    message.textContent = daysUntilAnniversary
      ? `Faltam ${daysUntilAnniversary} dias para completarmos 1 ano de namoro.`
      : 'Já celebramos nosso primeiro ano de namoro! ♡';
  }
}

// Abre e fecha cartas em formato de envelope e revela a surpresa final.
function initEnvelopeCards() {
  document.querySelectorAll('.envelope-card .letter-toggle').forEach((button) => {
    button.addEventListener('click', () => {
      const card = button.closest('.envelope-card');
      if (!card) return;
      card.classList.toggle('envelope-open', button.getAttribute('aria-expanded') !== 'true');
    });
  });
  const button = document.querySelector('[data-reveal-message]');
  const message = document.querySelector('[data-final-surprise]');
  button?.addEventListener('click', () => {
    if (!message) return;
    const revealed = message.classList.toggle('show');
    button.textContent = revealed ? 'Esconder surpresa' : 'Revelar surpresa';
    button.setAttribute('aria-expanded', String(revealed));
  });
}

// Revela elementos quando entram na área visível da tela.
function initReveal() {
  const items = document.querySelectorAll('[data-reveal]');
  if (!items.length) return;
  if (!('IntersectionObserver' in window)) {
    items.forEach((item) => item.classList.add('visible'));
    return;
  }
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  items.forEach((item) => observer.observe(item));
}

// Carrega fotos locais nas molduras que declaram data-photo-src/data-gallery-src.
function initGalleryThumbs() {
  const initializedAreas = new Set();
  document.querySelectorAll('[data-photo-src], [data-gallery-src]').forEach((item) => {
    const photoArea = item.matches('.photo-placeholder, .canva-image, .portrait-frame, .portrait-slide, .avatar-portrait, .wallpaper-preview')
      ? item
      : item.querySelector('.thumb, .photo-placeholder, .avatar-portrait');
    if (!photoArea || initializedAreas.has(photoArea)) return;
    initializedAreas.add(photoArea);
    const image = document.createElement('img');
    image.alt = item.dataset.galleryTitle || item.dataset.photoAlt || 'Foto';
    image.loading = item.matches('.portrait-slide, .avatar-portrait')
      || Boolean(item.dataset.galleryTitle)
      || Boolean(item.closest('.gamer-photos'))
      ? 'eager'
      : 'lazy';
    image.addEventListener('load', () => {
      const placeholder = photoArea.querySelector('span');
      if (placeholder) placeholder.hidden = true;
      photoArea.prepend(image);
    }, { once: true });
    image.addEventListener('error', () => image.remove(), { once: true });
    image.src = item.dataset.photoSrc || item.dataset.gallerySrc;
  });
}

// Controla troca de fotos, indicadores e rótulo do carrossel de favoritas.
function initFavoritePhotoCarousel() {
  document.querySelectorAll('[data-favorite-carousel]').forEach((carousel) => {
    const slides = [...carousel.querySelectorAll('.portrait-slide')];
    const previous = carousel.querySelector('[data-carousel-prev]');
    const next = carousel.querySelector('[data-carousel-next]');
    const status = carousel.querySelector('[data-carousel-status]');
    const dots = [...carousel.querySelectorAll('[data-carousel-to]')];
    if (slides.length < 2 || !previous || !next) return;

    let activeIndex = slides.findIndex((slide) => slide.classList.contains('is-active'));
    if (activeIndex < 0) activeIndex = 0;

    const showSlide = (index) => {
      activeIndex = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        const isActive = slideIndex === activeIndex;
        slide.classList.toggle('is-active', isActive);
        slide.setAttribute('aria-hidden', String(!isActive));
      });
      dots.forEach((dot, dotIndex) => {
        const isActive = dotIndex === activeIndex;
        dot.classList.toggle('is-active', isActive);
        dot.setAttribute('aria-current', String(isActive));
      });
      if (status) status.textContent = `${activeIndex + 1} / ${slides.length}`;
    };

    previous.addEventListener('click', () => showSlide(activeIndex - 1));
    next.addEventListener('click', () => showSlide(activeIndex + 1));
    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const index = Number(dot.dataset.carouselTo);
        if (Number.isInteger(index) && index >= 0 && index < slides.length) showSlide(index);
      });
    });
    showSlide(activeIndex);
  });
}

// Abre imagens ou vídeos em tela ampliada e limpa a mídia ao fechar.
function initGalleryModal() {
  const modal = document.querySelector('[data-gallery-modal]');
  if (!modal) return;
  const art = modal.querySelector('.gallery-modal-placeholder');
  const image = modal.querySelector('[data-gallery-image]');
  const video = modal.querySelector('[data-gallery-video-player]');
  const close = () => {
    modal.classList.remove('open');
    if (image) {
      image.hidden = true;
      image.removeAttribute('src');
      image.onerror = null;
    }
    if (video) {
      video.pause();
      video.hidden = true;
      video.removeAttribute('src');
      video.load();
    }
    if (art) art.hidden = false;
  };
  modal.querySelector('.gallery-close')?.addEventListener('click', close);
  modal.addEventListener('click', (event) => {
    if (event.target === modal) close();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') close();
  });
  document.querySelectorAll('[data-gallery-item]').forEach((item) => {
    item.addEventListener('click', () => {
      const title = modal.querySelector('.gallery-modal-content h3');
      const text = modal.querySelector('.gallery-modal-content p');
      if (art) {
        art.textContent = item.dataset.galleryLabel || 'Memória';
        art.hidden = true;
      }
      if (title) title.textContent = item.dataset.galleryTitle || 'Lembrança';
      if (text) text.textContent = item.dataset.galleryText || 'Uma lembrança especial para guardar para sempre.';
      if (item.dataset.galleryType === 'video' && video && item.dataset.galleryVideo) {
        if (image) {
          image.hidden = true;
          image.removeAttribute('src');
        }
        video.src = item.dataset.galleryVideo;
        video.hidden = false;
        if (art) art.hidden = true;
      } else if (image && item.dataset.gallerySrc) {
        if (video) {
          video.pause();
          video.hidden = true;
          video.removeAttribute('src');
        }
        image.hidden = false;
        image.src = item.dataset.gallerySrc;
        image.alt = item.dataset.galleryTitle || 'Foto da galeria';
        image.onerror = () => {
          image.hidden = true;
          image.removeAttribute('src');
          if (art) art.hidden = false;
        };
      } else if (art) {
        art.hidden = false;
      }
      modal.classList.add('open');
    });
  });
}

// Liga os botões de abrir/fechar das cartas.
function initLetterCards() {
  document.querySelectorAll('.letter-card').forEach((card) => {
    const toggle = card.querySelector('.letter-toggle');
    const body = card.querySelector('.letter-body');
    if (!toggle || !body) return;
    toggle.addEventListener('click', () => {
      const open = body.classList.toggle('open');
      toggle.textContent = open ? 'Fechar carta' : 'Abrir carta';
      toggle.setAttribute('aria-expanded', String(open));
    });
  });
}

// Monta o quiz, valida respostas, calcula pontuação e libera a conquista.
function initQuiz() {
  const root = document.querySelector('[data-quiz-root]');
  if (!root) return;
  // Edite perguntas, alternativas, índice da resposta certa e feedback neste bloco.
  const questions = [
    { q: 'Qual é a base mais importante de um relacionamento?', options: ['Respeito', 'Pressa', 'Silêncio', 'Fugir do problema'], answer: 0, feedback: 'Respeito cria segurança e confiança.' },
    { q: 'O que torna uma lembrança especial?', options: ['O sentimento nela', 'A quantidade de fotos', 'A velocidade', 'A perfeição'], answer: 0, feedback: 'Memórias ficam marcadas pelo que tocam o coração.' },
    { q: 'O melhor jeito de celebrar um momento juntos é:', options: ['Estar presente', 'Ignorar o momento', 'Comparar com os outros', 'Depender só de um plano grande'], answer: 0, feedback: 'A presença real vale mais que qualquer gesto grande.' }
  ];
  let current = 0, score = 0;
  const questionEl = root.querySelector('[data-question]');
  const optionsEl = root.querySelector('[data-options]');
  const progressEl = root.querySelector('[data-quiz-progress]');
  const statusEl = root.querySelector('[data-quiz-status]');
  const resultEl = root.querySelector('[data-quiz-result]');
  const scoreEl = root.querySelector('[data-score]');
  const nextBtn = root.querySelector('[data-next]');
  const resetBtn = root.querySelector('[data-reset-quiz]');
  const renderQuestion = () => {
    const item = questions[current];
    if (progressEl) progressEl.textContent = `Questão ${current + 1} de ${questions.length}`;
    questionEl.textContent = item.q;
    optionsEl.innerHTML = '';
    nextBtn.disabled = true;
    resultEl.hidden = true;
    item.options.forEach((option, index) => {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'quiz-option';
      button.textContent = option;
      button.addEventListener('click', () => {
        const correct = index === item.answer;
        if (correct) score += 1;
        Array.from(optionsEl.children).forEach((child) => child.disabled = true);
        Array.from(optionsEl.children).forEach((child, idx) => {
          if (idx === item.answer) child.classList.add('correct');
          if (idx === index && !correct) child.classList.add('wrong');
        });
        statusEl.textContent = correct ? 'Resposta certa! ' + item.feedback : 'Quase! ' + item.feedback;
        scoreEl.textContent = `Pontuação: ${score}/${questions.length}`;
        nextBtn.disabled = false;
      });
      optionsEl.appendChild(button);
    });
  };
  nextBtn.addEventListener('click', () => {
    current += 1;
    if (current < questions.length) { renderQuestion(); return; }
    questionEl.textContent = 'Resultado final';
    if (progressEl) progressEl.textContent = 'Quiz concluído';
    optionsEl.innerHTML = '';
    statusEl.textContent = `Você acertou ${score} de ${questions.length}.`;
    resultEl.hidden = false;
    resultEl.textContent = score === questions.length ? 'Perfeito — seu coração está bem afinado!' : 'Ainda há muito para explorar juntos!';
    scoreEl.textContent = `Pontuação: ${score}/${questions.length}`;
    nextBtn.style.display = 'none';
    unlockAchievement('quiz-completo');
  });
  resetBtn.addEventListener('click', () => {
    current = 0; score = 0; nextBtn.style.display = 'inline-flex'; scoreEl.textContent = 'Pontuação: 0/3'; statusEl.textContent = 'Responda e veja como foi.'; resultEl.hidden = true; renderQuestion();
  });
  renderQuestion();
}

// Gera a grade do caça-palavras e permite selecionar letras por clique ou arraste.
function initWordSearch() {
  const root = document.querySelector('[data-word-search]');
  if (!root) return;
  // Edite aqui as palavras que aparecem no caça-palavras.
  const words = ['AMOR', 'BEIJO', 'PRINCESA', 'CARINHO', 'SAUDADE', 'ALIANCA', 'RAPHINHA'];
  const size = 8;
  const directions = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const makeGrid = () => {
    for (let boardAttempt = 0; boardAttempt < 12; boardAttempt++) {
      const candidate = Array.from({ length: size }, () => Array(size).fill(''));
      let allPlaced = true;
      for (const word of words) {
        let placed = false;
        for (let attempt = 0; attempt < 700 && !placed; attempt++) {
          const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
          const row = Math.floor(Math.random() * size);
          const col = Math.floor(Math.random() * size);
          const endRow = row + (word.length - 1) * dr;
          const endCol = col + (word.length - 1) * dc;
          if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
          let valid = true;
          for (let i = 0; i < word.length; i++) {
            const r = row + i * dr; const c = col + i * dc;
            if (candidate[r][c] && candidate[r][c] !== word[i]) { valid = false; break; }
          }
          if (!valid) continue;
          for (let i = 0; i < word.length; i++) {
            candidate[row + i * dr][col + i * dc] = word[i];
          }
          placed = true;
        }
        if (!placed) {
          allPlaced = false;
          break;
        }
      }
      if (allPlaced) {
        for (let r = 0; r < size; r++) {
          for (let c = 0; c < size; c++) {
            if (!candidate[r][c]) candidate[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
          }
        }
        return candidate;
      }
    }
    const fallback = Array.from({ length: size }, () => Array(size).fill(''));
    words.forEach((word, row) => [...word].forEach((letter, col) => { fallback[row][col] = letter; }));
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (!fallback[r][c]) fallback[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
    return fallback;
  };
  let grid = makeGrid();

  const gridEl = root.querySelector('[data-grid]');
  const listEl = root.querySelector('[data-word-list]');
  const progress = root.querySelector('[data-word-progress]');
  const finalText = root.querySelector('[data-final-message]');
  const found = new Set();
  const selectedCells = [];
  let activePointer = null;
  let pointerStart = null;
  let isDragging = false;
  let suppressClick = false;

  const clearSelection = () => {
    selectedCells.forEach((cell) => cell.classList.remove('selected'));
    selectedCells.length = 0;
  };

  const completeSelection = () => {
    const selectedWord = selectedCells.map((cell) => cell.textContent).join('');
    const reversedWord = selectedWord.split('').reverse().join('');
    const match = words.find((word) => word === selectedWord || word === reversedWord);
    if (!match) return false;

    selectedCells.forEach((cell) => {
      cell.classList.add('found');
      cell.classList.remove('selected');
      cell.disabled = true;
    });
    found.add(match);
    selectedCells.length = 0;
    renderList();
    return true;
  };

  const selectCell = (cell) => {
    if (cell.disabled) return;
    const selectedIndex = selectedCells.indexOf(cell);
    if (selectedIndex !== -1) {
      if (selectedIndex === selectedCells.length - 1) {
        cell.classList.remove('selected');
        selectedCells.pop();
      } else {
        clearSelection();
      }
      return;
    }

    if (selectedCells.length === 1) {
      const first = selectedCells[0];
      const rowDelta = Number(cell.dataset.row) - Number(first.dataset.row);
      const colDelta = Number(cell.dataset.col) - Number(first.dataset.col);
      if (Math.abs(rowDelta) > 1 || Math.abs(colDelta) > 1 || (!rowDelta && !colDelta)) {
        clearSelection();
      }
    } else if (selectedCells.length > 1) {
      const first = selectedCells[0];
      const second = selectedCells[1];
      const rowDelta = Number(second.dataset.row) - Number(first.dataset.row);
      const colDelta = Number(second.dataset.col) - Number(first.dataset.col);
      const nextRow = Number(first.dataset.row) + rowDelta * selectedCells.length;
      const nextCol = Number(first.dataset.col) + colDelta * selectedCells.length;
      if (Number(cell.dataset.row) !== nextRow || Number(cell.dataset.col) !== nextCol) {
        clearSelection();
      }
    }

    selectedCells.push(cell);
    cell.classList.add('selected');
    if (completeSelection()) return;
    if (selectedCells.length >= Math.max(3, ...words.map((word) => word.length))) clearSelection();
  };

  const selectDragRange = (start, end) => {
    const rowDelta = Number(end.dataset.row) - Number(start.dataset.row);
    const colDelta = Number(end.dataset.col) - Number(start.dataset.col);
    const rowDistance = Math.abs(rowDelta);
    const colDistance = Math.abs(colDelta);
    if (!rowDelta && !colDelta) return;
    if (rowDelta && colDelta && rowDistance !== colDistance) return;

    const rowStep = Math.sign(rowDelta);
    const colStep = Math.sign(colDelta);
    const steps = Math.max(rowDistance, colDistance);
    clearSelection();
    for (let step = 0; step <= steps; step++) {
      const cell = gridEl.querySelector(`[data-row="${Number(start.dataset.row) + rowStep * step}"][data-col="${Number(start.dataset.col) + colStep * step}"]`);
      if (!cell || cell.disabled) {
        clearSelection();
        return;
      }
      selectedCells.push(cell);
      cell.classList.add('selected');
    }
    completeSelection();
  };

  const renderList = () => {
    listEl.innerHTML = '';
    words.forEach((word) => {
      const pill = document.createElement('span');
      pill.className = 'word-pill';
      if (found.has(word)) pill.classList.add('found');
      pill.textContent = word;
      listEl.appendChild(pill);
    });

    progress.textContent = `${found.size}/${words.length} palavras encontradas`;
    if (found.size === words.length) {
      finalText.hidden = false;
      finalText.classList.add('show');
      unlockAchievement('palavras-completas');
    } else {
      finalText.hidden = true;
      finalText.classList.remove('show');
    }
  };

  const renderBoard = () => {
    gridEl.innerHTML = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        const cell = document.createElement('button');
        cell.type = 'button';
        cell.className = 'word-cell';
        cell.dataset.row = String(r);
        cell.dataset.col = String(c);
        cell.textContent = grid[r][c];

        gridEl.appendChild(cell);
      }
    }
  };

  gridEl.addEventListener('pointerdown', (event) => {
    const cell = event.target.closest('.word-cell');
    if (!cell || cell.disabled || !event.isPrimary) return;
    activePointer = event.pointerId;
    pointerStart = cell;
    isDragging = false;
  });

  document.addEventListener('pointermove', (event) => {
    if (event.pointerId !== activePointer || !pointerStart) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest('.word-cell');
    if (!target || !gridEl.contains(target) || target === pointerStart) return;
    isDragging = true;
    selectDragRange(pointerStart, target);
  });

  const finishPointer = (event) => {
    if (event.pointerId !== activePointer) return;
    if (isDragging) {
      suppressClick = true;
      window.setTimeout(() => { suppressClick = false; }, 0);
    }
    activePointer = null;
    pointerStart = null;
    isDragging = false;
  };
  document.addEventListener('pointerup', finishPointer);
  document.addEventListener('pointercancel', (event) => {
    if (event.pointerId !== activePointer) return;
    clearSelection();
    finishPointer(event);
  });
  gridEl.addEventListener('click', (event) => {
    if (suppressClick) {
      event.preventDefault();
      event.stopImmediatePropagation();
      suppressClick = false;
      return;
    }
    const cell = event.target.closest('.word-cell');
    if (cell) selectCell(cell);
  }, true);

  root.querySelector('[data-reset-word-search]').addEventListener('click', () => {
    grid = makeGrid();
    found.clear();
    clearSelection();
    renderBoard();
    renderList();
  });

  renderBoard();
  renderList();
}

// Salva uma conquista no navegador e atualiza seu selo na página atual.
function unlockAchievement(key) {
  const saved = JSON.parse(localStorage.getItem('princesa-achievements') || '{}');
  saved[key] = true;
  localStorage.setItem('princesa-achievements', JSON.stringify(saved));
  const badge = document.querySelector(`[data-achievement="${key}"]`);
  if (!badge) return;
  badge.classList.remove('locked');
  const status = badge.querySelector('.badge-status');
  if (status) status.textContent = 'Desbloqueada';
}

// Restaura do armazenamento local o estado visual de cada conquista.
function initAchievements() {
  const badges = document.querySelectorAll('[data-achievement]');
  if (!badges.length) return;
  const saved = JSON.parse(localStorage.getItem('princesa-achievements') || '{}');
  badges.forEach((badge) => {
    const key = badge.dataset.achievement;
    const unlocked = Boolean(saved[key]);
    badge.classList.toggle('locked', !unlocked);
    const status = badge.querySelector('.badge-status');
    if (status) status.textContent = unlocked ? 'Desbloqueada' : 'Bloqueada';
  });
}

// Mantém a lista de jogos favoritos sincronizada com o armazenamento local.
function initFavoriteButtons() {
  document.querySelectorAll('[data-favorite-game]').forEach((button) => {
    const key = button.dataset.favoriteGame;
    const current = JSON.parse(localStorage.getItem('princesa-favoritos') || '[]');
    const star = button.querySelector('.star');
    if (star) star.textContent = current.includes(key) ? '★' : '☆';
    button.addEventListener('click', () => {
      const values = JSON.parse(localStorage.getItem('princesa-favoritos') || '[]');
      const next = values.includes(key) ? values.filter((item) => item !== key) : [...values, key];
      localStorage.setItem('princesa-favoritos', JSON.stringify(next));
      if (star) star.textContent = next.includes(key) ? '★' : '☆';
    });
  });
}

// Desenha partículas leves no fundo e interrompe a animação com a aba oculta.
function initParticles() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;
  let particles = [];
  let animationFrame = 0;
  let isVisible = !document.hidden;
  let canvasWidth = 0;
  let canvasHeight = 0;
  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvasWidth = document.documentElement.clientWidth;
    canvasHeight = window.innerHeight;
    canvas.width = canvasWidth * ratio;
    canvas.height = canvasHeight * ratio;
    canvas.style.width = `${canvasWidth}px`;
    canvas.style.height = `${canvasHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    const particleCount = window.matchMedia('(pointer: coarse)').matches ? 16 : Math.min(42, Math.max(14, Math.floor(canvasWidth / 36)));
    particles = Array.from({ length: particleCount }, () => ({ x: Math.random() * canvasWidth, y: Math.random() * canvasHeight, r: Math.random() * 1.7 + 0.7, vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25, alpha: Math.random() * 0.55 + 0.15 }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > canvasWidth) p.vx *= -1; if (p.y < 0 || p.y > canvasHeight) p.vy *= -1;
      ctx.beginPath(); ctx.fillStyle = `rgba(169, 216, 245, ${p.alpha})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    animationFrame = isVisible ? requestAnimationFrame(draw) : 0;
  };
  const updateVisibility = () => {
    isVisible = !document.hidden;
    if (isVisible && !animationFrame) animationFrame = requestAnimationFrame(draw);
    if (!isVisible && animationFrame) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    }
  };
  resize();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', updateVisibility);
  if (isVisible) animationFrame = requestAnimationFrame(draw);
}

// Acompanha o ponteiro com um brilho decorativo apenas em dispositivos precisos.
function initPointerGlow() {
  const glow = document.querySelector('.cursor-glow');
  if (!glow || window.matchMedia('(pointer: coarse)').matches) return;
  document.addEventListener('pointermove', (event) => {
    glow.style.left = `${event.clientX}px`;
    glow.style.top = `${event.clientY}px`;
    glow.style.opacity = '1';
  });
  document.addEventListener('pointerleave', () => { glow.style.opacity = '0'; });
}
