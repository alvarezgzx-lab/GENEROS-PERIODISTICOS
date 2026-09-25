/**
 * Registro de respuestas: estado en memoria con respaldo en localStorage.
 * Todas las lecturas y escrituras de almacenamiento van en try/catch; la app
 * funciona aunque el almacenamiento falle.
 */
import { useSyncExternalStore } from 'react';
import seed from '../content/seed.json';
import type { PasoTrayecto } from '../content/types';

export type Origen = 'en_vivo' | 'semilla';

export interface Respuesta {
  id_sesion: string;
  alias: string;
  origen: Origen;
  id_reactivo: string;
  opcion_elegida: string;
  respuesta_correcta: string | null;
  es_correcta: boolean | null;
  marcadores_de_justificacion: string[];
  /** true/false si el reactivo pide justificación; null si no aplica. */
  justificacion_suficiente: boolean | null;
  paso_del_trayecto: PasoTrayecto;
  nivel_de_lectura: string | null;
  proceso_pisa: string | null;
  falla_diagnosticada: string | null;
  /** Categoría elegida y correcta (para la matriz de confusión), si aplica. */
  categoria_elegida: string | null;
  categoria_correcta: string | null;
  timestamp: string;
  tiempo_de_respuesta_s: number;
}

const CLAVE = 'learning-lab:clase-muestra:respuestas:v1';
const CLAVE_SESION = 'learning-lab:clase-muestra:sesion:v1';

function leer<T>(clave: string, defecto: T): T {
  try {
    const v = window.localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : defecto;
  } catch {
    return defecto;
  }
}

function escribir(clave: string, valor: unknown): boolean {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
    return true;
  } catch {
    return false;
  }
}

function nuevoId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `s-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
  }
}

const semilla = (seed.respuestas as unknown as Respuesta[]).map((r) => ({ ...r, origen: 'semilla' as const }));

let idSesion: string = leer<string | null>(CLAVE_SESION, null) ?? nuevoId();
escribir(CLAVE_SESION, idSesion);
let enVivo: Respuesta[] = leer<Respuesta[]>(CLAVE, []).filter((r) => r && r.origen === 'en_vivo');
let almacenamientoOk = true;
let instantanea = { enVivo, semilla, almacenamientoOk };
const oyentes = new Set<() => void>();

function emitir() {
  instantanea = { enVivo, semilla, almacenamientoOk };
  oyentes.forEach((f) => f());
}

export const store = {
  sesion: () => idSesion,
  suscribir(f: () => void) {
    oyentes.add(f);
    return () => oyentes.delete(f);
  },
  obtener: () => instantanea,
  registrar(r: Omit<Respuesta, 'id_sesion' | 'origen' | 'timestamp' | 'alias'> & { alias?: string }): Respuesta {
    const n = enVivo.filter((x) => x.id_reactivo === r.id_reactivo).length + 1;
    const completa: Respuesta = {
      ...r,
      alias: r.alias ?? `P${n}`,
      id_sesion: idSesion,
      origen: 'en_vivo',
      timestamp: new Date().toISOString(),
    };
    enVivo = [...enVivo, completa];
    almacenamientoOk = escribir(CLAVE, enVivo);
    emitir();
    return completa;
  },
  reiniciar() {
    enVivo = [];
    idSesion = nuevoId();
    try {
      window.localStorage.removeItem(CLAVE);
    } catch {
      /* el almacenamiento puede no estar disponible */
    }
    escribir(CLAVE_SESION, idSesion);
    emitir();
  },
};

export function useRespuestas() {
  return useSyncExternalStore(store.suscribir, store.obtener, store.obtener);
}
