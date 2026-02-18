/* ━━━ Audio module — CSV loading, filtering, playback ━━━ */

(function () {
  'use strict';

  // ── Model → Family mapping ──
  const FAMILY_MAP = {
    ar: [
      'wavenet', 'samplernn', 'music transformer', 'musictransformer',
      'jukebox', 'audiolm', 'musiclm', 'musicgen',
      'performance rnn', 'note rnn', 'musicvae', 'music vae',
      'maestro', 'wave2midi'
    ],
    gan: [
      'gansynth', 'wavegan', 'melgan', 'hifi-gan', 'hifigan'
    ],
    diffusion: [
      'diffwave', 'wavegrad', 'riffusion', 'audioldm',
      'stable audio', 'mustango', 'musicldm',
      'ddsp', 'tone transfer'
    ]
  };

  function classifyToFamily(modelName) {
    if (!modelName) return null;
    const lower = modelName.toLowerCase();
    for (const [family, keywords] of Object.entries(FAMILY_MAP)) {
      for (const kw of keywords) {
        if (lower.includes(kw)) return family;
      }
    }
    return null;
  }

  // ── Parse CSV ──
  let allItems = [];

  function loadCSV() {
    const csvPath = window.SAIA_CONFIG?.csvPath || 'media_links.csv';

    if (typeof Papa === 'undefined') {
      console.warn('PapaParse not loaded, retrying in 500ms…');
      setTimeout(loadCSV, 500);
      return;
    }

    Papa.parse(csvPath, {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        allItems = results.data.filter(r => r.direct_media_url || r.embed_url);
        console.log(`Loaded ${allItems.length} media items from CSV`);
        renderAllFamilies();
      },
      error: function (err) {
        console.warn('CSV load error:', err);
        document.querySelectorAll('.audio-list').forEach(el => {
          el.innerHTML = '<div class="audio-empty">No se pudo cargar media_links.csv. Coloca el archivo en la raíz del sitio.</div>';
        });
      }
    });
  }

  // ── Render ──
  function renderAllFamilies() {
    ['ar', 'gan', 'diffusion'].forEach(family => {
      const items = allItems.filter(item => classifyToFamily(item.model_name) === family);
      renderFamily(family, items);
    });
  }

  function renderFamily(family, items) {
    const listEl = document.querySelector(`.audio-list[data-family="${family}"]`);
    const yearSelect = document.querySelector(`.audio-filter-year[data-family="${family}"]`);
    const platformSelect = document.querySelector(`.audio-filter-platform[data-family="${family}"]`);
    const searchInput = document.querySelector(`.audio-search[data-family="${family}"]`);
    const playAllBtn = document.querySelector(`.btn-play-all[data-family="${family}"]`);

    if (!listEl) return;

    if (items.length === 0) {
      listEl.innerHTML = '<div class="audio-empty">No hay ejemplos disponibles para esta familia en el dataset actual.</div>';
      return;
    }

    // Populate filter dropdowns
    const years = [...new Set(items.map(i => i.year).filter(Boolean))].sort();
    const platforms = [...new Set(items.map(i => i.platform).filter(Boolean))].sort();

    years.forEach(y => {
      const opt = document.createElement('option');
      opt.value = y; opt.textContent = y;
      yearSelect.appendChild(opt);
    });
    platforms.forEach(p => {
      const opt = document.createElement('option');
      opt.value = p; opt.textContent = p;
      platformSelect.appendChild(opt);
    });

    // Render function
    function render(filtered) {
      listEl.innerHTML = '';

      if (filtered.length === 0) {
        listEl.innerHTML = '<div class="audio-empty">Ningún resultado coincide con los filtros.</div>';
        return;
      }

      filtered.forEach((item, idx) => {
        const div = document.createElement('div');
        div.className = 'audio-item';

        // Title: derive from URL if empty
        let title = item.title;
        if (!title) {
          const url = item.direct_media_url || item.embed_url || '';
          const parts = url.split('/');
          title = decodeURIComponent(parts[parts.length - 1] || 'Audio clip').replace(/\.\w+$/, '').replace(/[-_]/g, ' ');
        }

        // Badge
        const conf = (item.confidence || 'low').toLowerCase();
        const badgeClass = conf === 'high' ? 'badge-high' : conf === 'medium' ? 'badge-medium' : 'badge-low';

        // Build player
        let playerHTML = '';
        const directURL = item.direct_media_url || '';
        const embedURL = item.embed_url || '';

        if (directURL && !directURL.includes('soundcloud.com/hc') && (directURL.endsWith('.mp3') || directURL.endsWith('.wav') || directURL.endsWith('.ogg') || directURL.endsWith('.m4a'))) {
          playerHTML = `<audio controls preload="none" data-family="${family}" data-idx="${idx}"><source src="${directURL}" type="audio/${directURL.split('.').pop()}">No soportado</audio>`;
        } else if (directURL && (directURL.endsWith('.mp4') || directURL.endsWith('.webm'))) {
          playerHTML = `<video controls preload="none" width="220" height="124" style="border-radius:8px"><source src="${directURL}" type="video/${directURL.split('.').pop()}">No soportado</video>`;
        } else if (embedURL && embedURL.includes('youtube.com')) {
          playerHTML = `<a href="${embedURL}" target="_blank" rel="noopener" style="font-size:12px;color:var(--blue)">▶ Ver en YouTube</a>`;
        } else if (embedURL && embedURL.includes('soundcloud.com')) {
          playerHTML = `<a href="${item.page_url || embedURL}" target="_blank" rel="noopener" style="font-size:12px;color:var(--amber)">▶ Ver en SoundCloud</a>`;
        } else if (directURL) {
          playerHTML = `<a href="${directURL}" target="_blank" rel="noopener" style="font-size:12px;color:var(--blue)">▶ Abrir media</a>`;
        }

        // Context note
        const context = item.context_note || '';
        const contextShort = context.length > 60 ? context.substring(0, 60) + '…' : context;

        div.innerHTML = `
          <div class="audio-item-info">
            <div class="audio-item-title">${escapeHTML(title)}</div>
            <div class="audio-item-meta">${escapeHTML(item.model_name || '')} · ${item.year || '?'} · ${contextShort}</div>
          </div>
          ${playerHTML}
          <span class="audio-item-badge ${badgeClass}">${conf}</span>
        `;

        listEl.appendChild(div);
      });
    }

    // Initial render
    render(items);

    // Filtering
    function applyFilters() {
      const yearVal = yearSelect.value;
      const platVal = platformSelect.value;
      const searchVal = searchInput.value.toLowerCase().trim();

      let filtered = items;
      if (yearVal) filtered = filtered.filter(i => i.year === yearVal);
      if (platVal) filtered = filtered.filter(i => i.platform === platVal);
      if (searchVal) {
        filtered = filtered.filter(i =>
          (i.title || '').toLowerCase().includes(searchVal) ||
          (i.model_name || '').toLowerCase().includes(searchVal) ||
          (i.context_note || '').toLowerCase().includes(searchVal) ||
          (i.direct_media_url || '').toLowerCase().includes(searchVal)
        );
      }
      render(filtered);
    }

    yearSelect.addEventListener('change', applyFilters);
    platformSelect.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);

    // Play all
    playAllBtn.addEventListener('click', () => {
      const audios = listEl.querySelectorAll('audio');
      if (audios.length === 0) return;

      let currentIdx = 0;
      function playNext() {
        if (currentIdx >= audios.length) return;
        const audio = audios[currentIdx];
        audio.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        audio.play();
        audio.onended = () => {
          currentIdx++;
          playNext();
        };
      }
      // Stop all first
      audios.forEach(a => { a.pause(); a.currentTime = 0; });
      playNext();
    });
  }

  function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  // ── Init ──
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCSV);
  } else {
    loadCSV();
  }

})();
