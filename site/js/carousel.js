/* ━━━ Layer Carousel — similarity matrix per layer ━━━ */

(function () {
  'use strict';

  const TOTAL_LAYERS = 13; // 0..12

  const layerDescriptions = [
    'acústica (señal cruda)',
    'espectral baja',
    'espectral media',
    'transición',
    'armónica',
    'tímbrica',
    'rítmica',
    'melódica',
    'estructural',
    'semántica baja',
    'semántica media',
    'semántica alta',
    'semántica (género, emoción)'
  ];

  function init() {
    const container = document.getElementById('layerCarousel');
    if (!container) return;

    const imgs = container.querySelectorAll('img');
    const slider = document.getElementById('layerSlider');
    const prevBtn = document.getElementById('layerPrev');
    const nextBtn = document.getElementById('layerNext');
    const label = document.getElementById('layerLabel');
    let current = 0;

    function show(idx) {
      idx = Math.max(0, Math.min(TOTAL_LAYERS - 1, idx));
      imgs.forEach(img => img.classList.remove('active'));
      imgs[idx].classList.add('active');
      current = idx;
      slider.value = idx;
      label.textContent = `Capa ${idx} / ${TOTAL_LAYERS - 1} — ${layerDescriptions[idx] || ''}`;
    }

    prevBtn.addEventListener('click', () => show(current - 1));
    nextBtn.addEventListener('click', () => show(current + 1));
    slider.addEventListener('input', () => show(parseInt(slider.value, 10)));

    // Keyboard: left/right arrows when carousel is in view
    document.addEventListener('keydown', (e) => {
      if (!container.closest('.slide')) return;
      const rect = container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
      if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
    });

    show(0);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
