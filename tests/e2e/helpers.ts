import type { Page } from '@playwright/test';
import slides from '../../src/content/slides.json' with { type: 'json' };

export const PANTALLAS = slides.pantallas;
export const TOTAL = PANTALLAS.length;
export const INTERACTIVAS = PANTALLAS.filter((p) => p.interaccion);

export async function ir(page: Page, n: number) {
  // Navegación completa (no solo de hash) para partir de un estado limpio de la pantalla.
  await page.goto(`/?p=${n}-${Date.now()}#/${n}`);
  await page.locator(`[data-pantalla="${n}"]`).waitFor();
  await page.evaluate(() => document.fonts.ready);
  // Espera a que termine la transición de entrada de la pantalla.
  await page.waitForFunction(() => document.getAnimations().every((a) => a.playState !== 'running'));
}

/** Devuelve los desbordes del lienzo (en px del lienzo) y si la página permite desplazarse. */
export async function medirDesborde(page: Page) {
  return page.evaluate(() => {
    const canvas = document.querySelector('[data-canvas]') as HTMLElement;
    const pantalla = document.querySelector('.pantalla') as HTMLElement;
    const cr = canvas.getBoundingClientRect();
    const escala = cr.width / 1920;
    const limite = pantalla.getBoundingClientRect().bottom;
    const problemas: string[] = [];
    pantalla.querySelectorAll('*').forEach((el) => {
      const r = el.getBoundingClientRect();
      // Se omiten regiones visualmente ocultas para lectores de pantalla (1 px).
      if (r.width <= 1 || r.height <= 1) return;
      const abajo = (r.bottom - limite) / escala;
      const derecha = (r.right - cr.right) / escala;
      const izquierda = (cr.left - r.left) / escala;
      if (abajo > 1 || derecha > 1 || izquierda > 1) {
        problemas.push(
          `${el.tagName}.${(el as HTMLElement).className?.toString?.() ?? ''} abajo=${abajo.toFixed(0)} der=${derecha.toFixed(0)}`,
        );
      }
    });
    const doc = document.scrollingElement!;
    const scroll = doc.scrollHeight > window.innerHeight + 1 || doc.scrollWidth > window.innerWidth + 1;
    const desplazables = [...document.querySelectorAll('.canvas *')].filter((el) => {
      const s = getComputedStyle(el);
      return (s.overflowY === 'auto' || s.overflowY === 'scroll') && el.scrollHeight > el.clientHeight + 1;
    }).length;
    return { problemas: problemas.slice(0, 5), scroll, desplazables };
  });
}

/** Responde un reactivo de la pantalla actual (correcta o con la primera opción incorrecta). */
export async function responder(page: Page, n: number, correcta = true) {
  const p = PANTALLAS[n - 1];
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const it = p.interaccion as any;
  if (it.tipo === 'seleccion') {
    const clave = correcta
      ? it.correcta[0]
      : it.opciones.find((o: { clave: string }) => !it.correcta.includes(o.clave)).clave;
    await page.locator(`.opcion:has(input[value="${clave}"])`).click();
    if (it.marcadores) {
      for (const e of it.marcadores.validas.slice(0, 2)) await page.locator(`[data-expr="${e}"]`).first().click();
    }
  } else {
    const huecos = it.parrafos.flat();
    for (let i = 0; i < huecos.length; i++) {
      const objetivo = correcta ? huecos[i].correcta : huecos[(i + 1) % huecos.length].correcta;
      await page.locator(`.banco [data-ficha="${objetivo}"]`).click();
      await page.locator(`[data-hueco="${i}"] .hueco-vacio`).click();
    }
  }
  await page.getByRole('button', { name: 'Enviar' }).click();
  await page.locator('[data-feedback]').waitFor();
}
