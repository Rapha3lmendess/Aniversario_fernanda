document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initMenu();
  initReveal();
  initGalleryThumbs();
  initGalleryModal();
  initLetterCards();
  initQuiz();
  initWordSearch();
  initAchievements();
  initFavoriteButtons();
  initParticles();
  initPointerGlow();
});

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
  const closeMenu = () => { panel.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); };
  toggle.setAttribute('aria-expanded', 'false');
  toggle.addEventListener('click', () => {
    const isOpen = panel.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
  document.addEventListener('click', (event) => {
    if (!toggle.contains(event.target) && !panel.contains(event.target)) closeMenu();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeMenu();
  });
  const current = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.menu-link').forEach((link) => {
    const href = (link.getAttribute('href') || '').split('/').pop();
    if (href === current) {
      link.classList.add('pagina-atual');
      link.setAttribute('aria-current', 'page');
    }
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
  document.querySelectorAll('[data-photo-src], [data-gallery-src]').forEach((item) => {
    const photoArea = item.matches('.photo-placeholder, .canva-image, .portrait-frame')
      ? item
      : item.querySelector('.thumb');
    if (!photoArea) return;
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
  const statusEl = root.querySelector('[data-quiz-status]');
  const resultEl = root.querySelector('[data-quiz-result]');
  const scoreEl = root.querySelector('[data-score]');
  const nextBtn = root.querySelector('[data-next]');
  const resetBtn = root.querySelector('[data-reset-quiz]');
  const renderQuestion = () => {
    const item = questions[current];
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
    optionsEl.innerHTML = '';
    statusEl.textContent = `Você acertou ${score} de ${questions.length}.`;
    resultEl.hidden = false;
    resultEl.textContent = score === questions.length ? 'Perfeito — seu coração está bem afinado!' : 'Ainda há muito para explorar juntos!';
    scoreEl.textContent = `Pontuação: ${score}/${questions.length}`;
    nextBtn.style.display = 'none';
    if (score > 0) {
      unlockAchievement('quiz-completo');
    }
  });
  resetBtn.addEventListener('click', () => {
    current = 0; score = 0; nextBtn.style.display = 'inline-flex'; scoreEl.textContent = 'Pontuação: 0/3'; statusEl.textContent = 'Responda e veja como a conexão está.'; resultEl.hidden = true; renderQuestion();
  });
  renderQuestion();
}

function initWordSearch() {
  const root = document.querySelector('[data-word-search]');
  if (!root) return;
  const words = ['AMOR', 'BEIJO', 'PRINCESA', 'CARINHO', 'SAUDADE'];
  const size = 8;
  const grid = Array.from({ length: size }, () => Array(size).fill(''));
  const directions = [[0,1],[1,0],[1,1],[1,-1],[0,-1],[-1,0],[-1,-1],[-1,1]];
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

  words.forEach((word) => {
    let placed = false;
    while (!placed) {
      const [dr, dc] = directions[Math.floor(Math.random() * directions.length)];
      const row = Math.floor(Math.random() * size);
      const col = Math.floor(Math.random() * size);
      const endRow = row + (word.length - 1) * dr;
      const endCol = col + (word.length - 1) * dc;
      if (endRow < 0 || endRow >= size || endCol < 0 || endCol >= size) continue;
      let valid = true;
      for (let i = 0; i < word.length; i++) {
        const r = row + i * dr; const c = col + i * dc;
        if (grid[r][c] && grid[r][c] !== word[i]) { valid = false; break; }
      }
      if (!valid) continue;
      for (let i = 0; i < word.length; i++) {
        grid[row + i * dr][col + i * dc] = word[i];
      }
      placed = true;
    }
  });

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!grid[r][c]) {
        grid[r][c] = alphabet[Math.floor(Math.random() * alphabet.length)];
      }
    }
  }

  const gridEl = root.querySelector('[data-grid]');
  const listEl = root.querySelector('[data-word-list]');
  const progress = root.querySelector('[data-word-progress]');
  const finalText = root.querySelector('[data-final-message]');
  const found = new Set();
  const selectedCells = [];

  const isAdjacent = (cellA, cellB) => {
    const rowA = Number(cellA.dataset.row);
    const colA = Number(cellA.dataset.col);
    const rowB = Number(cellB.dataset.row);
    const colB = Number(cellB.dataset.col);
    return Math.abs(rowA - rowB) <= 1 && Math.abs(colA - colB) <= 1 && !(rowA === rowB && colA === colB);
  };

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

          if (selectedCells.length > 0) {
            const lastCell = selectedCells[selectedCells.length - 1];
            if (!isAdjacent(lastCell, cell)) {
              clearSelection();
            }
          }

          if (selectedCells.length === 0 || selectedCells[selectedCells.length - 1] !== cell) {
            selectedCells.push(cell);
            cell.classList.add('selected');
          }

          const selectedWord = selectedCells.map((item) => item.textContent).join('');
          const match = words.find((word) => word === selectedWord || word === selectedWord.split('').reverse().join(''));

          if (match) {
            const matchedCells = [...selectedCells];
            matchedCells.forEach((item) => {
              item.classList.add('found');
              item.classList.remove('selected');
            });
            found.add(match);
            selectedCells.length = 0;
            renderList();
            return;
          }

          if (selectedCells.length >= Math.max(3, words[0].length)) {
            clearSelection();
          }
        });

        gridEl.appendChild(cell);
      }
    }
  };

  root.querySelector('[data-reset-word-search]').addEventListener('click', () => {
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
  let particles = [];
  const resize = () => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = window.innerWidth * ratio;
    canvas.height = window.innerHeight * ratio;
    canvas.style.width = `${window.innerWidth}px`;
    canvas.style.height = `${window.innerHeight}px`;
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
    particles = Array.from({ length: Math.min(65, Math.max(20, Math.floor(window.innerWidth / 22))) }, () => ({ x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight, r: Math.random() * 2.2 + 1, vx: (Math.random() - 0.5) * 0.35, vy: (Math.random() - 0.5) * 0.35, alpha: Math.random() * 0.7 + 0.2 }));
  };
  const draw = () => {
    ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
    particles.forEach((p) => {
      p.x += p.vx; p.y += p.vy; if (p.x < 0 || p.x > window.innerWidth) p.vx *= -1; if (p.y < 0 || p.y > window.innerHeight) p.vy *= -1;
      ctx.beginPath(); ctx.fillStyle = `rgba(169, 216, 245, ${p.alpha})`; ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
    });
    requestAnimationFrame(draw);
  };
  resize(); window.addEventListener('resize', resize); requestAnimationFrame(draw);
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
