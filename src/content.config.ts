import { defineCollection } from 'astro:content';
import { z } from 'astro/zod';
import { docsLoader } from '@astrojs/starlight/loaders';
import { docsSchema } from '@astrojs/starlight/schema';

export const collections = {
  docs: defineCollection({
    loader: docsLoader(),
    schema: docsSchema({
      extend: z.object({
        // Tarjeta de datos de cabecera: pares [etiqueta, valor]. El valor admite [[enlaces]].
        ficha: z.array(z.tuple([z.string(), z.string()])).optional(),
        // Lo que queda por decidir. Sale al final de la página y se recoge en /pendientes/.
        pendientes: z.array(z.string()).optional(),
        // "pendientes" genera la lista global en esa página.
        auto: z.enum(['pendientes']).optional(),
      }),
    }),
  }),
};
