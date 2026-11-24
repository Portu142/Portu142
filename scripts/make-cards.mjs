import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { info, projects } from './content.mjs';
import { renderInfoCard, renderProjectCard } from './cards.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = (name, svg) => {
  writeFileSync(join(root, name), svg);
  console.log(`escrito ${name}`);
};

out('info-card.svg', renderInfoCard(info));
for (const p of projects) out(`project-${p.name}.svg`, renderProjectCard(p));
