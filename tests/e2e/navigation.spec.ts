/** Prueba 6 · Navegación por teclado, clic en bordes y hash. */
import { expect, test } from '@playwright/test';
import { ir, TOTAL } from './helpers';

const actual = (page: import('@playwright/test').Page) => page.evaluate(() => Number(location.hash.replace('#/', '')));

test('teclas de navegación', async ({ page }) => {
  await ir(page, 1);
  await page.keyboard.press('ArrowRight');
  expect(await actual(page)).toBe(2);
  await page.keyboard.press('Space');
  expect(await actual(page)).toBe(3);
  await page.keyboard.press('PageDown');
  expect(await actual(page)).toBe(4);
  await page.keyboard.press('ArrowLeft');
  expect(await actual(page)).toBe(3);
  await page.keyboard.press('PageUp');
  expect(await actual(page)).toBe(2);
  await page.keyboard.press('End');
  expect(await actual(page)).toBe(TOTAL);
  await page.keyboard.press('Home');
  expect(await actual(page)).toBe(1);
});

test('la recarga conserva la pantalla', async ({ page }) => {
  await ir(page, 12);
  await page.reload();
  await page.locator('[data-pantalla="12"]').waitFor();
  expect(await actual(page)).toBe(12);
});

test('N abre y cierra las notas del presentador con guion, duración y cronómetro', async ({ page }) => {
  await ir(page, 5);
  await page.keyboard.press('n');
  const notas = page.locator('[data-notas]');
  await expect(notas).toBeVisible();
  await expect(notas).toContainText('Diapositiva 3. Los géneros informativos');
  await expect(notas).toContainText('Duración prevista');
  await expect(notas.locator('.crono')).toHaveText(/\d+:\d{2}/);
  await page.locator('[data-canvas]').focus();
  await page.keyboard.press('n');
  await expect(notas).toBeHidden();
});

test('F solicita pantalla completa', async ({ page }) => {
  await ir(page, 1);
  await page.evaluate(() => {
    (window as unknown as { __fs: number }).__fs = 0;
    document.documentElement.requestFullscreen = async () => {
      (window as unknown as { __fs: number }).__fs++;
    };
  });
  await page.keyboard.press('f');
  expect(await page.evaluate(() => (window as unknown as { __fs: number }).__fs)).toBe(1);
});

test('clic en los bordes laterales navega', async ({ page }) => {
  await ir(page, 10);
  await page.getByRole('button', { name: 'Pantalla siguiente' }).click();
  expect(await actual(page)).toBe(11);
  await page.getByRole('button', { name: 'Pantalla anterior' }).click();
  expect(await actual(page)).toBe(10);
});

test('con el foco en un componente interactivo las flechas no cambian de pantalla; Escape devuelve el control', async ({
  page,
}) => {
  await ir(page, 28); // selección única (D11)
  await page.locator('input[value="A"]').focus();
  await page.keyboard.press('ArrowDown');
  expect(await actual(page)).toBe(28);
  await expect(page.locator('input[value="B"]')).toBeChecked();
  await page.keyboard.press('ArrowRight');
  expect(await actual(page)).toBe(28);
  await page.keyboard.press('Escape');
  await page.keyboard.press('ArrowRight');
  expect(await actual(page)).toBe(29);
});

test('las flechas no navegan con el foco en una ficha de arrastre', async ({ page }) => {
  await ir(page, 35);
  await page.locator('.banco [data-ficha]').first().focus();
  await page.keyboard.press('ArrowRight');
  expect(await actual(page)).toBe(35);
});
