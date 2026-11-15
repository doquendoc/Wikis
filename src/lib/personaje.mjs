// Bloques fijos de una ficha de personaje, en el orden en que salen siempre.
// Los usan el componente Personaje.astro y el índice «En esta página» (src/routeData.ts).
// Un bloque sin datos no se pinta ni sale en el índice.
export const BLOQUES = [
  { id: 'de-un-vistazo', titulo: 'De un vistazo', hay: (p) => p.vistazo && Object.values(p.vistazo).some((v) => v?.length) },
  { id: 'aspecto', titulo: 'Aspecto', hay: (p) => p.aspecto && Object.values(p.aspecto).some((v) => v?.length) },
  { id: 'voz', titulo: 'Voz y manías', hay: (p) => p.voz && Object.values(p.voz).some((v) => v?.length) },
  { id: 'familia', titulo: 'Familia', hay: (p) => p.familia?.length },
  { id: 'relaciones', titulo: 'Relaciones', hay: (p) => p.relaciones?.length },
  { id: 'cronologia', titulo: 'Cronología', hay: (p) => p.cronologia?.length },
  { id: 'lo-que-sabe', titulo: 'Lo que sabe y lo que no', hay: (p) => p.sabe?.length || p.ignora?.length },
];
