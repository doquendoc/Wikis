// Prepara dist/ para publicarlo como artifact de Claude, en artifact/.
// El host sirve la página bajo una ruta propia, así que todo lo que Astro escribe
// como "/algo" se pasa a ruta relativa, y la portada se mueve a inicio/ porque el
// archivo principal del artifact se envuelve en su propio esqueleto HTML.
// Para un hosting normal (Cloudflare, Netlify) se publica dist/ tal cual.
import fs from 'node:fs';
import path from 'node:path';

const DIST = path.resolve('dist');
const OUT = path.resolve('artifact');

fs.rmSync(OUT, { recursive: true, force: true });
fs.cpSync(DIST, OUT, { recursive: true });

// La portada pasa a inicio/index.html
fs.mkdirSync(path.join(OUT, 'inicio'), { recursive: true });
fs.renameSync(path.join(OUT, 'index.html'), path.join(OUT, 'inicio', 'index.html'));

const esDir = (rel) => {
  try { return fs.statSync(path.join(OUT, rel)).isDirectory(); } catch { return false; }
};

function relativa(abs, prof) {
  const [ruta, resto = ''] = abs.split(/(?=[?#])/);
  let r = ruta.replace(/^\//, '');
  if (r === '') r = 'inicio/index.html';
  else if (r.endsWith('/')) r += 'index.html';
  else if (esDir(r)) r += '/index.html';
  return '../'.repeat(prof) + r + resto;
}

function recorrer(dir, fuera = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) recorrer(p, fuera);
    else fuera.push(p);
  }
  return fuera;
}

let html = 0;
for (const f of recorrer(OUT)) {
  if (f.endsWith('.html')) {
    const prof = path.relative(OUT, path.dirname(f)).split(path.sep).filter(Boolean).length;
    const txt = fs.readFileSync(f, 'utf8').replace(
      /\b(href|src|content|action)="(\/(?!\/)[^"]*)"/g,
      (_, attr, abs) => `${attr}="${relativa(abs, prof)}"`
    );
    fs.writeFileSync(f, txt);
    html++;
  } else if (f.endsWith('.js')) {
    // El buscador: rutas al índice y a los resultados, relativas a la raíz del sitio.
    let txt = fs.readFileSync(f, 'utf8');
    const antes = txt;
    txt = txt.replace(
      'baseUrl:`/`,bundlePath:`/`.replace(/\\/$/,``)+`/pagefind/`',
      'baseUrl:new URL(`../`,import.meta.url).href,bundlePath:new URL(`../pagefind/`,import.meta.url).href'
    );
    if (txt !== antes) fs.writeFileSync(f, txt);
  }
}

// El host solo sirve tipos de archivo estándar: los índices del buscador
// (.pf_meta, .pf_index, .pf_fragment, .pagefind) se sirven como binarios .wasm.
const EXT = /\.(pf_meta|pf_index|pf_fragment|pagefind)$/;
for (const f of recorrer(path.join(OUT, 'pagefind'))) {
  if (EXT.test(f)) fs.renameSync(f, f + '.wasm');
  else if (/pagefind(-worker)?\.js$/.test(f)) {
    const txt = fs.readFileSync(f, 'utf8').replace(/\.(pf_meta|pf_index|pf_fragment|pagefind)`/g, '.$1.wasm`');
    fs.writeFileSync(f, txt);
  }
}

// Archivo principal: el host le pone su esqueleto; solo redirige a la portada.
fs.writeFileSync(
  path.join(OUT, 'index.html'),
  `<title>Wikis</title>
<meta http-equiv="refresh" content="0; url=inicio/index.html">
<script>location.replace('inicio/index.html' + location.hash)</script>
<p style="font-family:Georgia,serif;padding:2rem"><a href="inicio/index.html">Abrir las wikis</a></p>
`
);

// Mapa de archivos para la herramienta de publicación
const files = Object.fromEntries(
  recorrer(OUT)
    .map((f) => path.relative(OUT, f).split(path.sep).join('/'))
    .filter((r) => r !== 'index.html')
    .map((r) => [r, r])
);
fs.writeFileSync(path.resolve('artifact-files.json'), JSON.stringify(files, null, 1));
console.log(`artifact/: ${html} páginas, ${Object.keys(files).length + 1} archivos`);
