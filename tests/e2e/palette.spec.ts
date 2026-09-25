/** Regla 60-30-10: los tres acentos juntos no rebasan el 10 % de la superficie en ninguna pantalla. */
import { expect, test } from '@playwright/test';
import { PNG } from 'pngjs';
import { ir, TOTAL } from './helpers';

const ACENTOS = [
  [0xfa, 0xdb, 0x20],
  [0x86, 0xcc, 0xfd],
  [0xe6, 0x00, 0x0a],
];

test('acentos ≤ 10 % de la superficie', async ({ page }) => {
  const resultados: string[] = [];
  for (let n = 1; n <= TOTAL; n++) {
    await ir(page, n);
    const png = PNG.sync.read(await page.screenshot());
    let acento = 0;
    for (let i = 0; i < png.data.length; i += 4) {
      const [r, g, b] = [png.data[i], png.data[i + 1], png.data[i + 2]];
      if (ACENTOS.some(([ar, ag, ab]) => Math.abs(r - ar) + Math.abs(g - ag) + Math.abs(b - ab) < 60)) acento++;
    }
    const pct = (acento / (png.width * png.height)) * 100;
    resultados.push(`${n}:${pct.toFixed(1)}`);
    expect.soft(pct, `pantalla ${n}`).toBeLessThanOrEqual(10);
  }
  console.log('Acentos por pantalla (%):', resultados.join(' '));
});
