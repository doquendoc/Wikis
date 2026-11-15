# Opción A · biblia

La biblia del libro como wiki estática, hecha con [Astro Starlight](https://starlight.astro.build).

## Comandos

```sh
npm install          # una vez
npm run dev          # servidor local en http://localhost:4321, recarga al guardar
npm run build        # genera dist/ (lo que se sube a Cloudflare, Netlify…)
npm run artifact     # build + empaqueta artifact/ para publicarlo como artifact de Claude
```

## Dónde está cada cosa

```
src/content/docs/          ← todo el contenido, en markdown
  index.md                 portada
  pendientes.md            se genera sola con los pendientes de todas las páginas
  libro/  capitulos/  personajes/  tampu/  universo/  especies/  colonias/
src/lib/secciones.mjs      nombres de las secciones y subgrupos del árbol lateral
src/styles/biblia.css      tipografía y colores
src/components/            ficha, pendientes, «mencionada en», migas
```

**El árbol lateral sale de las carpetas.** Una página nueva en `personajes/equipo/` aparece sola en Personajes › El equipo. Solo hay que tocar `src/lib/secciones.mjs` para crear una sección o un subgrupo nuevo, o cambiarle el nombre.

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

- `[[senri]]` enlaza a la página cuyo archivo se llama `senri.md` y pone su título.
- `[[senri|Senri]]` enlaza con otro texto.
- Dentro de una tabla, el `|` se escapa: `[[senri\|Senri]]`.
- Los nombres de archivo tienen que ser únicos en todo el sitio, porque son el id del enlace.
- Si un enlace apunta a algo que no existe, sale como texto normal, sin romper nada.

Es la misma sintaxis que Obsidian, así que la carpeta `src/content/docs/` se puede abrir como vault.

Al pie de cada página sale «Mencionada en», con todas las que enlazan a ella.
