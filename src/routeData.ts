// Añade los bloques de la ficha de personaje al índice «En esta página».
import { defineRouteMiddleware } from '@astrojs/starlight/route-data';
import { BLOQUES } from './lib/personaje.mjs';

export const onRequest = defineRouteMiddleware((context) => {
  const route = context.locals.starlightRoute;
  const p = (route.entry.data as any).personaje;
  if (!p || !route.toc) return;
  const nuevos = BLOQUES.filter((b) => b.hay(p)).map((b) => ({ depth: 2, slug: b.id, text: b.titulo, children: [] }));
  const items = route.toc.items;
  const inicio = items[0]?.slug === '_top' ? 1 : 0;
  items.splice(inicio, 0, ...nuevos);
});
