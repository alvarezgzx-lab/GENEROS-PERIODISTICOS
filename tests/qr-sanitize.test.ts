/** El QR copiado conserva los módulos del original y queda sin scripts ni referencias externas. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { sanitizarSvg } from '../scripts/copy-qr';

const raiz = path.resolve(__dirname, '..');

describe('sanitización del QR', () => {
  it('elimina scripts, eventos y referencias externas y agrega viewBox', () => {
    const sucio =
      '<svg width="10" height="10"><script>alert(1)</script><rect onclick="x()" width="10" height="10"/><image href="https://x.y/z.png"/></svg>';
    const { svg } = sanitizarSvg(sucio);
    expect(svg).not.toMatch(/script|onclick|https:/);
    expect(svg).toMatch(/viewBox="0 0 10 10"/);
  });

  it('la copia en src/assets conserva los módulos, proporciones y colores', () => {
    const original = readFileSync(path.join(raiz, 'clase muestra/QR practica.svg'), 'utf8');
    const copia = readFileSync(path.join(raiz, 'src/assets/qr-ficha.svg'), 'utf8');
    const trazos = (s: string) => s.match(/ d="[^"]+"/g);
    expect(trazos(copia)).toEqual(trazos(original));
    expect(copia).toMatch(/viewBox=/);
    expect(copia).not.toMatch(/<script|\son\w+=/i);
  });
});
