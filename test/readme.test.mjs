import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';

const root = new URL('../', import.meta.url);
const readme = readFileSync(new URL('README.md', root), 'utf8');
const workflow = readFileSync(new URL('.github/workflows/actualizar-perfil.yml', root), 'utf8');

test('el README referencia todos los SVG de la raíz', () => {
  const svgs = readdirSync(root).filter((f) => f.endsWith('.svg'));
  assert.ok(svgs.length >= 5);
  for (const f of svgs) assert.ok(readme.includes(`./${f}`), `falta ${f}`);
});

test('toda <img> tiene width y alt no vacío', () => {
  const imgs = readme.match(/<img\b[^>]*>/g) ?? [];
  assert.ok(imgs.length >= 5);
  for (const tag of imgs) {
    assert.match(tag, /\swidth="\d+"/, tag);
    assert.match(tag, /\salt="[^"]+"/, tag);
  }
});

test('el README no menciona repos privados y enlaza el correo', () => {
  assert.doesNotMatch(readme, /private|privado/i);
  assert.match(readme, /mailto:rdpcarvalho644@gmail\.com/);
  assert.match(readme, /https:\/\/portu142\.github\.io\/LocalizadorCafeterias\//);
});

test('el workflow tiene cron, permisos y [skip ci]', () => {
  assert.ok(workflow.includes('cron: "17 6 * * *"'));
  assert.ok(workflow.includes('contents: write'));
  assert.ok(workflow.includes('[skip ci]'));
  assert.ok(workflow.includes('workflow_dispatch'));
  assert.ok(workflow.includes('node scripts/make-heatmap.mjs'));
});
