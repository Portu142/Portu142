// Descarga las contribuciones y escribe contrib-heatmap.svg solo si todo sale bien.
import { writeFileSync } from 'node:fs';
import { parseContributions, validateContributions, renderHeatmap } from './contributions.mjs';

const URL_ = 'https://github.com/users/Portu142/contributions';
const OUT = new URL('../contrib-heatmap.svg', import.meta.url);

try {
  const res = await fetch(URL_, {
    headers: { 'User-Agent': 'portu142-profile-readme' },
    signal: AbortSignal.timeout(15000),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const svg = renderHeatmap(validateContributions(parseContributions(await res.text())));
  writeFileSync(OUT, svg);
  console.log(`contrib-heatmap.svg escrito (${svg.length} bytes)`);
} catch (err) {
  console.error(`make-heatmap fallo: ${err.message}`);
  process.exit(1);
}
