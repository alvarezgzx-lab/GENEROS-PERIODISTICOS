/** Modelo de pantallas y utilidades de navegación por hash compartidas por ambas ventanas. */
import slidesJson from './content/slides.json';
import type { ModeloSlides } from './content/types';

export const modelo = slidesJson as unknown as ModeloSlides;
export const TOTAL = modelo.pantallas.length;

/** Índice (base 0) de la pantalla indicada en el hash (#/n). */
export function leerHash(): number {
  const m = window.location.hash.match(/^#\/(\d+)/);
  const n = m ? Number(m[1]) : 1;
  return Math.min(Math.max(n, 1), TOTAL) - 1;
}

export function irA(indice: number) {
  const i = Math.min(Math.max(indice, 0), TOTAL - 1);
  if (leerHash() !== i || !/^#\/\d+/.test(window.location.hash)) window.location.hash = `#/${i + 1}`;
}

export const TECLAS_NAV = new Set([
  'ArrowRight',
  'ArrowLeft',
  'ArrowUp',
  'ArrowDown',
  ' ',
  'PageDown',
  'PageUp',
  'Home',
  'End',
]);

/** Traduce una tecla de navegación a la pantalla de destino, o null si no es de navegación. */
export function destinoPorTecla(tecla: string, actual: number): number | null {
  if (tecla === 'ArrowRight' || tecla === ' ' || tecla === 'PageDown' || tecla === 'ArrowDown') return actual + 1;
  if (tecla === 'ArrowLeft' || tecla === 'PageUp' || tecla === 'ArrowUp') return actual - 1;
  if (tecla === 'Home') return 0;
  if (tecla === 'End') return TOTAL - 1;
  return null;
}

/** Duración prevista del segmento al que pertenece la pantalla. */
export function duracionSegmento(segmento: string): number {
  return modelo.pantallas.filter((x) => x.segmento === segmento).reduce((s, x) => s + x.duracion_s, 0);
}

export const esVentanaPresentador = () => new URLSearchParams(window.location.search).get('modo') === 'presentador';

/** Abre (o enfoca) la ventana del presentador en la pantalla actual. Devuelve false si el navegador la bloqueó. */
export function abrirPresentador(): boolean {
  const url = `${window.location.pathname}?modo=presentador${window.location.hash || '#/1'}`;
  try {
    const v = window.open(url, 'learning-lab-presentador', 'popup,width=1280,height=800');
    if (!v) return false;
    v.focus();
    return true;
  } catch {
    return false;
  }
}
