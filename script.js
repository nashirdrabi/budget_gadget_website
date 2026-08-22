(() => {
  const root = document.documentElement;
  const themeButtons = document.querySelectorAll('[data-theme-toggle]');
  const themeColor = document.querySelector('meta[name="theme-color"]');

  const applyTheme = (theme, save = false) => {
    root.dataset.theme = theme;
    const isDark = theme === 'dark';
    themeButtons.forEach((button) => {
      const nextLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode';
      button.setAttribute('aria-label', nextLabel);
      button.setAttribute('title', nextLabel);
      button.setAttribute('aria-pressed', String(isDark));
      const icon = button.querySelector('[data-theme-icon]');
      if (icon) icon.textContent = isDark ? '☀' : '☾';
    });
    if (themeColor) themeColor.content = isDark ? '#0d0d0f' : '#ff6a00';
    if (save) {
      try { localStorage.setItem('budget-gadget-theme', theme); } catch (_) {}
    }
  };

  applyTheme(root.dataset.theme || 'light');
  themeButtons.forEach((button) => {
    button.addEventListener('click', () => {
      applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true);
    });
  });

  const header = document.querySelector('[data-header]');
  const updateHeader = () => header?.classList.toggle('scrolled', window.scrollY > 10);
  updateHeader();
  window.addEventListener('scroll', updateHeader, { passive: true });

  document.querySelectorAll('[data-year]').forEach((node) => {
    node.textContent = new Date().getFullYear();
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const elements = document.querySelectorAll('.reveal');
  if (reduceMotion || !('IntersectionObserver' in window)) {
    elements.forEach((element) => element.classList.add('visible'));
    return;
  }

  document.querySelectorAll('.showcase-grid, .offer-grid, .step-grid, .service-list, .legal-grid').forEach((group) => {
    group.querySelectorAll(':scope > .reveal').forEach((element, index) => {
      element.style.setProperty('--reveal-delay', `${Math.min(index, 4) * 90}ms`);
    });
  });

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  elements.forEach((element) => observer.observe(element));

  if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
    const cursorAura = document.createElement('div');
    const cursorDot = document.createElement('div');
    cursorAura.className = 'cursor-aura';
    cursorDot.className = 'cursor-dot';
    cursorAura.dataset.label = '';
    cursorAura.setAttribute('aria-hidden', 'true');
    cursorDot.setAttribute('aria-hidden', 'true');
    document.body.append(cursorAura, cursorDot);
    root.classList.add('has-custom-cursor');

    let targetX = window.innerWidth / 2;
    let targetY = window.innerHeight / 2;
    let auraX = targetX;
    let auraY = targetY;
    let cursorFrame = 0;
    const renderCursor = () => {
      auraX += (targetX - auraX) * 0.14;
      auraY += (targetY - auraY) * 0.14;
      cursorAura.style.transform = `translate3d(${auraX}px, ${auraY}px, 0) translate(-50%, -50%)`;
      if (Math.abs(targetX - auraX) > 0.1 || Math.abs(targetY - auraY) > 0.1) {
        cursorFrame = requestAnimationFrame(renderCursor);
      } else {
        cursorFrame = 0;
      }
    };
    const wakeCursor = () => {
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    };
    window.addEventListener('pointermove', (event) => {
      targetX = event.clientX;
      targetY = event.clientY;
      cursorDot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
      cursorAura.classList.add('is-visible');
      cursorDot.classList.add('is-visible');
      wakeCursor();
    }, { passive: true });
    document.documentElement.addEventListener('pointerleave', () => {
      cursorAura.classList.remove('is-visible');
      cursorDot.classList.remove('is-visible');
    });
    document.addEventListener('pointerover', (event) => {
      const directAction = event.target.closest('a, button');
      const visualAction = event.target.closest('.showcase-card, .offer-panel, .legal-card, .store-note');
      const isInteractive = directAction || visualAction;
      cursorAura.classList.toggle('is-active', Boolean(isInteractive));
      cursorDot.classList.toggle('is-active', Boolean(isInteractive));
      cursorAura.dataset.label = directAction ? 'OPEN' : visualAction ? 'VIEW' : '';
    });
    document.addEventListener('pointerdown', () => cursorAura.classList.add('is-pressed'));
    document.addEventListener('pointerup', () => cursorAura.classList.remove('is-pressed'));

    const heroVisual = document.querySelector('.hero-visual');
    let heroFrame;
    heroVisual?.addEventListener('pointermove', (event) => {
      cancelAnimationFrame(heroFrame);
      heroFrame = requestAnimationFrame(() => {
        const bounds = heroVisual.getBoundingClientRect();
        const x = (event.clientX - bounds.left) / bounds.width - 0.5;
        const y = (event.clientY - bounds.top) / bounds.height - 0.5;
        heroVisual.style.setProperty('--hero-x', `${x * 12}px`);
        heroVisual.style.setProperty('--hero-y', `${y * 12}px`);
        heroVisual.style.setProperty('--hero-back-x', `${x * -8}px`);
        heroVisual.style.setProperty('--hero-back-y', `${y * -8}px`);
      });
    });
    heroVisual?.addEventListener('pointerleave', () => {
      heroVisual.style.setProperty('--hero-x', '0px');
      heroVisual.style.setProperty('--hero-y', '0px');
      heroVisual.style.setProperty('--hero-back-x', '0px');
      heroVisual.style.setProperty('--hero-back-y', '0px');
    });

    document.querySelectorAll('.showcase-card, .offer-panel, .legal-card').forEach((card) => {
      card.addEventListener('pointermove', (event) => {
        const bounds = card.getBoundingClientRect();
        card.style.setProperty('--glow-x', `${event.clientX - bounds.left}px`);
        card.style.setProperty('--glow-y', `${event.clientY - bounds.top}px`);
      });
    });
  }
})();
