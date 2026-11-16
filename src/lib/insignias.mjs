// Insignias (badges) que se calculan solas a partir del contenido de cada página.
// Se usan en dos sitios: la barra lateral (una por página, la más útil) y la cabecera
// de la página (todas). Mismo texto y mismo color en los dos sitios.
//
//   Estado del capítulo   ficha «Estado»: Borrador → verde, Escaleta → azul
//   Por confirmar         la página tiene propuestas sin confirmar (:::caution[Por confirmar]
//                         o «(por confirmar)» en la ficha)
//   N pendientes          solo en la cabecera; enlaza al recuadro de pendientes

const ESTADOS = [
  [/borrador/i, { text: 'Borrador', variant: 'success' }],
  [/escaleta/i, { text: 'Escaleta', variant: 'note' }],
  [/revisad|final/i, { text: 'Revisado', variant: 'tip' }],
];

export function estado(data) {
  const v = (data.ficha || []).find(([k]) => /^estado$/i.test(k))?.[1];
  if (!v) return null;
  for (const [re, b] of ESTADOS) if (re.test(v)) return b;
  return { text: v, variant: 'default' };
}

export function porConfirmar(entry) {
  const texto = [entry.body || '', JSON.stringify(entry.data.ficha || []), JSON.stringify(entry.data.personaje || {})].join('\n');
  return /\[Por confirmar\]|\(por confirmar\)/i.test(texto);
}

/** Todas las insignias de una página, en orden de importancia. */
export function insignias(entry) {
  const out = [];
  const e = estado(entry.data);
  if (e) out.push(e);
  if (porConfirmar(entry)) out.push({ text: 'Por confirmar', variant: 'caution' });
  const n = entry.data.pendientes?.length || 0;
  if (n && entry.data.auto !== 'pendientes') out.push({ text: `${n} pendiente${n > 1 ? 's' : ''}`, variant: 'pendiente', href: '#pendientes' });
  return out;
}

/** La única insignia de la barra lateral: el estado del capítulo o, si no, «Por confirmar». */
export function insigniaLateral(entry) {
  return estado(entry.data) || (porConfirmar(entry) ? { text: 'Por confirmar', variant: 'caution' } : null);
}
