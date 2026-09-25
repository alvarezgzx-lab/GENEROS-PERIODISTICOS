/** Métricas del dashboard (funciones puras, probadas con Vitest). */
import type { Categoria, Interaccion, ModeloSlides, PasoTrayecto } from '../content/types';
import type { Origen, Respuesta } from '../state/store';

export interface Filtro {
  semilla: boolean;
  enVivo: boolean;
}

export function filtrar(respuestas: Respuesta[], f: Filtro) {
  return respuestas.filter((r) => (r.origen === 'semilla' ? f.semilla : f.enVivo));
}

export function reactivos(modelo: ModeloSlides): Interaccion[] {
  return modelo.pantallas.flatMap((p) => (p.interaccion ? [p.interaccion] : []));
}

export interface Tasa {
  clave: string;
  aciertos: number;
  total: number;
  pct: number | null;
}

function tasa(clave: string, rs: Respuesta[]): Tasa {
  const conClave = rs.filter((r) => r.es_correcta !== null);
  const aciertos = conClave.filter((r) => r.es_correcta).length;
  return { clave, aciertos, total: conClave.length, pct: conClave.length ? (aciertos / conClave.length) * 100 : null };
}

export function participacion(rs: Respuesta[], its: Interaccion[]) {
  return its.map((it) => {
    const del = rs.filter((r) => r.id_reactivo === it.id_reactivo);
    const por: Record<Origen, number> = {
      en_vivo: del.filter((r) => r.origen === 'en_vivo').length,
      semilla: del.filter((r) => r.origen === 'semilla').length,
    };
    return { id: it.id_reactivo, etiqueta: it.etiqueta, ...por, total: del.length };
  });
}

export function aciertoPorReactivo(rs: Respuesta[], its: Interaccion[]): Array<Tasa & { etiqueta: string; sinClave: boolean }> {
  return its.map((it) => ({
    ...tasa(
      it.id_reactivo,
      rs.filter((r) => r.id_reactivo === it.id_reactivo),
    ),
    etiqueta: it.etiqueta,
    sinClave: it.tipo === 'seleccion' && it.correcta === null,
  }));
}

export function aciertoPor(rs: Respuesta[], campo: 'paso_del_trayecto' | 'nivel_de_lectura' | 'proceso_pisa', sinEtiqueta: string): Tasa[] {
  const grupos = new Map<string, Respuesta[]>();
  for (const r of rs) {
    const k = (r[campo] as string | null) ?? sinEtiqueta;
    grupos.set(k, [...(grupos.get(k) ?? []), r]);
  }
  return [...grupos.entries()].map(([k, v]) => tasa(k, v));
}

export const CATEGORIAS: Categoria[] = ['informativo', 'interpretativo', 'opinion'];

/** Matriz de confusión: filas = categoría correcta, columnas = categoría elegida. */
export function matrizConfusion(rs: Respuesta[]) {
  const m: Record<string, Record<string, number>> = {};
  for (const f of CATEGORIAS) m[f] = Object.fromEntries(CATEGORIAS.map((c) => [c, 0]));
  for (const r of rs) {
    if (r.categoria_correcta && r.categoria_elegida && m[r.categoria_correcta]) m[r.categoria_correcta][r.categoria_elegida]++;
  }
  return m;
}

export function distractores(rs: Respuesta[], its: Interaccion[]) {
  return its.map((it) => {
    const errores = rs.filter((r) => r.id_reactivo === it.id_reactivo && r.es_correcta === false);
    const cuenta = new Map<string, number>();
    for (const r of errores) cuenta.set(r.opcion_elegida, (cuenta.get(r.opcion_elegida) ?? 0) + 1);
    const top = [...cuenta.entries()].sort((a, b) => b[1] - a[1])[0];
    const falla = top && it.tipo === 'seleccion' ? (it.fallas[top[0]] ?? null) : null;
    return { id: it.id_reactivo, etiqueta: it.etiqueta, opcion: top?.[0] ?? null, veces: top?.[1] ?? 0, falla };
  });
}

export function calidadJustificacion(rs: Respuesta[]) {
  const aplica = rs.filter((r) => r.justificacion_suficiente !== null && r.es_correcta === true);
  return {
    con: aplica.filter((r) => r.justificacion_suficiente).length,
    sin: aplica.filter((r) => !r.justificacion_suficiente).length,
  };
}

export function tiempoMedio(rs: Respuesta[]): number | null {
  if (!rs.length) return null;
  return rs.reduce((s, r) => s + r.tiempo_de_respuesta_s, 0) / rs.length;
}

/**
 * Síntesis con reglas fijas: el paso del trayecto con mayor proporción de fallas
 * (empate: mayor número de fallas; luego orden del trayecto) y la intervención del guion.
 */
export function sintesis(rs: Respuesta[], modelo: ModeloSlides): { paso: PasoTrayecto; fallas: number; total: number; intervencion: string } | null {
  const orden: PasoTrayecto[] = ['encuentra', 'explica', 'reconoce', 'justifica'];
  const filas = orden
    .map((paso) => {
      const del = rs.filter((r) => r.paso_del_trayecto === paso && r.es_correcta !== null);
      // Una respuesta correcta sin justificación suficiente también cuenta como falla del paso «justifica».
      const fallas = del.filter((r) => r.es_correcta === false || (paso === 'justifica' && r.justificacion_suficiente === false)).length;
      return { paso, fallas, total: del.length, tasa: del.length ? fallas / del.length : 0 };
    })
    .filter((f) => f.fallas > 0);
  if (!filas.length) return null;
  filas.sort((a, b) => b.tasa - a.tasa || b.fallas - a.fallas || orden.indexOf(a.paso) - orden.indexOf(b.paso));
  const top = filas[0];
  return { paso: top.paso, fallas: top.fallas, total: top.total, intervencion: modelo.intervenciones[top.paso].texto };
}

const CAMPOS: Array<keyof Respuesta> = [
  'id_sesion',
  'alias',
  'origen',
  'id_reactivo',
  'opcion_elegida',
  'respuesta_correcta',
  'es_correcta',
  'marcadores_de_justificacion',
  'paso_del_trayecto',
  'nivel_de_lectura',
  'proceso_pisa',
  'falla_diagnosticada',
  'timestamp',
  'tiempo_de_respuesta_s',
];

export function aCsv(rs: Respuesta[]): string {
  const celda = (v: unknown) => {
    const s = Array.isArray(v) ? v.join('; ') : v === null || v === undefined ? '' : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  return [CAMPOS.join(','), ...rs.map((r) => CAMPOS.map((c) => celda(r[c])).join(','))].join('\n') + '\n';
}
