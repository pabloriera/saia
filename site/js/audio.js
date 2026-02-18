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
    const families = ['vae', 'gan', 'ddsp', 'ar', 'diffusion', 'tokenizers', 'supervised', 'selfsupervised', 'multimodal', 'representations', 'embeddings'];
    families.forEach(family => {
      const section = modelsData[family];
      if (!section) return;
      renderSection(family, section);
    });
    logMissingPaperInfo();
  }

  // ── Console report: missing paper info ──
  function logMissingPaperInfo() {
    const missingUrl = [];
    const missingCite = [];

    Object.entries(modelsData).forEach(([family, section]) => {
      if (!section.models) return;
      section.models.forEach(m => {
        const p = m.paper;
        if (!p || !p.url) missingUrl.push(`[${family}] ${m.name} (${m.year})`);
        if (!p || !p.cite) missingCite.push(`[${family}] ${m.name} (${m.year})`);
      });
    });

    if (missingUrl.length) {
      console.group('%c📄 Modelos sin paper URL — buscar y completar en models.json', 'color:#e67e22;font-weight:bold');
      missingUrl.forEach(s => console.log(' •', s));
      console.groupEnd();
    } else {
      console.log('%c✅ Todos los modelos tienen paper URL', 'color:#27ae60;font-weight:bold');
    }

    if (missingCite.length) {
      console.group('%c✍️  Modelos sin cita completa — agregar "cite" en models.json', 'color:#e67e22;font-weight:bold');
      missingCite.forEach(s => console.log(' •', s));
      console.groupEnd();
    } else {
      console.log('%c✅ Todos los modelos tienen cita completa', 'color:#27ae60;font-weight:bold');
    }
  }

  function renderSection(family, section) {
    const container = document.querySelector(`.audio-examples[data-family="${family}"]`);
    if (!container) return;

    let html = '';

    // ── Model list (sorted by year) ──
    if (section.models && section.models.length > 0) {
      const sortedModels = [...section.models].sort((a, b) => (a.year || 0) - (b.year || 0));
      html += '<div class="models-list">';
      html += '<h4>Modelos</h4>';
      html += '<div class="models-grid">';
      sortedModels.forEach(m => {
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
      section.examples.forEach((ex, idx) => {
        const isVideo = ex.type === 'video' || (ex.url && (ex.url.endsWith('.mp4') || ex.url.endsWith('.webm')));
        const isSoundCloud = ex.type === 'soundcloud' || (ex.url && ex.url.includes('soundcloud.com'));
        // Only preload the first example per section; others load on demand
        const preloadAttr = idx === 0 ? 'metadata' : 'none';

        let playerHTML = '';
        if (isSoundCloud) {
          const scUrl = encodeURIComponent(ex.url);
          playerHTML = `<iframe width="100%" height="166" scrolling="no" frameborder="no" allow="autoplay" loading="lazy" style="border-radius:8px;" src="https://w.soundcloud.com/player/?url=${scUrl}&color=%23e67e22&auto_play=false&hide_related=true&show_comments=false&show_user=true&show_reposts=false&show_teaser=false&visual=false" title="${escapeHTML(ex.title)}"></iframe>`;
        } else if (isVideo) {
          playerHTML = `<video controls preload="${preloadAttr}" width="280" height="160" style="border-radius:8px;flex-shrink:0" title="${escapeHTML(ex.title)}"><source src="${escapeHTML(ex.url)}">Tu navegador no soporta video HTML5. <a href="${escapeHTML(ex.url)}" target="_blank">Descargar</a></video>`;
        } else if (ex.url) {
          const ext = ex.url.split('.').pop();
          playerHTML = `<audio controls preload="${preloadAttr}" title="${escapeHTML(ex.title)}"><source src="${escapeHTML(ex.url)}" type="audio/${ext}">Tu navegador no soporta audio HTML5. <a href="${escapeHTML(ex.url)}" target="_blank">Descargar</a></audio>`;
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

    // ── Inject paper links into the nearest .sources-drawer ──
    if (section.models && section.models.length > 0) {
      const card = container.closest('.card-body') || container.closest('.card') || container.parentElement;
      const drawer = card ? card.querySelector('.sources-drawer ul') : null;
      if (drawer) {
        section.models.forEach(m => {
          if (!m.paper || !m.paper.url) return;
          // Avoid duplicates: skip if a link to this URL already exists
          if (drawer.querySelector(`a[href="${m.paper.url}"]`)) return;
          const li = document.createElement('li');
          const a = document.createElement('a');
          a.href = m.paper.url;
          a.target = '_blank';
          a.textContent = m.paper.cite || m.name;
          li.appendChild(a);
          drawer.appendChild(li);
        });
      }
    }

    // Add error handling for audio/video elements
    container.querySelectorAll('audio, video').forEach(el => {
      el.addEventListener('error', function() {
        const item = this.closest('.audio-item');
        if (item) {
          const src = this.querySelector('source')?.src || '';
          this.outerHTML = `<span style="font-size:0.82rem;color:var(--muted);padding:8px 12px;background:var(--bg);border-radius:8px;display:inline-block;">⚠️ Audio no disponible — <a href="${src}" target="_blank" style="color:var(--blue);">abrir enlace</a></span>`;
        }
      }, true);
    });
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
