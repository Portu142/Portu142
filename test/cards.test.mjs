import test from 'node:test';
import assert from 'node:assert/strict';
import { escapeXml, frame } from '../scripts/svg.mjs';
import { info, projects } from '../scripts/content.mjs';
import { renderInfoCard, renderProjectCard, cardWidth, pairHeight } from '../scripts/cards.mjs';

const PRIVATE = ['JUNIOPINHEIRO', 'MarzoPinheiro', 'Prueba2', 'EjercicioGIT', 'CVSPINHEIRO'];
const allSvgs = () => [renderInfoCard(info), ...projects.map((p) => renderProjectCard(p))];

function decode(s) {
  return s
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'").replace(/&amp;/g, '&');
}

test('escapeXml escapa los caracteres especiales', () => {
  assert.equal(escapeXml('a & <b> "c"'), 'a &amp; &lt;b&gt; &quot;c&quot;');
});

test('frame produce un svg con ventana, puntos y reduced-motion', () => {
  const s = frame({ width: 300, height: 100, title: 't', body: '<g/>', css: '' });
  assert.ok(s.startsWith('<svg'));
  assert.equal((s.match(/<circle/g) || []).length, 3);
  assert.match(s, /prefers-reduced-motion: reduce/);
});

test('info card: contacto, empieza por <svg>, sin script, 860 de ancho', () => {
  const s = renderInfoCard(info);
  assert.ok(s.startsWith('<svg'));
  assert.ok(s.includes('rdpcarvalho644@gmail.com'));
  assert.ok(!s.includes('<script'));
  assert.match(s, /width="860"/);
});

test('ningun SVG menciona repos privados ni recursos externos', () => {
  for (const s of allSvgs()) {
    for (const n of PRIVATE) assert.ok(!s.includes(n), `aparece ${n}`);
    assert.ok(!s.includes('<script'));
    assert.ok(!/(href|src)=/.test(s) && !/url\(http/.test(s) && !s.includes('@import'));
  }
});

test('proyectos en orden y con anchos correctos', () => {
  assert.deepEqual(projects.map((p) => p.name), ['LocalizadorCafeterias', 'gestor-de-almacen', 'ScraPrice']);
  assert.deepEqual(projects.map((p) => cardWidth(p)), [425, 425, 860]);
  projects.forEach((p) => assert.match(renderProjectCard(p), new RegExp(`width="${cardWidth(p)}"`)));
});

test('renderProjectCard escapa & en el tagline', () => {
  const p = { ...projects[0], tagline: 'Cafés & más' };
  const s = renderProjectCard(p);
  assert.ok(s.includes('Cafés &amp; más'));
  assert.ok(!s.includes('Cafés & más'));
});

test('ninguna linea de texto excede el ancho interior (0.6 x font-size por caracter)', () => {
  const cards = [
    [renderInfoCard(info), 860],
    ...projects.map((p) => [renderProjectCard(p), cardWidth(p)]),
  ];
  for (const [svg, width] of cards) {
    const re = /<text\b[^>]*?font-size="([\d.]+)"[^>]*>([\s\S]*?)</text>/g;
    let m, n = 0;
    while ((m = re.exec(svg))) {
      n++;
      const text = decode(m[2].replace(/<[^>]+>/g, ''));
      const w = [...text].length * 0.6 * Number(m[1]);
      assert.ok(w <= width - 48, `"${text}" mide ~${w} > ${width - 48}`);
    }
    assert.ok(n > 3);
  }
});

test('animacion: keyframes, fill both y estado final visible', () => {
  const s = renderInfoCard(info);
  assert.match(s, /@keyframes/);
  assert.match(s, /animation-fill-mode:\s*both/);
  assert.match(s, /prefers-reduced-motion: reduce[\s\S]*animation:\s*none/);
  const delays = [...s.matchAll(/animation-delay:([\d.]+)s/g)].map((m) => Number(m[1]));
  assert.ok(delays.length > 0 && Math.max(...delays) + 0.5 < 2.5);
});

test('las dos tarjetas de 425 px tienen la misma altura', () => {
  const h = pairHeight(projects);
  const heights = projects.filter((p) => cardWidth(p) === 425).map((p) => /height="([0-9]+)"/.exec(renderProjectCard(p, h))[1]);
  assert.equal(heights.length, 2);
  assert.equal(heights[0], heights[1]);
});

test('las lineas de stack no empiezan ni terminan con el separador', () => {
  for (const p of projects) {
    const svg = renderProjectCard(p);
    const lines = [...svg.matchAll(/<text[^>]*fill:#58a6ff[^>]*>([^<]*)<\/text>/g)].map((m) => decode(m[1]));
    assert.ok(lines.length >= 1);
    assert.equal(lines.join(' · ').split(' · ').length, p.stack.length);
    for (const l of lines) assert.ok(!l.endsWith('·') && !l.startsWith('·'), l);
  }
});
