/** Prueba 9 · QR: la captura del panel renderizado se decodifica y coincide con content/qr-url.json. */
import { expect, test } from '@playwright/test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import qr from '../../content/qr-url.json' with { type: 'json' };
import { ir, PANTALLAS } from './helpers';

const N = PANTALLAS.find((p) => p.tipo === 'qr')!.id;

test('el QR renderizado en 1920×1080 se decodifica y coincide con la URL guardada', async ({ page }) => {
  await ir(page, N);
  const panel = page.locator('[data-qr-panel]');
  const caja = (await panel.boundingBox())!;
  expect(Math.min(caja.width, caja.height)).toBeGreaterThanOrEqual(560);
  const img = (await page.locator('[data-qr-panel] img').boundingBox())!;
  expect(Math.min(img.width, img.height)).toBeGreaterThanOrEqual(560);
  const png = PNG.sync.read(await panel.screenshot());
  const r = jsQR(new Uint8ClampedArray(png.data), png.width, png.height);
  expect(r?.data).toBe(qr.url);
  await expect(page.locator('[data-qr-url]')).toHaveText(qr.url);
  await expect(page.locator('[data-qr-panel] img')).toHaveAttribute('alt', /QR/);
});

test('la URL del QR pertenece a Google Drive y pasó la verificación de acceso público', () => {
  expect(['drive.google.com', 'docs.google.com']).toContain(new URL(qr.url).hostname);
  expect(qr.acceso_publico_verificado).toBe(true);
});
