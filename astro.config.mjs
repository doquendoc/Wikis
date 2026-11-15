import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';
import { SECCIONES } from './src/lib/secciones.mjs';

const BASE = '/';
const DOCS = path.resolve('src/content/docs');

// Páginas sueltas de una carpeta (sin bajar a subcarpetas), en el orden de su frontmatter.
function sueltas(dir) {
  return fs
    .readdirSync(path.join(DOCS, dir), { withFileTypes: true })
    .filter((e) => e.isFile() && /\.mdx?$/.test(e.name))
    .map((e) => {
      const txt = fs.readFileSync(path.join(DOCS, dir, e.name), 'utf8');
      const orden = Number((txt.match(/^\s+order:\s*(\d+)/m) || [])[1] ?? 999);
      return { slug: `${dir}/${e.name.replace(/\.mdx?$/, '')}`, orden };
    })
    .sort((a, b) => a.orden - b.orden)
    .map(({ slug }) => ({ slug }));
}

const sidebar = [
  { label: 'Opción A', link: '/' },
  { slug: 'pendientes' },
  ...SECCIONES.map((s) => {
    if (!s.sub) return { label: s.label, collapsed: true, items: [{ autogenerate: { directory: s.dir } }] };
    const grupos = s.sub.map((x) => ({ label: x.label, collapsed: true, items: [{ autogenerate: { directory: `${s.dir}/${x.dir}` } }] }));
    const paginas = sueltas(s.dir);
    return { label: s.label, collapsed: true, items: s.subPrimero ? [...grupos, ...paginas] : [...paginas, ...grupos] };
  }),
];

export default defineConfig({
  base: BASE,
  // El host de artifacts reserva los nombres que empiezan por _
  build: { assets: 'assets' },
  markdown: {
    remarkPlugins: [[remarkWikilinks, { base: BASE }]],
  },
  integrations: [
    starlight({
      title: 'Opción A',
      description: 'Biblia de Opción A.',
      defaultLocale: 'root',
      locales: { root: { label: 'Español', lang: 'es' } },
      sidebar,
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      pagination: true,
      credits: false,
      markdown: { headingLinks: false },
      customCss: ['./src/styles/biblia.css'],
      head: [
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.googleapis.com' } },
        { tag: 'link', attrs: { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true } },
        {
          tag: 'link',
          attrs: {
            rel: 'stylesheet',
            href: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,600;1,8..60,400&family=IBM+Plex+Mono:wght@400;500&display=swap',
          },
        },
      ],
      components: {
        MarkdownContent: './src/components/MarkdownContent.astro',
        PageTitle: './src/components/PageTitle.astro',
      },
    }),
  ],
});
