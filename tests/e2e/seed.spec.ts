/** Prueba 10 · Semilla: los datos simulados se etiquetan como «Simulado» y pueden ocultarse. */
import { expect, test } from '@playwright/test';
import seed from '../../src/content/seed.json' with { type: 'json' };
import { ir, PANTALLAS, responder, TOTAL } from './helpers';

test('control de datos simulados etiquetado y filtros por origen', async ({ page }) => {
  const D11 = PANTALLAS.find((p) => p.interaccion?.id_reactivo === 'D11')!.id;
  await ir(page, D11);
  await responder(page, D11, true);
  await ir(page, TOTAL);
  const simulado = page.locator('input[data-toggle-semilla]');
  await expect(simulado).toBeChecked();
  await expect(page.locator('.etiqueta-simulado')).toHaveText('Simulado');
  await expect(page.locator('.grafica').first()).toContainText(`${seed.respuestas.length} simulado`);
  if (seed.respuestas.length === 0) await expect(page.locator('.dash-aviso')).toContainText('Sin datos simulados');

  // Ocultar datos en vivo deja solo los simulados.
  await page.getByLabel(/Datos en vivo/).uncheck();
  await expect(page.locator('.grafica').first()).toContainText('0 en vivo');
  await page.getByLabel(/Datos en vivo/).check();
  await expect(page.locator('.grafica').first()).toContainText('1 en vivo');
  await simulado.uncheck();
  await expect(simulado).not.toBeChecked();
});
