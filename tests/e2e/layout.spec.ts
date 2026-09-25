/** Prueba 3 · Sin scroll: ninguna pantalla desborda ni permite desplazarse. */
import { expect, test } from '@playwright/test';
import { INTERACTIVAS, ir, medirDesborde, responder, TOTAL } from './helpers';

const VISTAS = [
  { width: 1280, height: 720 },
  { width: 1366, height: 768 },
  { width: 1920, height: 1080 },
  { width: 1024, height: 768 },
];

for (const vista of VISTAS) {
  test(`sin desborde ni scroll en ${vista.width}×${vista.height}`, async ({ page }) => {
    await page.setViewportSize(vista);
    for (let n = 1; n <= TOTAL; n++) {
      await ir(page, n);
      const r = await medirDesborde(page);
      expect.soft(r.problemas, `pantalla ${n}`).toEqual([]);
      expect.soft(r.scroll, `scroll en pantalla ${n}`).toBe(false);
      expect.soft(r.desplazables, `contenedores desplazables en pantalla ${n}`).toBe(0);
    }
  });
}

test('sin desborde tras enviar respuestas (retroalimentación visible)', async ({ page }) => {
  for (const p of INTERACTIVAS) {
    for (const correcta of [true, false]) {
      await ir(page, p.id);
      await responder(page, p.id, correcta);
      const r = await medirDesborde(page);
      expect.soft(r.problemas, `pantalla ${p.id} (${correcta ? 'correcta' : 'incorrecta'})`).toEqual([]);
    }
  }
});

test('el glosario abierto cabe en el lienzo', async ({ page }) => {
  for (const n of [3, 14, 17, 18]) {
    await ir(page, n);
    await page.getByRole('button', { name: 'Glosario' }).click();
    const r = await page.evaluate(() => {
      const d = document.querySelector('.dialogo-glosario')!;
      return d.scrollHeight <= d.clientHeight + 1;
    });
    expect.soft(r, `glosario en pantalla ${n}`).toBe(true);
  }
});

test('las pestañas del dashboard con datos caben en el lienzo', async ({ page }) => {
  for (const p of INTERACTIVAS) {
    await ir(page, p.id);
    await responder(page, p.id, false);
    await page.getByRole('button', { name: 'Registrar otra respuesta' }).click();
    await responder(page, p.id, true);
  }
  await ir(page, TOTAL);
  for (const tab of ['Participación', 'Acierto', 'Confusión', 'Distractores', 'Síntesis']) {
    await page.getByRole('tab', { name: tab }).click();
    const r = await medirDesborde(page);
    expect.soft(r.problemas, `pestaña ${tab}`).toEqual([]);
    await page.screenshot({ path: `test-results/dashboard-${tab}.png` });
  }
});
