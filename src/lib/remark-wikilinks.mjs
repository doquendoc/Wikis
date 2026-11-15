// Plugin de remark: convierte [[id]], [[id|texto]] y [[historia:id]] en enlaces en el cuerpo.
import path from 'node:path';
import { visit, SKIP } from 'unist-util-visit';
import { PATRON, RAIZ, resolver } from './wikilinks.mjs';
import { HISTORIAS } from './historias.mjs';

function historiaDelArchivo(file) {
  const ruta = file?.path ?? file?.history?.[0];
  if (!ruta) return '';
  const primera = path.relative(RAIZ, ruta).split(path.sep)[0];
  return HISTORIAS.some((h) => h.dir === primera) ? primera : '';
}

export default function remarkWikilinks({ base = '/' } = {}) {
  return (arbol, file) => {
    const historia = historiaDelArchivo(file);
    visit(arbol, 'text', (nodo, i, padre) => {
      if (!padre || i == null || !nodo.value.includes('[[')) return;
      const trozos = [];
      let ultimo = 0;
      for (const r of nodo.value.matchAll(PATRON)) {
        if (r.index > ultimo) trozos.push({ type: 'text', value: nodo.value.slice(ultimo, r.index) });
        const d = resolver(r[1], historia, base);
        const texto = r[2] ? r[2].trim() : d ? d.titulo : r[1].trim();
        trozos.push(
          d
            ? { type: 'link', url: d.href, children: [{ type: 'text', value: texto }], data: { hProperties: { className: ['wl'] } } }
            : { type: 'text', value: texto }
        );
        ultimo = r.index + r[0].length;
      }
      if (!trozos.length) return;
      if (ultimo < nodo.value.length) trozos.push({ type: 'text', value: nodo.value.slice(ultimo) });
      padre.children.splice(i, 1, ...trozos);
      return [SKIP, i + trozos.length];
    });
  };
}
