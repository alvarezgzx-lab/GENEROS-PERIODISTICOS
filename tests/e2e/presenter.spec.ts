/** Ventana del presentador: se abre con P, muestra notas y avanza sincronizada con la ventana proyectada. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ir, TOTAL } from './helpers';

const hash = (page: import('@playwright/test').Page) => page.evaluate(() => Number(location.hash.replace('#/', '')));

test('P abre la ventana del presentador y ambas ventanas avanzan juntas', async ({ page, context }) => {
  await ir(page, 5);
  const [presentador] = await Promise.all([context.waitForEvent('page'), page.keyboard.press('p')]);
  await presentador.waitForLoadState();
  await expect(presentador.locator('[data-presentador]')).toBeVisible();
  await expect(presentador.locator('[data-presentador-numero]')).toHaveText('Pantalla 5 de ' + TOTAL);
  await expect(presentador.locator('[data-notas]')).toContainText('Diapositiva 3. Los géneros informativos');

  // El proyector no muestra notas.
  await expect(page.locator('[data-notas]')).toHaveCount(0);

  // Avanzar desde el presentador mueve el proyector.
  await presentador.keyboard.press('ArrowRight');
  await expect.poll(() => hash(page)).toBe(6);
  await presentador.getByRole('button', { name: 'Siguiente' }).click();
  await expect.poll(() => hash(page)).toBe(7);

  // Avanzar desde el proyector mueve el presentador.
  await page.locator('[data-canvas]').focus();
  await page.keyboard.press('ArrowLeft');
  await expect.poll(() => hash(presentador)).toBe(6);
  await expect(presentador.locator('[data-presentador-numero]')).toHaveText('Pantalla 6 de ' + TOTAL);
  await presentador.screenshot({ path: 'test-results/presentador.png' });
});

test('las respuestas registradas en una ventana llegan al dashboard de la otra', async ({ page, context }) => {
  await ir(page, 28);
  const otra = await context.newPage();
  await otra.goto('/#/28');
  await otra.locator('[data-pantalla="28"]').waitFor();
  await page.locator('.opcion:has(input[value="C"])').click();
  await page.getByRole('button', { name: 'Enviar' }).click();
  // Ir al final desde la primera ventana lleva a ambas al dashboard.
  await page.locator('[data-canvas]').focus();
  await page.keyboard.press('End');
  await expect.poll(() => hash(otra)).toBe(TOTAL);
  await expect(otra.locator('.grafica').first()).toContainText('1 en vivo');
});

test('ventana del presentador sin violaciones graves de accesibilidad', async ({ page }) => {
  await page.goto('/?modo=presentador#/28');
  await page.locator('[data-presentador]').waitFor();
  const r = await new AxeBuilder({
    page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'],
  }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});
