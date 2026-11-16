// 1. Añade los bloques de la ficha de personaje al índice «En esta página».
// 2. Pone insignias en la barra lateral (estado del capítulo, «Por confirmar»).
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { getCollection } from 'astro:content';
import { BLOQUES } from './lib/personaje.mjs';
import { insigniaLateral } from './lib/insignias.mjs';

let porRuta: Map<string, any> | null = null;
const limpia = (s: string) => s.replace(/^\/+|\/+$/g, '');

export const onRequest = defineRouteMiddleware(async (context, next) => {
  await next();
  const route = context.locals.starlightRoute;

  const p = (route.entry.data as any).personaje;
  if (p && route.toc) {
    const nuevos = BLOQUES.filter((b) => b.hay(p)).map((b) => ({ depth: 2, slug: b.id, text: b.titulo, children: [] }));
    const items = route.toc.items;
    const inicio = items[0]?.slug === '_top' ? 1 : 0;
    items.splice(inicio, 0, ...nuevos);
  }

  if (!porRuta) {
    porRuta = new Map();
    for (const e of await getCollection('docs')) porRuta.set(limpia(e.id), e);
  }
  const base = limpia(import.meta.env.BASE_URL);
  const recorre = (entradas: any[]) => {
    for (const x of entradas) {
      if (x.type === 'group') recorre(x.entries);
      else if (x.type === 'link' && !x.badge) {
        let ruta = limpia(x.href.split('#')[0]);
        if (base && ruta.startsWith(base + '/')) ruta = ruta.slice(base.length + 1);
        const e = porRuta!.get(ruta);
        const b = e && insigniaLateral(e);
        if (b) x.badge = { text: b.text, variant: b.variant };
      }
    }
  };
  recorre(route.sidebar);
});
