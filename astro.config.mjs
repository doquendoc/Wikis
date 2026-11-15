import fs from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import starlightSidebarTopics from 'starlight-sidebar-topics';
import remarkWikilinks from './src/lib/remark-wikilinks.mjs';
import { HISTORIAS } from './src/lib/historias.mjs';

const BASE = '/';
const DOCS = path.resolve('src/content/docs');

// Páginas sueltas de una carpeta (sin bajar a subcarpetas), en el orden de su frontmatter.
function sueltas(dir) {
  return fs
    .readdirSync(path.join(DOCS, dir), { withFileTypes: true })
    .filter((e) => e.isFile() && /\.mdx?$/.test(e.name) && e.name !== 'index.md')
    .map((e) => {
      const txt = fs.readFileSync(path.join(DOCS, dir, e.name), 'utf8');
      const orden = Number((txt.match(/^\s+order:\s*(\d+)/m) || [])[1] ?? 999);
      return { slug: `${dir}/${e.name.replace(/\.mdx?$/, '')}`, orden };
    })
    .sort((a, b) => a.orden - b.orden)
    .map(({ slug }) => ({ slug }));
}

const grupo = (label, dir) => ({ label, collapsed: true, items: [{ autogenerate: { directory: dir } }] });

// Un tema por historia: cada una tiene su propia barra lateral.
const temas = HISTORIAS.map((h) => ({
  id: h.dir,
  label: h.titulo,
  link: `/${h.dir}/`,
  icon: h.icono,
  items: [
    { label: 'Portada', link: `/${h.dir}/` },
    ...sueltas(h.dir),
    ...h.secciones.map((s) => {
      const dir = `${h.dir}/${s.dir}`;
      if (!s.sub) return grupo(s.label, dir);
      const subs = s.sub.map((x) => grupo(x.label, `${dir}/${x.dir}`));
      const paginas = sueltas(dir);
      return { label: s.label, collapsed: true, items: s.subPrimero ? [...subs, ...paginas] : [...paginas, ...subs] };
    }),
  ],
}));

export default defineConfig({
  base: BASE,
  // El host de artifacts reserva los nombres que empiezan por _
  build: { assets: 'assets' },
  markdown: {
    remarkPlugins: [[remarkWikilinks, { base: BASE }]],
  },
  integrations: [
    starlight({
      title: 'Wikis',
      description: 'Las biblias de mis historias.',
      defaultLocale: 'root',
      locales: { root: { label: 'Español', lang: 'es' } },
      tableOfContents: { minHeadingLevel: 2, maxHeadingLevel: 3 },
      pagination: true,
      credits: false,
      markdown: { headingLinks: false },
      customCss: ['./src/styles/biblia.css'],
      plugins: [starlightSidebarTopics(temas, { exclude: ['/'] })],
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
