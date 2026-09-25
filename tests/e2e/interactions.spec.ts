/** Prueba 7 · Interacciones: arrastrar y soltar con puntero y teclado; enviar registra y el dashboard lo refleja. */
import { expect, test, type Page } from '@playwright/test';
import { ir, PANTALLAS, responder, TOTAL } from './helpers';

const D14A = PANTALLAS.find((p) => p.interaccion?.id_reactivo === 'D14-A')!.id;
const D11 = PANTALLAS.find((p) => p.interaccion?.id_reactivo === 'D11')!.id;
const D18 = PANTALLAS.find((p) => p.interaccion?.id_reactivo === 'D18')!.id;

async function centro(page: Page, selector: string) {
  const b = (await page.locator(selector).first().boundingBox())!;
  return { x: b.x + b.width / 2, y: b.y + b.height / 2 };
}

test('arrastrar y soltar con puntero', async ({ page }) => {
  for (const vista of [
    { width: 1920, height: 1080 },
    { width: 1280, height: 720 },
  ]) {
    await page.setViewportSize(vista);
    await ir(page, D14A);
    const origen = await centro(page, '.banco [data-ficha="De acuerdo con"]');
    const destino = await centro(page, '[data-hueco="0"]');
    await page.mouse.move(origen.x, origen.y);
    await page.mouse.down();
    for (let i = 1; i <= 12; i++) {
      await page.mouse.move(origen.x + ((destino.x - origen.x) * i) / 12, origen.y + ((destino.y - origen.y) * i) / 12);
    }
    await page.mouse.up();
    await expect(page.locator('[data-hueco="0"] [data-ficha="De acuerdo con"]')).toBeVisible();
  }
});

test('arrastrar y soltar con teclado', async ({ page }) => {
  await ir(page, D14A);
  await page.locator('.banco [data-ficha="Asimismo"]').focus();
  // Pausas breves entre teclas, como las de una persona, para que el sensor mida los destinos.
  for (const tecla of ['Space', 'ArrowRight', 'ArrowRight', 'Space']) {
    await page.keyboard.press(tecla);
    await page.waitForTimeout(150);
  }
  await expect(page.locator('[data-hueco="1"] [data-ficha="Asimismo"]')).toBeVisible();
});

test('selección por clic: tocar una expresión y luego un espacio', async ({ page }) => {
  await ir(page, D14A);
  await page.locator('.banco [data-ficha="Por último"]').click();
  await page.locator('[data-hueco="2"] .hueco-vacio').click();
  await expect(page.locator('[data-hueco="2"] [data-ficha="Por último"]')).toBeVisible();
});

test('nada se registra antes de enviar; enviar registra y el dashboard lo refleja', async ({ page }) => {
  await ir(page, D11);
  await page.locator('.opcion:has(input[value="B"])').click();
  await ir(page, TOTAL);
  await expect(page.locator('.grafica').first()).toContainText('0 en vivo');

  await ir(page, D11);
  await responder(page, D11, true);
  await expect(page.locator('[data-feedback="correcto"]')).toContainText('Correcto');
  await page.getByRole('button', { name: 'Registrar otra respuesta' }).click();
  await page.locator('.opcion:has(input[value="B"])').click();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('[data-feedback="incorrecto"]')).toBeVisible();

  await ir(page, D14A);
  await responder(page, D14A, true);

  await ir(page, TOTAL);
  const part = page.locator('.grafica').first();
  await expect(part).toContainText('2 en vivo');
  await expect(part).toContainText('1 en vivo');

  await page.getByRole('tab', { name: 'Acierto' }).click();
  await expect(page.locator('.dash-panel')).toContainText('50 % (1/2)');

  await page.getByRole('tab', { name: 'Distractores' }).click();
  await expect(page.locator('.dash-panel')).toContainText('Clasifica por una cifra');

  await page.getByRole('tab', { name: 'Síntesis' }).click();
  await expect(page.locator('.dash-panel')).toContainText('Reconoce la intención');
  await expect(page.locator('.dash-panel')).toContainText('Si clasifica por una cifra');
});

test('justificación con marcadores: suficiente e insuficiente', async ({ page }) => {
  await ir(page, D18);
  await page.locator('.opcion:has(input[value="B"])').click();
  await page.locator('[data-expr="Por el contrario"]').click();
  await page.locator('[data-expr="sin embargo"]').click();
  await expect(page.locator('.ranura-valor.llena')).toHaveCount(2);
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('[data-feedback]')).toContainText('Justificación suficiente');

  await page.getByRole('button', { name: 'Registrar otra respuesta' }).click();
  await page.locator('.opcion:has(input[value="B"])').click();
  await page.locator('[data-expr="promete inversiones"]').click();
  await page.getByRole('button', { name: 'Enviar' }).click();
  await expect(page.locator('[data-feedback]')).toContainText('Justificación insuficiente');

  await ir(page, TOTAL);
  await page.getByRole('tab', { name: 'Síntesis' }).click();
  const barras = page.locator('.dash-panel .grafica').first();
  await expect(barras).toContainText('Suficiente1');
  await expect(barras).toContainText('Insuficiente1');
});

test('exportación CSV y reinicio con confirmación', async ({ page }) => {
  await ir(page, D11);
  await responder(page, D11, true);
  await ir(page, TOTAL);
  const descarga = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar CSV' }).click();
  const d = await descarga;
  const ruta = await d.path();
  const fs = await import('node:fs');
  const csv = fs.readFileSync(ruta!, 'utf8');
  expect(csv.split('\n')[0]).toBe(
    'id_sesion,alias,origen,id_reactivo,opcion_elegida,respuesta_correcta,es_correcta,marcadores_de_justificacion,paso_del_trayecto,nivel_de_lectura,proceso_pisa,falla_diagnosticada,timestamp,tiempo_de_respuesta_s',
  );
  expect(csv).toContain('en_vivo,D11,C,C,true');

  await page.getByRole('button', { name: 'Reiniciar' }).click();
  await page.getByRole('button', { name: 'Cancelar' }).click();
  await expect(page.locator('.grafica').first()).toContainText('1 en vivo');
  await page.getByRole('button', { name: 'Reiniciar' }).click();
  await page.getByRole('button', { name: 'Sí, borrar' }).click();
  await expect(page.locator('.grafica').first()).not.toContainText('1 en vivo');
});

test('la app funciona si el almacenamiento falla', async ({ page }) => {
  await page.addInitScript(() => {
    const romper = () => {
      throw new Error('bloqueado');
    };
    Object.defineProperty(window, 'localStorage', { get: romper });
  });
  await ir(page, D11);
  await responder(page, D11, true);
  // Sin almacenamiento, el estado vive en memoria: se navega sin recargar.
  await page.evaluate((n) => (location.hash = `#/${n}`), TOTAL);
  await expect(page.locator('.grafica').first()).toContainText('1 en vivo');
});
