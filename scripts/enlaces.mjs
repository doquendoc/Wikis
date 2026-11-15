// Lista los [[enlaces]] que no llevan a ninguna página. Uso: npm run enlaces
import fs from 'node:fs';
import path from 'node:path';
import { PATRON, RAIZ, resolver } from '../src/lib/wikilinks.mjs';
import { HISTORIAS } from '../src/lib/historias.mjs';

const recorrer = (d, f = []) => {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    e.isDirectory() ? recorrer(p, f) : /\.mdx?$/.test(e.name) && f.push(p);
  }
  return f;
};

let rotos = 0;
for (const archivo of recorrer(RAIZ)) {
  const rel = path.relative(RAIZ, archivo);
  const primera = rel.split(path.sep)[0];
  const historia = HISTORIAS.some((h) => h.dir === primera) ? primera : '';
  fs.readFileSync(archivo, 'utf8').split('\n').forEach((linea, i) => {
    for (const r of linea.matchAll(PATRON)) {
      if (!resolver(r[1], historia)) {
        console.log(`${rel}:${i + 1}  [[${r[1]}]]`);
        rotos++;
      }
    }
  });
}
console.log(rotos ? `\n${rotos} enlaces rotos` : 'Sin enlaces rotos');
process.exitCode = rotos ? 1 : 0;
