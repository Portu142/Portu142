// Mapa de contribuciones: parseo del HTML publico de GitHub y render SVG animado.
import { frame, PALETTE, PAD, TOP, escapeXml } from './svg.mjs';

export const LEVELS = ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353'];
const CELL = 11;
const GAP = 3;
const PITCH = CELL + GAP;
const WIDTH = 860;
const LABEL_W = 30; // columna de etiquetas de dia
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];

function attr(tag, name) {
  const m = tag.match(new RegExp(`\\s${name}="([^"]*)"`));
  return m ? m[1] : null;
}

export function parseContributions(html) {
  const counts = new Map();
  for (const m of html.matchAll(/<tool-tip\b[^>]*\bfor="([^"]+)"[^>]*>\s*([^<]*?)\s*<\/tool-tip>/g)) {
    const n = m[2].match(/^(\d[\d,.]*)\s+contribution/);
    counts.set(m[1], n ? Number(n[1].replace(/[,.]/g, '')) : 0);
  }
  const days = [];
  for (const m of html.matchAll(/<td\b[^>]*>/g)) {
    const tag = m[0];
    const date = attr(tag, 'data-date');
    if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) continue;
    const lv = Number(attr(tag, 'data-level'));
    const level = Number.isInteger(lv) && lv >= 0 && lv <= 4 ? lv : 0;
    days.push({ date, level, count: counts.get(attr(tag, 'id')) ?? 0 });
  }
  if (days.length === 0) throw new Error('No se encontraron celdas de contribuciones');
  days.sort((a, b) => a.date.localeCompare(b.date));
  const h2 = html.match(/id="js-contribution-activity-description"[^>]*>\s*([\d,.]+)\s+contributions?/);
  const total = h2 ? Number(h2[1].replace(/[,.]/g, '')) : days.reduce((a, d) => a + d.count, 0);
  return { days, total };
}

const utc = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));

export function renderHeatmap({ days, total }) {
  const P = PALETTE;
  const t0 = utc(days[0].date);
  const wd0 = new Date(t0).getUTCDay();
  const cells = days.map((d) => {
    const idx = Math.round((utc(d.date) - t0) / 86400000) + wd0;
    return { ...d, col: Math.floor(idx / 7), row: idx % 7 };
  });
  const cols = Math.max(...cells.map((c) => c.col)) + 1;
  const gx = PAD + LABEL_W;
  const gy = TOP + 38;
  const maxDiag = Math.max(...cells.map((c) => c.col + c.row));
  const step = Math.min(0.04, 2.3 / Math.max(maxDiag, 1));

  const rects = cells
    .map((c) => `<rect class="c l${c.level} d${c.col + c.row}" x="${gx + c.col * PITCH}" y="${gy + c.row * PITCH}" width="${CELL}" height="${CELL}" rx="2"/>`)
    .join('\n');

  // Etiquetas de mes: primera columna de cada mes, separadas >= 3 columnas.
  const labels = [];
  let lastMonth = -1;
  let lastCol = -10;
  for (let col = 0; col < cols; col++) {
    const first = cells.find((c) => c.col === col);
    if (!first) continue;
    const month = Number(first.date.slice(5, 7)) - 1;
    if (month !== lastMonth) {
      if (col - lastCol >= 3) labels.push(`<text x="${gx + col * PITCH}" y="${gy - 8}" font-size="10" style="fill:${P.muted}">${MONTHS[month]}</text>`);
      if (col - lastCol >= 3) lastCol = col;
      lastMonth = month;
    }
  }
  const dayLabels = [['lun', 1], ['mié', 3], ['vie', 5]]
    .map(([n, r]) => `<text x="${PAD}" y="${gy + r * PITCH + 9}" font-size="10" style="fill:${P.muted}">${n}</text>`)
    .join('\n');

  const gridBottom = gy + 7 * PITCH;
  const footY = gridBottom + 24;
  const totalTxt = total.toLocaleString('es-ES', { useGrouping: total >= 1000 });
  // Con minimumGroupingDigits de es-ES, 1234 no lleva separador: lo forzamos a mano.
  const totalFmt = total >= 1000 ? String(total).replace(/\B(?=(\d{3})+(?!\d))/g, '.') : totalTxt;
  const legendW = 5 * PITCH;
  const lx = gx + cols * PITCH - legendW - 30 - 32; // "Más" y "Menos" caben a los lados
  const legend = [
    `<text x="${lx - 8}" y="${footY}" font-size="10" text-anchor="end" style="fill:${P.muted}">Menos</text>`,
    ...LEVELS.map((_, i) => `<rect class="l${i}" x="${lx + i * PITCH}" y="${footY - 10}" width="${CELL}" height="${CELL}" rx="2"/>`),
    `<text x="${lx + legendW + 4}" y="${footY}" font-size="10" style="fill:${P.muted}">Más</text>`,
  ].join('\n');

  const diagCss = [...new Set(cells.map((c) => c.col + c.row))]
    .sort((a, b) => a - b)
    .map((n) => `.d${n}{animation-delay:${(n * step).toFixed(2)}s}`)
    .join('');
  const css = `
${LEVELS.map((c, i) => `.l${i}{fill:${c}}`).join('')}
.c{animation-name:hm-in;animation-duration:.4s;animation-timing-function:ease-out;animation-fill-mode:both;animation-iteration-count:1}
@keyframes hm-in{from{opacity:0}to{opacity:1}}
${diagCss}
@media (prefers-reduced-motion: reduce){.c{animation:none;opacity:1}}
`.trim();

  const height = footY + 22;
  const body = `${labels.join('\n')}
${dayLabels}
${rects}
<text x="${gx}" y="${footY}" font-size="12" style="fill:${P.accent}">${escapeXml(`${totalFmt} contribuciones en el último año`)}</text>
${legend}`;
  return frame({ width: WIDTH, height, title: 'contribuciones — Portu142', body, css });
}
