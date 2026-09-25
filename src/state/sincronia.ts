/**
 * Sincroniza la pantalla actual entre la ventana proyectada y la del presentador.
 * Usa BroadcastChannel (misma computadora, mismo navegador, sin red) y, si no existe,
 * eventos de localStorage. Nunca sale del dispositivo.
 */
import { useEffect } from 'react';
import { irA } from '../modelo';

const CANAL = 'learning-lab:clase-muestra:sincronia';
const CLAVE = 'learning-lab:clase-muestra:pantalla';

type Mensaje = { tipo: 'pantalla'; indice: number; t: number };

let canal: BroadcastChannel | null = null;
try {
  canal = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel(CANAL) : null;
} catch {
  canal = null;
}

export function publicarPantalla(indice: number) {
  const m: Mensaje = { tipo: 'pantalla', indice, t: Date.now() };
  if (canal) {
    canal.postMessage(m);
    return;
  }
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(m));
  } catch {
    /* sin almacenamiento: no hay sincronización */
  }
}

function escuchar(f: (indice: number) => void): () => void {
  if (canal) {
    const c = canal;
    const h = (e: MessageEvent<Mensaje>) => e.data?.tipo === 'pantalla' && f(e.data.indice);
    c.addEventListener('message', h);
    return () => c.removeEventListener('message', h);
  }
  const h = (e: StorageEvent) => {
    if (e.key !== CLAVE || !e.newValue) return;
    try {
      const m = JSON.parse(e.newValue) as Mensaje;
      if (m.tipo === 'pantalla') f(m.indice);
    } catch {
      /* mensaje inválido */
    }
  };
  window.addEventListener('storage', h);
  return () => window.removeEventListener('storage', h);
}

/** Publica cada cambio de pantalla de esta ventana y sigue los cambios de la otra. */
export function useSincronia(indice: number) {
  useEffect(() => {
    publicarPantalla(indice);
  }, [indice]);
  useEffect(() => escuchar((i) => irA(i)), []);
}
