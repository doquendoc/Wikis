// Plugin de remark: convierte [[id]] y [[id|texto]] en enlaces dentro del cuerpo.
import { visit, SKIP } from 'unist-util-visit';
import { mapa, PATRON } from './wikilinks.mjs';

export default function remarkWikilinks({ base = '/' } = {}) {
  return (arbol) => {
    const m = mapa(base);
    visit(arbol, 'text', (nodo, i, padre) => {
      if (!padre || i == null || !nodo.value.includes('[[')) return;
      const trozos = [];
      let ultimo = 0;
      for (const r of nodo.value.matchAll(PATRON)) {
        if (r.index > ultimo) trozos.push({ type: 'text', value: nodo.value.slice(ultimo, r.index) });
        const id = r[1].trim();
        const d = m.get(id);
        const texto = r[2] ? r[2].trim() : d ? d.titulo : id;
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
