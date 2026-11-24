// Utilidades SVG compartidas: escape, CSS comun (animacion + reduced-motion) y marco de ventana.
export const PALETTE = {
  bg: '#0d1117',
  border: '#30363d',
  text: '#c9d1d9',
  muted: '#8b949e',
  accent: '#39d353',
  accentDim: '#26a641',
  accentDark: '#0e4429',
  blue: '#58a6ff',
  yellow: '#d29922',
  red: '#f85149',
  purple: '#bc8cff',
};

export const FONT = 'ui-monospace, SFMono-Regular, Consolas, monospace';
export const TOP = 40; // altura de la barra de titulo
export const PAD = 24; // margen horizontal interior
export const CHAR_W = 0.6; // ancho estimado por caracter = CHAR_W x font-size

export function escapeXml(s) {
  return String(s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

// Animacion de una sola pasada. El estado base es visible: el "from" solo se aplica
// via fill-mode both durante el retardo, asi que sin animacion todo queda visible.
export const BASE_CSS = `
.ln{animation-name:ln-in;animation-duration:.45s;animation-timing-function:ease-out;animation-fill-mode:both;animation-iteration-count:1}
@keyframes ln-in{from{opacity:0;transform:translateX(-8px)}to{opacity:1;transform:translateX(0)}}
@media (prefers-reduced-motion: reduce){.ln{animation:none;opacity:1;transform:none}}
`.trim();

export const delay = (i, step = 0.12) => `animation-delay:${(i * step).toFixed(2)}s`;

// Divide un texto en lineas de como mucho maxChars caracteres (por palabras).
export function wrap(text, maxChars) {
  const lines = [];
  let cur = '';
  for (const word of text.split(' ')) {
    const next = cur ? `${cur} ${word}` : word;
    if ([...next].length > maxChars && cur) {
      lines.push(cur);
      cur = word;
    } else cur = next;
  }
  if (cur) lines.push(cur);
  return lines;
}

export function frame({ width, height, title, body, css = '' }) {
  const P = PALETTE;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeXml(title)}">
<title>${escapeXml(title)}</title>
<style>
text{font-family:${FONT};fill:${P.text}}
${BASE_CSS}
${css}
</style>
<rect x="0.5" y="0.5" width="${width - 1}" height="${height - 1}" rx="10" fill="${P.bg}" stroke="${P.border}"/>
<path d="M0.5 ${TOP} H${width - 0.5}" stroke="${P.border}"/>
<circle cx="22" cy="20" r="6" fill="${P.red}"/>
<circle cx="42" cy="20" r="6" fill="${P.yellow}"/>
<circle cx="62" cy="20" r="6" fill="${P.accent}"/>
<text x="${width / 2}" y="25" font-size="12" text-anchor="middle" style="fill:${P.muted}">${escapeXml(title)}</text>
${body}
</svg>
`;
}
