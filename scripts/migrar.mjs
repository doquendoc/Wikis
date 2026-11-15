// Migración única: convierte los data/*.js de la app vieja en .md para Starlight.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const ORIGEN = '/home/claude/biblia/data';
const DESTINO = new URL('../src/content/docs/', import.meta.url).pathname;

const ctx = { window: {} };
vm.createContext(ctx);
for (const f of ['libro', 'capitulos', 'personajes', 'tampu', 'universo', 'especies', 'colonias']) {
  vm.runInContext(fs.readFileSync(path.join(ORIGEN, f + '.js'), 'utf8'), ctx);
}
const paginas = ctx.window.BIBLIA.secciones.flatMap((s) => s.paginas);

// id -> carpeta (la carpeta decide el árbol lateral)
const sitio = {
  inicio: '', pendientes: '',
  concepto: 'libro', twists: 'libro',
  'arco-1': 'libro/arcos', 'arco-2': 'libro/arcos', 'arco-3': 'libro/arcos', 'arco-4': 'libro/arcos', codas: 'libro/arcos',
  'cap-1': 'capitulos', 'cap-2': 'capitulos', secuestro: 'capitulos', 'cap-3': 'capitulos',
  senri: 'personajes/protagonistas', lev: 'personajes/protagonistas',
  nadia: 'personajes/equipo', leela: 'personajes/equipo', mushi: 'personajes/equipo', ravdna: 'personajes/equipo',
  grupo: 'personajes', secundarios: 'personajes',
  tampu: 'tampu', fondo: 'tampu', 'ley-tampu': 'tampu', 'mundo-criminal': 'tampu',
  pneuma: 'universo', 'pueblos-antiguos': 'universo', historia: 'universo', guerra: 'universo', aaru: 'universo',
  noaidi: 'especies/antiguos', nefilim: 'especies/antiguos', ammit: 'especies/antiguos',
  niwashi: 'especies/otras', qhatu: 'especies/otras', kirks: 'especies/otras', baatar: 'especies/otras', kamakiri: 'especies/otras',
  colonias: 'colonias', kairos: 'colonias', 'vinculo-kairos': 'colonias', iskra: 'colonias', chhaya: 'colonias', xingtian: 'colonias', trastornos: 'colonias',
};

const yaml = (s) => JSON.stringify(String(s)); // JSON es YAML válido para strings
const orden = {};
let escritas = 0;

for (const p of paginas) {
  const carpeta = sitio[p.id];
  if (carpeta === undefined) throw new Error('Sin carpeta: ' + p.id);
  orden[carpeta] = (orden[carpeta] || 0) + 1;

  const fm = ['---', `title: ${yaml(p.titulo)}`];
  if (p.lede) fm.push(`description: ${yaml(p.lede)}`);
  if (p.id !== 'inicio') fm.push('sidebar:', `  order: ${orden[carpeta]}`);
  if (p.ficha?.length) {
    fm.push('ficha:');
    for (const [k, v] of p.ficha) fm.push(`  - [${yaml(k)}, ${yaml(v)}]`);
  }
  if (p.pendientes?.length) {
    fm.push('pendientes:');
    for (const t of p.pendientes) fm.push(`  - ${yaml(t)}`);
  }
  if (p.auto) fm.push(`auto: ${p.auto}`);
  fm.push('---', '');

  // En las tablas, el | de [[id|texto]] rompería la celda: se escapa como en Obsidian.
  const cuerpo = (p.cuerpo || '').replace(/^\n+/, '').replace(/\s+$/, '')
    .split('\n')
    .map((l) => (l.trimStart().startsWith('|') ? l.replace(/\[\[([^\]|]+)\|([^\]]+)\]\]/g, '[[$1\\|$2]]') : l))
    .join('\n') + '\n';
  const nombre = p.id === 'inicio' ? 'index.md' : p.id + '.md';
  const ruta = path.join(DESTINO, carpeta, nombre);
  fs.mkdirSync(path.dirname(ruta), { recursive: true });
  fs.writeFileSync(ruta, fm.join('\n') + cuerpo);
  escritas++;
}
console.log('Escritas', escritas, 'páginas');
