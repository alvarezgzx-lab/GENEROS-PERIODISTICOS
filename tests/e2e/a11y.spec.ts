/** Prueba 8 · Accesibilidad: axe sin violaciones graves ni críticas. */
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { ir, TOTAL } from './helpers';

test('axe en todas las pantallas', async ({ page }) => {
  for (let n = 1; n <= TOTAL; n++) {
    await ir(page, n);
    const r = await new AxeBuilder({
      page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'],
    }).analyze();
    const graves = r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical');
    expect
      .soft(
        graves.map(
          (v) =>
            `${v.id}: ${v.nodes
              .map((x) => x.target.join(' '))
              .slice(0, 3)
              .join(' | ')}`,
        ),
        `pantalla ${n}`,
      )
      .toEqual([]);
  }
});

test('axe con glosario, notas y retroalimentación visibles', async ({ page }) => {
  await ir(page, 14);
  await page.getByRole('button', { name: 'Glosario' }).click();
  let r = await new AxeBuilder({
    page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'],
  }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  await page.keyboard.press('Escape');
  await page.keyboard.press('n');
  r = await new AxeBuilder({ page: page as unknown as ConstructorParameters<typeof AxeBuilder>[0]['page'] }).analyze();
  expect(r.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

test('foco visible con --color-2 de al menos 3 px', async ({ page }) => {
  await ir(page, 28);
  await page.keyboard.press('Tab');
  const estilo = await page.evaluate(() => {
    const el = document.activeElement as HTMLElement;
    const s = getComputedStyle(el);
    return { ancho: parseFloat(s.outlineWidth), color: s.outlineColor, estilo: s.outlineStyle };
  });
  expect(estilo.estilo).not.toBe('none');
  expect(estilo.ancho).toBeGreaterThanOrEqual(3);
  expect(estilo.color).toBe('rgb(134, 204, 253)');
});

test('respeta prefers-reduced-motion', async ({ browser }) => {
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 1920, height: 1080 } });
  const page = await ctx.newPage();
  await page.goto('/#/2');
  const anim = await page.locator('.pantalla').evaluate((el) => getComputedStyle(el).animationName);
  expect(anim).toBe('none');
  await ctx.close();
});
