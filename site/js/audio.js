/* ━━━ Audio module — JSON loading, model list + curated examples ━━━ */

(function () {
  'use strict';

  let modelsData = null;

  function loadModels() {
    const jsonPath = window.SAIA_CONFIG?.jsonPath || 'models.json';

    fetch(jsonPath)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        modelsData = data;
        console.log('Loaded models.json ✓');
        renderAllSections();
      })
      .catch(err => {
        console.warn('models.json load error:', err);
        document.querySelectorAll('.audio-examples').forEach(el => {
          el.innerHTML = '<div class="audio-empty">No se pudo cargar models.json.</div>';
        });
      });
  }

  function renderAllSections() {
    const families = ['vae', 'gan', 'ddsp', 'ar', 'diffusion', 'supervised', 'selfsupervised', 'multimodal', 'representations', 'embeddings'];
    families.forEach(family => {
      const section = modelsData[family];
      if (!section) return;
      renderSection(family, section);
    });
  }

  function renderSection(family, section) {
    const container = document.querySelector(`.audio-examples[data-family="${family}"]`);
    if (!container) return;

    let html = '';

    // ── Model list ──
    if (section.models && section.models.length > 0) {
      html += '<div class="models-list">';
      html += '<h4>Modelos</h4>';
      html += '<div class="models-grid">';
      section.models.forEach(m => {
        html += `
          <div class="model-chip">
            <div class="model-chip-name">${escapeHTML(m.name)} <span class="model-chip-year">${m.year}</span></div>
            <div class="model-chip-desc">${escapeHTML(m.description)}</div>
          </div>`;
      });
      html += '</div></div>';
    }

    // ── Audio examples ──
    if (section.examples && section.examples.length > 0) {
      html += '<div class="curated-examples">';
      html += '<h4>Ejemplos de audio</h4>';
      html += '<div class="audio-list">';
      section.examples.forEach(ex => {
        const isVideo = ex.type === 'video' || (ex.url && (ex.url.endsWith('.mp4') || ex.url.endsWith('.webm')));
        const isSoundCloud = ex.type === 'soundcloud' || (ex.url && ex.url.includes('soundcloud.com'));

        let playerHTML = '';
        if (isSoundCloud) {
          const scUrl = encodeURIComponent(ex.url);
          playerHTML = `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" style="border-radius:8px;" src="https://w.soundcloud.com/player/?url=${scUrl}&color=%23e67e22&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false"></iframe>`;
        } else if (isVideo) {
          playerHTML = `<video controls preload="none" width="280" height="160" style="border-radius:8px;flex-shrink:0"><source src="${escapeHTML(ex.url)}">No soportado</video>`;
        } else if (ex.url) {
          const ext = ex.url.split('.').pop();
          playerHTML = `<audio controls preload="none"><source src="${escapeHTML(ex.url)}" type="audio/${ext}">No soportado</audio>`;
        }

        html += `
          <div class="audio-item">
            <div class="audio-item-info">
              <div class="audio-item-title">${escapeHTML(ex.title)}</div>
              <div class="audio-item-meta">${escapeHTML(ex.model)} · ${ex.year} · ${escapeHTML(ex.context || '')}</div>
            </div>
            ${playerHTML}
          </div>`;
      });
      html += '</div></div>';
    }

    // If there's nothing to show (no models and no examples), hide the container entirely
    if (!html) {
      container.style.display = 'none';
      return;
    }

    container.innerHTML = html;
  }

  function escapeHTML(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadModels);
  } else {
    loadModels();
  }

})();
