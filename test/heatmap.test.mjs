import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { parseContributions, renderHeatmap } from '../scripts/contributions.mjs';

const html = readFileSync(new URL('./fixtures/contributions.html', import.meta.url), 'utf8');
const fixtureTotal = Number(
  html.match(/id="js-contribution-activity-description"[^>]*>\s*([\d,.]+)\s+contributions/)[1].replace(/[,.]/g, ''),
);

test('parse: total coincide con el h2 del fixture y hay ~365 dias', () => {
  const d = parseContributions(html);
  assert.equal(d.total, fixtureTotal);
  assert.ok(d.days.length >= 360 && d.days.length <= 372);
  assert.ok(d.days.every((x) => /^\d{4}-\d{2}-\d{2}$/.test(x.date) && x.level >= 0 && x.level <= 4));
});

test('parse: los conteos por dia suman el total', () => {
  const d = parseContributions(html);
  assert.equal(d.days.reduce((a, x) => a + x.count, 0), d.total);
});

test('parse: HTML vacio lanza error', () => {
  assert.throws(() => parseContributions(''));
  assert.throws(() => parseContributions('<html></html>'));
});

test('parse: dia sin data-level => level 0', () => {
  const h = '<td data-date="2025-01-05" id="c1" class="ContributionCalendar-day"></td><tool-tip for="c1">No contributions on January 5th.</tool-tip>';
  const d = parseContributions(h);
  assert.equal(d.days[0].level, 0);
  assert.equal(d.days[0].count, 0);
});

test('render: svg bien formado, 860 de ancho, sin NaN ni script', () => {
  const s = renderHeatmap(parseContributions(html));
  assert.ok(s.startsWith('<svg'));
  assert.match(s, /width="860"/);
  assert.ok(!s.includes('NaN'));
  assert.ok(!/<script/i.test(s));
  assert.ok(!/https?:\/\/(?!www\.w3\.org)/.test(s));
  assert.equal((s.match(/<svg/g) || []).length, 1);
  assert.equal((s.match(/<\/svg>/g) || []).length, 1);
  const opens = (s.match(/<(g|style|title|text)[ >]/g) || []).length;
  const closes = (s.match(/<\/(g|style|title|text)>/g) || []).length;
  assert.equal(opens, closes);
});

test('render: textos en espanol, leyenda, pie y reduced-motion', () => {
  const d = parseContributions(html);
  const s = renderHeatmap(d);
  assert.ok(s.includes('Menos') && s.includes('Más'));
  assert.ok(s.includes(`${d.total} contribuciones en el último año`));
  assert.match(s, /prefers-reduced-motion: reduce/);
  assert.match(s, /animation-fill-mode:both/);
});

test('render: separador de miles es-ES y paleta', () => {
  const s = renderHeatmap({ days: [{ date: '2025-01-05', level: 4, count: 1234 }], total: 1234 });
  assert.ok(s.includes('1.234 contribuciones en el último año'));
  for (const c of ['#161b22', '#0e4429', '#006d32', '#26a641', '#39d353']) assert.ok(s.includes(c));
});

test('render: celdas por fecha, primera semana parcial en su fila', () => {
  // 2025-01-08 es miercoles (fila 3)
  const s = renderHeatmap({ days: [{ date: '2025-01-08', level: 1, count: 1 }, { date: '2025-01-09', level: 0, count: 0 }], total: 1 });
  assert.match(s, /<rect class="c l1 d3" x="\d+" y="\d+"/);
});
