document.addEventListener('DOMContentLoaded', () => {
  initLegacyRouteRedirect();
  initTheme();
  initMenu();
  initSectionNavigation();
  initCinematicIntro();
  initIntroParallax();
  initGlobalAudio();
  initRelationshipCounter();
  initReveal();
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

document.addEventListener('visibilitychange', () => {
  document.body.classList.toggle('page-hidden', document.hidden);
});

function initLegacyRouteRedirect() {
  const legacyRoutes = {
    'historia.html': '#universe',
    'galeria.html': '#universe',
    'futuro.html': '#universe',
    'cartas.html': '#letters',
    'surpresa.html': '#letters',
    'roblox.html': '#gamer',
    'jogos.html': '#challenges',
    'trilha-sonora.html': '#universe'
  };
  const file = window.location.pathname.split('/').pop();
  const target = legacyRoutes[file];
  if (target && window.location.pathname.toLowerCase().includes('/paginas/')) {
    window.location.replace(`../index.html${target}`);
  }
}

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
  panel.querySelectorAll('a, [data-theme-menu-toggle], [data-audio-menu-toggle]').forEach((link) => link.addEventListener('click', () => closeMenu()));
  panel.querySelector('[data-theme-menu-toggle]')?.addEventListener('click', () => document.querySelector('.theme-toggle')?.click());
}

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

function initCinematicIntro() {
  const intro = document.querySelector('[data-cinematic-intro]');
  if (!intro) return;
  const key = 'princesa-intro-completa';
  const enterButton = intro.querySelector('[data-enter-universe]');
  const skipButton = intro.querySelector('[data-skip-intro]');
  const message = intro.querySelector('[data-intro-message]');
  const pageShell = document.querySelector('.page-shell');
  if (sessionStorage.getItem(key)) return;

  intro.hidden = false;
  requestAnimationFrame(() => intro.classList.add('visible'));
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

  const finish = (startMusic, animateEntry = false) => {
    if (intro.classList.contains('leaving')) return;
    const shouldAnimateEntry = animateEntry && !reducedMotion;
    sessionStorage.setItem(key, '1');
    if (startMusic) {
      const audioToggle = document.querySelector('[data-audio-toggle]');
      if (audioToggle) audioToggle.click();
    }
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
      }
    }, duration);
  };
  enterButton?.addEventListener('click', () => finish(true, true));
  skipButton?.addEventListener('click', () => finish(false));
}

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

function initGlobalAudio() {
  const root = document.querySelector('[data-global-audio]');
  if (!root) return;
  const audio = root.querySelector('[data-audio-player]');
  const toggle = root.querySelector('[data-audio-toggle]');
  const volume = root.querySelector('[data-audio-volume]');
  const status = root.querySelector('[data-audio-status]');
  const menuToggle = document.querySelector('[data-audio-menu-toggle]');
  const menuStatus = document.querySelector('[data-audio-menu-status]');
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
  const updateMenuStatus = (playing) => {
    if (menuStatus) menuStatus.textContent = playing ? 'Pausar reprodução' : source ? 'Reproduzir ou pausar' : 'Configure uma faixa local';
    if (menuToggle) menuToggle.setAttribute('aria-label', playing ? 'Pausar trilha sonora' : 'Reproduzir trilha sonora');
  };
  updateMenuStatus(false);
  audio.addEventListener('playing', () => {
    toggle.textContent = 'Ⅱ';
    toggle.setAttribute('aria-label', 'Pausar música');
    root.classList.add('is-playing');
    updateMenuStatus(true);
    setStatus('Reproduzindo no nosso universo.');
  });
  audio.addEventListener('pause', () => {
    toggle.textContent = '▶';
    toggle.setAttribute('aria-label', 'Retomar música');
    root.classList.remove('is-playing');
    updateMenuStatus(false);
    if (source) setStatus('Trilha pausada.');
  });
  audio.addEventListener('error', () => {
    root.classList.remove('is-playing');
    updateMenuStatus(false);
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
  menuToggle?.addEventListener('click', () => toggle.click());
  volume.addEventListener('input', () => {
    audio.volume = Number(volume.value);
    localStorage.setItem('princesa-volume', volume.value);
  });
}

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

function initGalleryThumbs() {
  const initializedAreas = new Set();
  document.querySelectorAll('[data-photo-src], [data-gallery-src]').forEach((item) => {
    const photoArea = item.matches('.photo-placeholder, .canva-image, .portrait-frame, .avatar-portrait')
      ? item
      : item.querySelector('.thumb, .photo-placeholder, .avatar-portrait');
    if (!photoArea || initializedAreas.has(photoArea)) return;
    initializedAreas.add(photoArea);
    const image = document.createElement('img');
    image.alt = item.dataset.galleryTitle || item.dataset.photoAlt || 'Foto';
    image.loading = 'lazy';
    image.addEventListener('load', () => {
      const placeholder = photoArea.querySelector('span');
      if (placeholder) placeholder.hidden = true;
      photoArea.prepend(image);
    }, { once: true });
    image.addEventListener('error', () => image.remove(), { once: true });
    image.src = item.dataset.photoSrc || item.dataset.gallerySrc;
  });
}

function initGalleryModal() {
  const modal = document.querySelector('[data-gallery-modal]');
  if (!modal) return;
  const art = modal.querySelector('.gallery-modal-placeholder');
  const image = modal.querySelector('[data-gallery-image]');
  const close = () => {
    modal.classList.remove('open');
    if (image) {
      image.hidden = true;
      image.removeAttribute('src');
      image.onerror = null;
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
      if (image && item.dataset.gallerySrc) {
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

function initQuiz() {
  const root = document.querySelector('[data-quiz-root]');
  if (!root) return;
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

function initWordSearch() {
  const root = document.querySelector('[data-word-search]');
  if (!root) return;
  const words = ['AMOR', 'BEIJO', 'PRINCESA', 'CARINHO', 'SAUDADE'];
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

  const clearSelection = () => {
    selectedCells.forEach((cell) => cell.classList.remove('selected'));
    selectedCells.length = 0;
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

        cell.addEventListener('click', () => {
          const isSelected = selectedCells.includes(cell);
          if (isSelected) {
            cell.classList.remove('selected');
            selectedCells.splice(selectedCells.indexOf(cell), 1);
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

          const selectedWord = selectedCells.map((item) => item.textContent).join('');
          const match = words.find((word) => word === selectedWord || word === selectedWord.split('').reverse().join(''));

          if (match) {
            const matchedCells = [...selectedCells];
            matchedCells.forEach((item) => {
              item.classList.add('found');
              item.classList.remove('selected');
              item.disabled = true;
            });
            found.add(match);
            selectedCells.length = 0;
            renderList();
            return;
          }

          if (selectedCells.length >= Math.max(3, ...words.map((word) => word.length))) {
            clearSelection();
          }
        });

        gridEl.appendChild(cell);
      }
    }
  };

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
