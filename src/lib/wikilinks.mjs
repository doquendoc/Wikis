// Enlaces tipo wiki dentro de cada historia:
//   [[senri]]             la página senri.md de la misma historia
//   [[senri|Senri]]       con otro texto
//   [[opcion-a:senri]]    de otra historia, poniendo su carpeta delante
// Si el id solo existe en una historia, también se encuentra desde las demás.
import fs from 'node:fs';
import path from 'node:path';

// Ruta desde la raíz del proyecto (al empaquetar, import.meta.url ya no apunta a src/).
export const RAIZ = path.resolve(process.cwd(), 'src/content/docs');
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
/** historia -> (id -> { href, titulo }) */
function indice(base = '/') {
  if (cache) return cache;
  const b = base.endsWith('/') ? base : base + '/';
  cache = new Map();
  for (const archivo of recorrer(RAIZ)) {
    const rel = path.relative(RAIZ, archivo).replace(/\\/g, '/').replace(/\.mdx?$/, '');
    const partes = rel.split('/');
    const historia = partes.length > 1 ? partes[0] : rel === 'index' ? '' : partes[0];
    const portada = rel === 'index' || rel === `${historia}/index`;
    const id = portada ? 'inicio' : path.basename(rel);
    const slug = rel === 'index' ? '' : portada ? historia : rel;
    const fm = fs.readFileSync(archivo, 'utf8').match(/^title:\s*"?(.*?)"?\s*$/m);
    if (!cache.has(historia)) cache.set(historia, new Map());
    const m = cache.get(historia);
    if (m.has(id)) throw new Error(`En «${historia || 'raíz'}» hay dos páginas con el id «${id}». Los nombres de archivo tienen que ser únicos dentro de cada historia.`);
    m.set(id, { href: b + (slug ? slug + '/' : ''), titulo: fm ? fm[1] : id });
  }
  return cache;
}

/** Busca el destino de un [[ref]] escrito en una página de `historia`. */
export function resolver(ref, historia, base = '/') {
  const idx = indice(base);
  const r = ref.trim();
  const dos = r.indexOf(':');
  if (dos > 0) return idx.get(r.slice(0, dos))?.get(r.slice(dos + 1)) ?? null;
  const propia = idx.get(historia)?.get(r);
  if (propia) return propia;
  const otras = [...idx.values()].map((m) => m.get(r)).filter(Boolean);
  return otras.length === 1 ? otras[0] : null;
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Convierte [[...]] en enlaces dentro de un texto suelto. Admite **negrita** y *cursiva* simples. */
export function enlazarHTML(texto, historia, base = '/') {
  let h = esc(String(texto));
  h = h.replace(PATRON, (_, ref, txt) => {
    const d = resolver(ref, historia, base);
    const t = txt ? txt.trim() : d ? d.titulo : ref;
    return d ? `<a href="${d.href}">${t}</a>` : t;
  });
  h = h.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  h = h.replace(/(^|[\s(«"—])\*([^*\n]+)\*/g, '$1<em>$2</em>');
  return h;
}

/** Direcciones a las que enlaza un texto escrito en `historia`. */
export function destinos(texto, historia, base = '/') {
  const hrefs = new Set();
  for (const r of String(texto || '').matchAll(PATRON)) {
    const d = resolver(r[1], historia, base);
    if (d) hrefs.add(d.href);
  }
  return hrefs;
}
