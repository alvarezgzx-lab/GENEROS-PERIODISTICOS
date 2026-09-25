/**
 * Verifica el contraste WCAG 2.2 AA de cada par de tokens de texto/fondo usado en la app.
 * Uso: npx tsx scripts/check-contrast.ts
 */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { ROOT } from './config.ts';

export function leerTokens(): Record<string, string> {
  const css = readFileSync(path.join(ROOT, 'src/theme/tokens.css'), 'utf8');
  const raiz = css.slice(css.indexOf(':root'), css.indexOf('}'));
  return Object.fromEntries(
    [...raiz.matchAll(/--([\w-]+):\s*(#[0-9a-fA-F]{6})/g)].map((m) => [m[1], m[2].toLowerCase()]),
  );
}

const canal = (c: number) => {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
};

export function luminancia(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
  return 0.2126 * canal((n >> 16) & 255) + 0.7152 * canal((n >> 8) & 255) + 0.0722 * canal(n & 255);
}

export function contraste(a: string, b: string): number {
  const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
  return (l1 + 0.05) / (l2 + 0.05);
}

/** Mezcla un color con opacidad sobre un fondo opaco. */
export function mezclar(frente: string, fondo: string, alfa: number): string {
  const f = parseInt(frente.slice(1), 16);
  const b = parseInt(fondo.slice(1), 16);
  const c = (sh: number) => Math.round(((f >> sh) & 255) * alfa + ((b >> sh) & 255) * (1 - alfa));
  return '#' + [16, 8, 0].map((sh) => c(sh).toString(16).padStart(2, '0')).join('');
}

export interface Par {
  texto: string;
  fondo: string;
  minimo: number;
  uso: string;
  alfa?: number;
}

/** Pares realmente usados en la interfaz. */
export const PARES: Par[] = [
  { texto: 'color-5', fondo: 'color-1', minimo: 4.5, uso: 'Texto de cuerpo y títulos' },
  { texto: 'color-4', fondo: 'color-1', minimo: 4.5, uso: 'Palabras clave (negritas)' },
  { texto: 'color-2', fondo: 'color-1', minimo: 4.5, uso: 'Enlaces, pestaña activa, botones' },
  { texto: 'color-1', fondo: 'color-2', minimo: 4.5, uso: 'Botón primario, ficha colocada' },
  { texto: 'color-1', fondo: 'color-4', minimo: 4.5, uso: 'Etiquetas sobre formas amarillas' },
  { texto: 'color-1', fondo: 'color-5', minimo: 4.5, uso: 'Etiquetas sobre formas crema' },
  { texto: 'color-5', fondo: 'superficie-1', minimo: 4.5, uso: 'Glosario, notas, retroalimentación' },
  { texto: 'color-5', fondo: 'superficie-2', minimo: 4.5, uso: 'Destacados, opción marcada' },
  { texto: 'color-4', fondo: 'superficie-2', minimo: 4.5, uso: 'Palabras clave en destacados' },
  { texto: 'color-2', fondo: 'superficie-1', minimo: 4.5, uso: 'Botones en notas' },
  { texto: 'color-3', fondo: 'color-1', minimo: 3, uso: 'Íconos y bordes de alerta (no texto de cuerpo)' },
  { texto: 'color-2', fondo: 'color-1', minimo: 3, uso: 'Indicador de foco (componente no textual)' },
  { texto: 'linea', fondo: 'color-1', minimo: 3, uso: 'Bordes de opciones y huecos (componente no textual)' },
  { texto: 'color-5', fondo: 'color-1', minimo: 4.5, uso: 'Firma editorial al 66 %', alfa: 0.66 },
];

export function verificar(tokens = leerTokens()) {
  return PARES.map((p) => {
    const frente = p.alfa ? mezclar(tokens[p.texto], tokens[p.fondo], p.alfa) : tokens[p.texto];
    const r = contraste(frente, tokens[p.fondo]);
    return { ...p, razon: Math.round(r * 100) / 100, cumple: r >= p.minimo };
  });
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('check-contrast.ts')) {
  const r = verificar();
  for (const x of r)
    console.log(
      `${x.cumple ? '✔' : '✘'} ${x.texto} sobre ${x.fondo}${x.alfa ? ` (α ${x.alfa})` : ''}: ${x.razon}:1 (mín. ${x.minimo}) · ${x.uso}`,
    );
  if (r.some((x) => !x.cumple)) process.exit(1);
}
