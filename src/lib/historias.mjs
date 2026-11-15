// Las historias y su árbol lateral. Cada historia es una carpeta de src/content/docs/,
// y dentro, cada sección es una subcarpeta. Las sub-subcarpetas son subgrupos plegables.
// Una página nueva aparece sola en su carpeta; solo hay que tocar esto para crear una
// historia, una sección o un subgrupo, o para cambiarles el nombre.
export const HISTORIAS = [
  {
    dir: 'opcion-a',
    titulo: 'La Última Carrera',
    icono: 'open-book',
    descripcion: 'Ciencia ficción BL. Cuatro mercenarios, una granja de devoradores y un contenedor que nadie ha sacado con vida.',
    secciones: [
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
    ],
  },
];

/** Nombre legible de cada carpeta, para las migas de pan. Clave: "historia/seccion[/sub]". */
export const ETIQUETAS = Object.fromEntries(
  HISTORIAS.flatMap((h) =>
    h.secciones.flatMap((s) => [
      [`${h.dir}/${s.dir}`, s.label],
      ...(s.sub || []).map((x) => [`${h.dir}/${s.dir}/${x.dir}`, x.label]),
    ])
  )
);

/** Historia a la que pertenece una entrada ("" para las páginas generales). */
export function historiaDe(entryId) {
  const primera = entryId.split('/')[0];
  return HISTORIAS.some((h) => h.dir === primera) ? primera : '';
}
