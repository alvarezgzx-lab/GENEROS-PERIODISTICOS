/**
 * Copia el QR de INSUMOS_DIR a src/assets/qr-ficha.svg y lo sanitiza.
 * No altera módulos, proporciones ni colores: solo elimina scripts, manejadores
 * de eventos y referencias externas, y garantiza un viewBox para escalar sin pérdida.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { MANIFEST_PATH, QR_ASSET_PATH, ROOT } from './config.ts';
import type { Manifiesto } from './extract-content.ts';

export function sanitizarSvg(svg: string): { svg: string; cambios: string[] } {
  const cambios: string[] = [];
  let s = svg;
  const quitar = (re: RegExp, desc: string) => {
    const n = (s.match(re) || []).length;
    if (n) {
      s = s.replace(re, '');
      cambios.push(`${desc} (${n})`);
    }
  };
  quitar(/<script[\s\S]*?<\/script\s*>/gi, 'Elementos <script> eliminados');
  quitar(/<script[^>]*\/>/gi, 'Elementos <script/> eliminados');
  quitar(/<foreignObject[\s\S]*?<\/foreignObject\s*>/gi, 'Elementos <foreignObject> eliminados');
  quitar(/\s+on[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi, 'Manejadores de eventos eliminados');
  quitar(/\s+(?:xlink:)?href\s*=\s*("(?!#)[^"]*"|'(?!#)[^']*')/gi, 'Referencias externas (href) eliminadas');
  quitar(/@import[^;]*;/gi, 'Reglas @import eliminadas');
  quitar(/url\((?!\s*['"]?#)[^)]*\)/gi, 'Referencias url() externas eliminadas');
  if (!/viewBox\s*=/.test(s)) {
    const w = s.match(/<svg[^>]*\swidth="([\d.]+)/)?.[1];
    const h = s.match(/<svg[^>]*\sheight="([\d.]+)/)?.[1];
    if (!w || !h) throw new Error('El SVG no tiene viewBox ni dimensiones para calcularlo.');
    s = s.replace(/<svg/, `<svg viewBox="0 0 ${w} ${h}"`);
    cambios.push('viewBox agregado');
  }
  if (!cambios.length) cambios.push('Sin cambios: el SVG no contenía scripts, eventos ni referencias externas; ya tenía viewBox.');
  return { svg: s, cambios };
}

function main() {
  const manifiesto = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifiesto;
  const qr = manifiesto.fuentes.find((f) => f.rol === 'qr');
  if (!qr) throw new Error('CONDICIÓN DE PARADA: el manifiesto no tiene QR.');
  const original = readFileSync(path.join(ROOT, qr.ruta_original), 'utf8');
  const { svg, cambios } = sanitizarSvg(original);
  mkdirSync(path.dirname(QR_ASSET_PATH), { recursive: true });
  writeFileSync(QR_ASSET_PATH, svg);
  console.log(`QR copiado a ${path.relative(ROOT, QR_ASSET_PATH)}:`);
  for (const c of cambios) console.log(`  - ${c}`);
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('copy-qr.ts')) main();
