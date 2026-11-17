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

## Fichas de personaje

Las páginas de personajes usan siempre la misma ficha, con los mismos bloques en el mismo orden: cabecera, **De un vistazo**, **Aspecto** (con **Marcas y detalles**: tatuajes, cicatrices, aretes, parches… con su lado y zona exactos), **Voz y manías**, **Familia**, **Relaciones**, **Cronología** y **Lo que sabe y lo que no**. Después va la prosa libre.

Los datos van en el frontmatter, bajo `personaje:`. La plantilla en blanco, comentada campo a campo, está en `plantillas/personaje.md`: se copia a la carpeta del personaje y se rellena. Un bloque vacío no se pinta ni sale en el índice de la página.

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

## Insignias y propuestas

- Las insignias salen solas (`src/lib/insignias.mjs`): el **estado** de un capítulo sale del campo `Estado` de su ficha (Borrador, Escaleta, Revisado); **Por confirmar** aparece si la página tiene un recuadro `:::caution[Por confirmar]` o un valor de ficha con `(por confirmar)`; **N pendientes** enlaza al recuadro de pendientes.
- Todo lo que proponga Claude sin que Diana lo haya decidido va dentro de un recuadro:

  ```md
  :::caution[Por confirmar]
  Propuesta de Claude. Cámbialo o bórralo cuando lo revises.
  :::
  ```
  y con una línea en `pendientes` que diga qué hay que confirmar. Al confirmarlo, se quita el recuadro.
- Un subgrupo de la barra lateral puede ir entre páginas sueltas: en `historias.mjs`, dale `orden` (como `colonias/kairos`).

## Fichas: los datos se encuentran sin leer

Regla para todas las páginas: **cualquier dato que alguien pueda buscar va en la ficha**, no solo en un párrafo. El texto puede repetirlo y contarlo; la ficha es para encontrarlo.

```yaml
ficha:
  - ["# Condiciones", ""]                 # abre un grupo con título
  - ["Gravedad", "1 g"]
  - ["Oxígeno", "?"]                      # se pinta «Sin definir»
  - ["Luz", "Sol intenso (por confirmar)"] # insignia «Por confirmar»
  - ["Fauna", ["Likho", "Svetlyak (por confirmar)"]]  # plaquitas, fila entera
```

- Los planetas usan siempre los mismos grupos y campos: **Condiciones** (Gravedad, Temperatura, Oxígeno, Humedad, Atmósfera, Luz, Día y noche, Clima), **Vida** (Paisaje, Fauna, Flora) y **Gente** (Subespecie o Especie, Capital, Idioma). Lo que no se sabe va con `?`, para que el hueco se vea.
- Una subespecie con `planeta: "mrak"` en el frontmatter muestra sola las condiciones de su planeta, sacadas de la ficha del planeta: se mantienen en un único sitio.
