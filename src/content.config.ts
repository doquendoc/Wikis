import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

// Todos los textos admiten [[enlaces]], **negrita** y *cursiva*.
const texto = z.string();
const par = z.tuple([z.string(), z.string()]);
// Fila de ficha de página: ["Campo", "valor"] o ["Campo", ["chip", "chip"]].
// ["# Grupo", ""] abre un grupo con título. "?" pinta «Sin definir».
const fila = z.tuple([z.string(), z.union([z.string(), z.array(z.string())])]);

// Ficha de personaje. Cada bloque es opcional; los que faltan no se pintan.
// El orden en pantalla es siempre el mismo (src/lib/personaje.mjs).
const personaje = z.object({
  rol: texto.optional(), // "Protagonista · POV"
  especie: texto.optional(), // "[[kairos]]"
  edad: texto.optional(),
  apodos: z.array(texto).optional(), // cómo lo llaman los demás
  datos: z.array(par).optional(), // más datos rápidos para la cabecera: altura, armas…

  vistazo: z
    .object({
      rasgos: z.array(texto).optional(), // tres, como mucho cuatro
      quiere: texto.optional(),
      necesita: texto.optional(),
      miedo: texto.optional(),
    })
    .optional(),

  aspecto: z
    .object({
      rasgos: z.array(par).optional(), // ["Ojos", "…"], ["Pelo", "…"]
      // Lo que hay que recordar con exactitud: dónde está cada cosa.
      marcas: z
        .array(
          z.object({
            tipo: z.string(), // tatuaje, cicatriz, arete, parche, injerto, implante…
            donde: texto, // "lóbulo izquierdo", "cuello y mandíbula"
            que: texto.optional(),
            nota: texto.optional(), // desde cuándo, quién se lo hizo, en qué capítulo sale
          })
        )
        .optional(),
      ropa: texto.optional(),
      lleva: z.array(texto).optional(), // lo que lleva siempre encima
      texto: z.array(texto).optional(), // párrafos libres
    })
    .optional(),

  voz: z
    .object({
      habla: texto.optional(),
      dice: z.array(texto).optional(), // muletillas y palabras suyas
      llama: z.array(par).optional(), // ["Senri", "malchik"]: cómo llama él a los demás
      manias: z.array(texto).optional(),
      gusta: z.array(texto).optional(),
      odia: z.array(texto).optional(),
    })
    .optional(),

  familia: z
    .array(
      z.object({
        nombre: texto,
        relacion: texto, // "Madre", "Hermano mayor"
        estado: z.string().optional(), // "viva", "muerto", "desconocido"
        nota: texto.optional(),
      })
    )
    .optional(),

  relaciones: z
    .array(
      z.object({
        con: texto, // "[[lev]]"
        es: texto, // qué es para él y cómo cambia
        lellama: texto.optional(), // cómo lo llama
      })
    )
    .optional(),

  cronologia: z.array(z.object({ cuando: texto, que: texto })).optional(),

  sabe: z.array(texto).optional(),
  ignora: z.array(texto).optional(),
});

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Tarjeta de datos de cabecera: pares [etiqueta, valor]. El valor admite [[enlaces]].
        ficha: z.array(fila).optional(),
        // En la página de una subespecie: el id de su planeta, para traer sus condiciones.
        planeta: z.string().optional(),
        personaje: personaje.optional(),
        // Lo que queda por decidir. Sale al final de la página y se recoge en Pendientes.
        pendientes: z.array(z.string()).optional(),
        // "pendientes" genera la lista de la historia en esa página.
        auto: z.enum(['pendientes']).optional(),
      }),
    }),
  }),
};
