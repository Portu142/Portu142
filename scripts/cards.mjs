import { PALETTE as P, TOP, PAD, CHAR_W, escapeXml, frame, wrap, delay } from './svg.mjs';

// Agrupa items enteros en lineas de hasta max caracteres, sin separador al inicio ni al final.
export function wrapItems(items, sep, max) {
  const lines = [];
  let cur = '';
  for (const it of items) {
    const next = cur ? cur + sep + it : it;
    if (cur && [...next].length > max) {
      lines.push(cur);
      cur = it;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

export const cardWidth = (project) => (project.name === 'ScraPrice' ? 860 : 425);

const maxChars = (width, fontSize) => Math.floor((width - 2 * PAD) / (CHAR_W * fontSize));

export function renderInfoCard(info) {
  const W = 860;
  const FS = 15;
  const LH = 26;
  const keyW = Math.max(...info.rows.map(([k]) => k.length)) + 2; // columnas
  const valMax = maxChars(W, FS) - keyW;
  let i = 0;
  let y = TOP + 38;
  let body = '';
  const add = (inner) => {
    body += `<g class="ln" style="${delay(i++)}">${inner}</g>\n`;
  };

  add(`<text x="${PAD}" y="${y}" font-size="${FS}"><tspan style="fill:${P.accent};font-weight:bold">${escapeXml(info.user)}</tspan></text>`);
  y += LH - 6;
  add(`<text x="${PAD}" y="${y}" font-size="${FS}" style="fill:${P.border}">${'-'.repeat(info.user.length)}</text>`);
  y += LH;
  add(`<text x="${PAD}" y="${y}" font-size="${FS + 3}" font-weight="bold">${escapeXml(info.name)}</text>`);
  y += LH + 4;

  for (const [k, v] of info.rows) {
    const lines = wrap(v, valMax);
    lines.forEach((line, n) => {
      const key = n === 0 ? escapeXml(k) : '';
      add(
        `<text x="${PAD}" y="${y}" font-size="${FS}"><tspan style="fill:${P.accent};font-weight:bold">${key}</tspan>` +
          `<tspan x="${PAD + keyW * CHAR_W * FS}">${escapeXml(line)}</tspan></text>`,
      );
      y += LH;
    });
  }

  // fila clasica de bloques de color de neofetch
  y += 6;
  const colors = [P.bg, P.red, P.accent, P.yellow, P.blue, P.purple, P.text, P.accentDim];
  const blocks = colors
    .map((c, n) => `<rect x="${PAD + n * 34}" y="${y}" width="34" height="20" fill="${c}" stroke="${P.border}"/>`)
    .join('');
  add(blocks);
  y += 20 + 24;

  return frame({ width: W, height: y, title: `${info.user} — sobre mí`, body });
}

export function renderProjectCard(p, minHeight = 0) {
  const W = cardWidth(p);
  const FS = 13;
  const LH = 21;
  const mc = maxChars(W, FS);
  let i = 0;
  let y = TOP + 34;
  let body = '';
  const add = (inner) => {
    body += `<g class="ln" style="${delay(i++)}">${inner}</g>\n`;
  };
  const text = (str, style = '', size = FS) => {
    add(`<text x="${PAD}" y="${y}" font-size="${size}"${style ? ` style="${style}"` : ''}>${escapeXml(str)}</text>`);
    y += LH;
  };

  text(`▸ ${p.name}`, `fill:${P.accent};font-weight:bold`, 17);
  y += 6;
  for (const l of wrap(p.tagline, mc)) text(l);
  y += 6;
  for (const l of wrapItems(p.stack, ' · ', mc - 2)) text(l, `fill:${P.blue}`);
  y += 6;
  for (const l of wrap(p.highlight, mc - 2)) text(`★ ${l}`, `fill:${P.yellow}`);
  y += 4;
  text(p.url.replace('https://', ''), `fill:${P.muted}`, 12);
  y += 8;

  return frame({ width: W, height: Math.max(y, minHeight), title: p.name, body });
}

// Altura natural de una tarjeta (la del SVG sin minHeight).
const naturalHeight = (p) => Number(/height="([0-9]+)"/.exec(renderProjectCard(p))[1]);

// Altura comun para las tarjetas de 425 px que van lado a lado.
export const pairHeight = (projects) => Math.max(...projects.filter((p) => cardWidth(p) === 425).map(naturalHeight));
