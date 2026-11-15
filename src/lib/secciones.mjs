// El árbol lateral. Cada sección es una carpeta de src/content/docs/.
// Las subcarpetas son subgrupos plegables. Una página nueva aparece sola en su carpeta;
// solo hay que tocar esto para crear una sección o un subgrupo nuevo, o cambiar su nombre.
export const SECCIONES = [
  { dir: 'libro', label: 'El libro', sub: [{ dir: 'arcos', label: 'Arcos y final' }] },
  { dir: 'capitulos', label: 'Capítulos' },
  {
    dir: 'personajes', label: 'Personajes', subPrimero: true,
    sub: [
      { dir: 'protagonistas', label: 'Protagonistas' },
      { dir: 'equipo', label: 'El equipo' },
    ],
  },
  { dir: 'tampu', label: 'Tampu' },
  { dir: 'universo', label: 'El universo' },
  {
    dir: 'especies', label: 'Especies',
    sub: [
      { dir: 'antiguos', label: 'Pueblos antiguos' },
      { dir: 'otras', label: 'Otras especies' },
    ],
  },
  { dir: 'colonias', label: 'Colonias humanas' },
];

/** Nombre legible de cada carpeta, para las migas de pan. */
export const ETIQUETAS = Object.fromEntries(
  SECCIONES.flatMap((s) => [[s.dir, s.label], ...(s.sub || []).map((x) => [`${s.dir}/${x.dir}`, x.label])])
);
