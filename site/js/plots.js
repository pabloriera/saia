/* ━━━ Plots module — Layer-wise analysis charts ━━━ */

(function () {
  'use strict';

  /*
   * Data extracted from Table 1 of arXiv:2505.16306v1
   * "Layer-wise Investigation of Large-Scale Self-Supervised
   *  Music Representation Models"
   *
   * The layer-wise curves below are approximated from Figure 2 in the paper
   * (the original figures show per-layer bar charts for each task).
   * Exact single-layer peaks are from the table.
   * Values between are interpolated from visual inspection of the figure.
   *
   * MusicFM has 12 layers; MuQ has 12 layers (Conformer).
   */

  // ── Approximate per-layer performance data ──
  // Each array has 12 values for layers 1–12.
  // Scaled to approximate % scores from the paper's figures.

  const DATA = {
    musicfm: {
      layers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      tasks: {
        'Singer (Acústico)': {
          color: '#3b82f6',
          values: [92.5, 90.0, 87.5, 84.0, 80.0, 76.0, 72.0, 68.0, 64.0, 60.0, 56.0, 52.0]
        },
        'Pitch (Acústico)': {
          color: '#0ea5e9',
          values: [89.5, 88.0, 87.0, 85.0, 82.0, 78.0, 74.0, 70.0, 66.0, 62.0, 58.0, 55.0]
        },
        'Genre (Semántico)': {
          color: '#d97706',
          values: [50.0, 60.0, 70.0, 78.0, 85.5, 84.0, 80.0, 75.0, 70.0, 65.0, 60.0, 55.0]
        },
        'Structure (Semántico)': {
          color: '#dc2626',
          values: [72.0, 73.0, 74.0, 75.0, 75.5, 76.5, 76.0, 75.0, 74.0, 73.0, 72.0, 70.0]
        }
      }
    },
    muq: {
      layers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      tasks: {
        'Singer (Acústico)': {
          color: '#3b82f6',
          values: [96.0, 94.0, 92.0, 89.0, 86.0, 83.0, 80.0, 77.0, 74.0, 71.0, 68.0, 65.0]
        },
        'Pitch (Acústico)': {
          color: '#0ea5e9',
          values: [88.0, 91.5, 90.0, 88.0, 85.0, 82.0, 78.0, 75.0, 72.0, 68.0, 65.0, 62.0]
        },
        'Genre (Semántico)': {
          color: '#d97706',
          values: [48.0, 55.0, 63.0, 72.0, 80.0, 85.9, 84.0, 82.0, 79.0, 75.0, 70.0, 65.0]
        },
        'Structure (Semántico)': {
          color: '#dc2626',
          values: [72.0, 73.0, 74.0, 74.5, 75.0, 75.5, 76.0, 76.5, 77.0, 76.0, 75.0, 73.0]
        }
      }
    }
  };

  // ── Draw chart on Canvas ──
  function drawChart(canvasId, modelData) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;

    // Make canvas crisp
    const rect = canvas.getBoundingClientRect();
    const W = rect.width || 500;
    const H = rect.height || 300;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);

    // Chart area
    const pad = { top: 30, right: 140, bottom: 50, left: 55 };
    const cw = W - pad.left - pad.right;
    const ch = H - pad.top - pad.bottom;

    // Clear
    ctx.clearRect(0, 0, W, H);

    // Background
    ctx.fillStyle = '#fafafa';
    ctx.fillRect(0, 0, W, H);

    // Axes
    const yMin = 40;
    const yMax = 100;
    const xLabels = modelData.layers;

    // Grid lines
    ctx.strokeStyle = '#e5e7eb';
    ctx.lineWidth = 1;
    for (let y = yMin; y <= yMax; y += 10) {
      const py = pad.top + ch - ((y - yMin) / (yMax - yMin)) * ch;
      ctx.beginPath();
      ctx.moveTo(pad.left, py);
      ctx.lineTo(pad.left + cw, py);
      ctx.stroke();

      // Y labels
      ctx.fillStyle = '#8892a4';
      ctx.font = '11px Inter, sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(y + '%', pad.left - 8, py + 4);
    }

    // X labels
    ctx.fillStyle = '#8892a4';
    ctx.font = '11px Inter, sans-serif';
    ctx.textAlign = 'center';
    xLabels.forEach((label, i) => {
      const px = pad.left + (i / (xLabels.length - 1)) * cw;
      ctx.fillText(label, px, H - pad.bottom + 20);
    });

    // Axis labels
    ctx.fillStyle = '#8892a4';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Capa', pad.left + cw / 2, H - 8);

    ctx.save();
    ctx.translate(14, pad.top + ch / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText('Score (%)', 0, 0);
    ctx.restore();

    // Draw lines
    const taskEntries = Object.entries(modelData.tasks);
    taskEntries.forEach(([name, task]) => {
      ctx.strokeStyle = task.color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = 'round';
      ctx.beginPath();

      task.values.forEach((val, i) => {
        const px = pad.left + (i / (xLabels.length - 1)) * cw;
        const py = pad.top + ch - ((val - yMin) / (yMax - yMin)) * ch;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      });
      ctx.stroke();

      // Dots
      ctx.fillStyle = task.color;
      task.values.forEach((val, i) => {
        const px = pad.left + (i / (xLabels.length - 1)) * cw;
        const py = pad.top + ch - ((val - yMin) / (yMax - yMin)) * ch;
        ctx.beginPath();
        ctx.arc(px, py, 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Find peak
      const peakIdx = task.values.indexOf(Math.max(...task.values));
      const peakPx = pad.left + (peakIdx / (xLabels.length - 1)) * cw;
      const peakPy = pad.top + ch - ((task.values[peakIdx] - yMin) / (yMax - yMin)) * ch;

      // Peak marker
      ctx.strokeStyle = task.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(peakPx, peakPy, 6, 0, Math.PI * 2);
      ctx.stroke();
    });

    // Legend
    const legendX = W - pad.right + 16;
    let legendY = pad.top + 10;
    ctx.font = '12px Inter, sans-serif';

    taskEntries.forEach(([name, task]) => {
      // Line sample
      ctx.strokeStyle = task.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(legendX, legendY);
      ctx.lineTo(legendX + 20, legendY);
      ctx.stroke();

      // Dot
      ctx.fillStyle = task.color;
      ctx.beginPath();
      ctx.arc(legendX + 10, legendY, 3, 0, Math.PI * 2);
      ctx.fill();

      // Text
      ctx.fillStyle = '#1a1a2e';
      ctx.textAlign = 'left';
      ctx.fillText(name, legendX + 28, legendY + 4);

      legendY += 22;
    });

    // Layer group annotations (no gaps between regions)
    ctx.fillStyle = 'rgba(59,130,246,0.06)';
    const earlyEnd = pad.left + (2.5 / 11) * cw;
    ctx.fillRect(pad.left, pad.top, earlyEnd - pad.left, ch);

    ctx.fillStyle = 'rgba(217,119,6,0.06)';
    const midStart = earlyEnd;
    const midEnd = pad.left + (7.5 / 11) * cw;
    ctx.fillRect(midStart, pad.top, midEnd - midStart, ch);

    ctx.fillStyle = 'rgba(220,38,38,0.04)';
    const lateStart = midEnd;
    ctx.fillRect(lateStart, pad.top, pad.left + cw - lateStart, ch);

    // Group labels
    ctx.font = '10px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillStyle = '#3b82f6';
    ctx.fillText('Temprano', (pad.left + earlyEnd) / 2, pad.top + 15);
    ctx.fillStyle = '#d97706';
    ctx.fillText('Medio', (midStart + midEnd) / 2, pad.top + 15);
    ctx.fillStyle = '#dc2626';
    ctx.fillText('Tardío', (lateStart + pad.left + cw) / 2, pad.top + 15);
  }

  // ── Init ──
  function initPlots() {
    drawChart('plotMuQ', DATA.muq);
  }

  // Redraw on resize
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(initPlots, 200);
  });

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initPlots);
  } else {
    // Small delay to ensure layout is settled
    setTimeout(initPlots, 100);
  }

})();
