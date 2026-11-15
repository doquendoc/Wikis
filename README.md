# Wikis

Las biblias de mis historias, como wiki estática hecha con [Astro Starlight](https://starlight.astro.build). Cada historia tiene su propia barra lateral, sus pendientes y sus enlaces; el buscador busca en todas.

## Comandos

```sh
npm install          # una vez
npm run dev          # servidor local en http://localhost:4321, recarga al guardar
npm run build        # genera dist/ (lo que se sube a Cloudflare, Netlify…)
npm run artifact     # build + empaqueta artifact/ para publicarlo como artifact de Claude
npm run enlaces      # lista los [[enlaces]] que no llevan a ninguna página
```

## Dónde está cada cosa

```
src/content/docs/
  index.md                    portada general (una tarjeta por historia)
  opcion-a/                   una carpeta por historia
    index.md                  portada de la historia
    pendientes.md             se genera sola con los pendientes de esa historia
    libro/  capitulos/  personajes/  tampu/ …
src/lib/historias.mjs         historias, secciones y subgrupos del árbol lateral
src/styles/biblia.css         tipografía y colores
src/components/               ficha, pendientes, «mencionada en», migas
```

**El árbol lateral sale de las carpetas.** Una página nueva en `opcion-a/personajes/equipo/` aparece sola en Personajes › El equipo. Solo hay que tocar `src/lib/historias.mjs` para crear una historia, una sección o un subgrupo, o para cambiarles el nombre.

### Añadir una historia

1. Crea `src/content/docs/<carpeta>/index.md` (su portada) y `pendientes.md` copiando los de `opcion-a/`.
2. Añádela en `src/lib/historias.mjs` con su título, icono, descripción y secciones.
3. Crea las carpetas de las secciones y empieza a meter páginas.

## Formato de una página

```md
---
title: "Senri Hayami"
description: "La entradilla que sale bajo el título."
sidebar:
  order: 1                 # posición dentro de su carpeta
ficha:                     # tarjeta de datos (opcional); el valor admite [[enlaces]]
  - ["Especie", "[[kairos]]"]
  - ["Edad", "19"]
pendientes:                # opcional: sale al final y se recoge en Pendientes
  - "Nombre del órgano."
---

## Aspecto

Texto normal en markdown. **Negrita**, *cursiva*, tablas, listas, > avisos.
```

### Enlaces

- `[[senri]]` enlaza a la página `senri.md` **de la misma historia** y pone su título.
- `[[senri|Senri]]` enlaza con otro texto.
- `[[opcion-a:senri]]` enlaza a otra historia.
- Si el id solo existe en una historia, `[[id]]` lo encuentra desde cualquiera.
- Dentro de una tabla, el `|` se escapa: `[[senri\|Senri]]`.
- Los nombres de archivo tienen que ser únicos **dentro de cada historia**; entre historias pueden repetirse.
- Si un enlace apunta a algo que no existe, sale como texto normal, sin romper nada.

Es la misma sintaxis que Obsidian, así que cada carpeta de historia se puede abrir como vault.

Al pie de cada página sale «Mencionada en», con todas las que enlazan a ella.
