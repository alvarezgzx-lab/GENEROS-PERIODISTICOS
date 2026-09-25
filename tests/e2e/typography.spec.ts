/** Prueba 4 · Tipografía: contenido ≥ 36 px en el lienzo y solo dos familias. */
import { expect, test } from '@playwright/test';
import { ir, TOTAL } from './helpers';

test('ningún texto de contenido por debajo de 36 px', async ({ page }) => {
  for (let n = 1; n <= TOTAL; n++) {
    await ir(page, n);
    const pequenos = await page.evaluate(() => {
      const fuera: string[] = [];
      const revisar = (el: Element) => {
        const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
        let t: Node | null;
        while ((t = walker.nextNode())) {
          if (!t.textContent?.trim()) continue;
          const padre = t.parentElement!;
          const px = parseFloat(getComputedStyle(padre).fontSize);
          if (px < 36) fuera.push(`${padre.tagName} ${px}px «${t.textContent.trim().slice(0, 30)}»`);
        }
      };
      document
        .querySelectorAll(
          '[data-contenido], [data-contenido-fragmento], [data-contenido-compuesto], svg.apoyo, .opcion, .ficha, .tabla',
        )
        .forEach(revisar);
      return fuera;
    });
    expect.soft(pequenos, `pantalla ${n}`).toEqual([]);
  }
});

test('solo se cargan Montserrat e Inter', async ({ page }) => {
  await ir(page, 1);
  await page.evaluate(() => document.fonts.ready);
  const familias = await page.evaluate(() => {
    const cargadas = new Set<string>();
    document.fonts.forEach((f) => {
      if (f.status === 'loaded') cargadas.add(f.family.replace(/["']/g, ''));
    });
    const usadas = new Set<string>();
    document
      .querySelectorAll('body *')
      .forEach((el) => usadas.add(getComputedStyle(el).fontFamily.split(',')[0].replace(/["']/g, '').trim()));
    return { cargadas: [...cargadas], usadas: [...usadas] };
  });
  for (const f of familias.cargadas) expect(['Montserrat', 'Inter']).toContain(f);
  for (const f of familias.usadas) expect(['Montserrat', 'Inter']).toContain(f);
});

test('las fuentes se sirven desde el propio sitio', async ({ page }) => {
  const externas: string[] = [];
  page.on('request', (r) => {
    const u = new URL(r.url());
    if (u.hostname !== 'localhost') externas.push(r.url());
  });
  for (const n of [1, 21, 53, 57]) await ir(page, n);
  expect(externas).toEqual([]);
});
