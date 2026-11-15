// Enlaces tipo wiki: [[id]] y [[id|texto]], donde id es el nombre del archivo sin .md.
// Lo usan el plugin de markdown (cuerpo de las páginas) y los componentes (ficha, pendientes).
import fs from 'node:fs';
import path from 'node:path';

// Ruta desde la raíz del proyecto (al empaquetar, import.meta.url ya no apunta a src/).
const RAIZ = path.resolve(process.cwd(), 'src/content/docs');
export const PATRON = /\[\[([^\]|\\]+)(?:\\?\|([^\]]+))?\]\]/g;

function recorrer(dir, fuera = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, fuera);
    else if (/\.mdx?$/.test(e.name)) fuera.push(p);
  }
  return fuera;
}

let cache;
/** id -> { href, titulo, slug } */
export function mapa(base = '/') {
  if (cache) return cache;
  cache = new Map();
  const b = base.endsWith('/') ? base : base + '/';
  for (const archivo of recorrer(RAIZ)) {
    const rel = path.relative(RAIZ, archivo).replace(/\\/g, '/').replace(/\.mdx?$/, '');
    const raiz = rel === 'index';
    const id = raiz ? 'inicio' : path.basename(rel);
    const slug = raiz ? '' : rel;
    const fm = fs.readFileSync(archivo, 'utf8').match(/^title:\s*"?(.*?)"?\s*$/m);
    if (cache.has(id)) throw new Error(`Hay dos páginas con el id «${id}». Los nombres de archivo tienen que ser únicos.`);
    cache.set(id, { href: b + (slug ? slug + '/' : ''), titulo: fm ? fm[1] : id, slug });
  }
  return cache;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Convierte [[...]] en enlaces dentro de un texto suelto. Admite **negrita** y *cursiva* simples. */
export function enlazarHTML(texto, base = '/') {
  const m = mapa(base);
  let h = esc(String(texto));
  h = h.replace(PATRON, (_, id, txt) => {
    const d = m.get(id.trim());
    const t = txt ? txt.trim() : d ? d.titulo : id;
    return d ? `<a href="${d.href}">${t}</a>` : t;
  });
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[\s(«"—])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return h;
}

/** Ids a los que enlaza un texto. */
export function enlacesDe(texto) {
  const ids = new Set();
  for (const r of String(texto || '').matchAll(PATRON)) ids.add(r[1].trim());
  return ids;
}
