/* ━━━ Main JS — Navigation, Presentation Mode, Cards ━━━ */

(function () {
  'use strict';

  // ── Config ──
  const CONFIG = {
    jsonPath: 'models.json',
    heatmapURLs: [
      'https://arxiv.org/html/2505.16306v1/extracted/6458174/pics/musicfm_results_new.png',
      'https://arxiv.org/html/2505.16306v1/extracted/6458174/pics/muq_results_new.png'
    ],
    arxivURL: 'https://arxiv.org/html/2505.16306v1'
  };
  window.SAIA_CONFIG = CONFIG;

  // ── Elements ──
  const sections = document.querySelectorAll('.slide');
  const navLinks = document.querySelectorAll('.nav-link');
  const progressBar = document.getElementById('progressBar');
  const presToggle = document.getElementById('presToggle');
  const sideNav = document.getElementById('sideNav');
  const dotsContainer = document.getElementById('sectionDots');

  // ── Section dots ──
  sections.forEach((s, i) => {
    const dot = document.createElement('span');
    dot.className = 'section-dot';
    dot.dataset.index = i;
    dot.addEventListener('click', () => scrollToSection(i));
    dotsContainer.appendChild(dot);
  });
  const dots = dotsContainer.querySelectorAll('.section-dot');

  // ── Scroll tracking ──
  function updateOnScroll() {
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
    progressBar.style.width = progress + '%';

    // Find active section
    let activeIdx = 0;
    sections.forEach((s, i) => {
      const rect = s.getBoundingClientRect();
      if (rect.top <= window.innerHeight * 0.4) activeIdx = i;
    });

    // Update nav
    navLinks.forEach(l => l.classList.remove('active'));
    const activeSection = sections[activeIdx];
    if (activeSection) {
      const id = activeSection.id;
      const link = document.querySelector(`.nav-link[data-section="${id}"]`);
      if (link) link.classList.add('active');
    }

    // Update dots
    dots.forEach((d, i) => d.classList.toggle('active', i === activeIdx));

    // Reveal animations
    sections.forEach(s => {
      const rect = s.getBoundingClientRect();
      if (rect.top < window.innerHeight * 0.85) {
        s.classList.add('visible');
      }
    });
  }

  let scrollRAF;
  window.addEventListener('scroll', () => {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    scrollRAF = requestAnimationFrame(updateOnScroll);
  }, { passive: true });

  // ── Scroll to section ──
  function scrollToSection(index) {
    if (index >= 0 && index < sections.length) {
      sections[index].scrollIntoView({ behavior: 'smooth' });
    }
  }

  // ── Presentation mode ──
  let presentationMode = false;
  let currentSlide = 0;

  function togglePresentation() {
    presentationMode = !presentationMode;
    document.body.classList.toggle('presentation-mode', presentationMode);
    presToggle.classList.toggle('active', presentationMode);

    if (presentationMode) {
      // Snap to nearest slide
      let nearest = 0;
      let minDist = Infinity;
      sections.forEach((s, i) => {
        const dist = Math.abs(s.getBoundingClientRect().top);
        if (dist < minDist) { minDist = dist; nearest = i; }
      });
      currentSlide = nearest;
      scrollToSection(currentSlide);
    }
  }

  presToggle.addEventListener('click', togglePresentation);

  // ── Keyboard navigation ──
  document.addEventListener('keydown', (e) => {
    // P = toggle presentation
    if (e.key === 'p' || e.key === 'P') {
      if (document.activeElement.tagName === 'INPUT' || document.activeElement.tagName === 'TEXTAREA') return;
      togglePresentation();
      return;
    }

    if (e.key === 'ArrowRight' || e.key === 'PageDown') {
      e.preventDefault();
      currentSlide = Math.min(currentSlide + 1, sections.length - 1);
      scrollToSection(currentSlide);
    }
    if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      currentSlide = Math.max(currentSlide - 1, 0);
      scrollToSection(currentSlide);
    }
    // Escape = exit presentation
    if (e.key === 'Escape' && presentationMode) {
      togglePresentation();
    }
  });

  // ── Card expand/collapse ──
  document.querySelectorAll('[data-toggle]').forEach(header => {
    header.addEventListener('click', () => {
      const cardName = header.dataset.toggle;
      const card = header.closest('.card');
      const isExpanded = card.classList.contains('expanded');

      // Close all other cards
      document.querySelectorAll('.card.expanded').forEach(c => {
        if (c !== card) c.classList.remove('expanded');
      });

      card.classList.toggle('expanded', !isExpanded);

      // Scroll card into view if expanding
      if (!isExpanded) {
        setTimeout(() => {
          card.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
      }
    });
  });

  // ── Mobile menu ──
  const mobileBtn = document.createElement('button');
  mobileBtn.className = 'mobile-menu-btn';
  mobileBtn.innerHTML = '☰';
  mobileBtn.addEventListener('click', () => sideNav.classList.toggle('open'));
  document.body.appendChild(mobileBtn);

  // Close mobile nav on link click
  navLinks.forEach(l => {
    l.addEventListener('click', () => sideNav.classList.remove('open'));
  });

  // ── Initial state ──
  updateOnScroll();
  // Mark first section visible immediately
  sections[0]?.classList.add('visible');

})();
