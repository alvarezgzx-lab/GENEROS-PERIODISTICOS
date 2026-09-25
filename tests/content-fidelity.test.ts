/** Prueba 2 · Fidelidad: todo texto de contenido aparece literalmente en las copias extraídas. */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import type { Bloque, ModeloSlides } from '../src/content/types';

const raiz = path.resolve(__dirname, '..');
const leer = (f: string) => readFileSync(path.join(raiz, f), 'utf8');
const modelo = JSON.parse(leer('src/content/slides.json')) as ModeloSlides;

/** Normaliza espacios, comillas, saltos de línea y marcas de énfasis. */
export const normalizar = (s: string) =>
  s
    .normalize('NFC')
    .replace(/\*\*|\*/g, '')
    .replace(/[“”«»]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/\s+/g, ' ')
    .trim();

const contenido = normalizar(leer('content/extracted/contenido.txt'));
const guion = normalizar(leer('content/extracted/guion-docente.txt'));

function textosDe(m: ModeloSlides): Array<{ texto: string; donde: string; fuente: 'contenido' | 'guion' }> {
  const salida: Array<{ texto: string; donde: string; fuente: 'contenido' | 'guion' }> = [];
  const agregar = (b: Bloque | undefined, donde: string) =>
    b && salida.push({ texto: b.texto, donde, fuente: 'contenido' });
  const lit = (t: string, donde: string) => t && salida.push({ texto: t, donde, fuente: 'contenido' });
  for (const p of m.pantallas) {
    const d = `pantalla ${p.id}`;
    agregar(p.titulo ?? undefined, `${d} · título`);
    p.bloques.forEach((b, i) => agregar(b, `${d} · bloque ${i}`));
    const it = p.interaccion;
    if (!it) continue;
    if (it.tipo === 'seleccion') {
      agregar(it.enunciado, `${d} · enunciado`);
      it.opciones.forEach((o) => lit(o.texto, `${d} · opción ${o.clave}`));
      if (it.marcadores) {
        agregar(it.marcadores.titulo, `${d} · marcadores`);
        agregar(it.marcadores.fragmento, `${d} · fragmento`);
        it.marcadores.ranuras.forEach((r, i) => agregar(r, `${d} · ranura ${i}`));
        it.marcadores.opciones.forEach((o) => lit(o, `${d} · expresión`));
      }
      for (const f of Object.values(it.fallas)) {
        if (f.intervencion) salida.push({ texto: f.intervencion, donde: `${d} · intervención`, fuente: 'guion' });
      }
    } else {
      agregar(it.bancoTitulo, `${d} · banco`);
      it.banco.forEach((b) => lit(b, `${d} · ficha`));
      it.parrafos.flat().forEach((h, i) => {
        lit(h.antes, `${d} · hueco ${i} antes`);
        lit(h.despues, `${d} · hueco ${i} después`);
      });
    }
  }
  m.glosario.forEach((g) => agregar(g.definicion, `glosario · ${g.termino}`));
  Object.values(m.intervenciones).forEach((v) =>
    salida.push({ texto: v.texto, donde: 'intervenciones', fuente: 'guion' }),
  );
  return salida;
}

describe('fidelidad del contenido', () => {
  const textos = textosDe(modelo);

  it('hay textos que verificar', () => {
    expect(textos.length).toBeGreaterThan(300);
  });

  it.each(textos.map((t) => [t.donde, t] as const))('%s aparece literalmente en las copias extraídas', (_d, t) => {
    const fuente = t.fuente === 'contenido' ? contenido : guion;
    expect(fuente.includes(normalizar(t.texto)), `«${t.texto}»`).toBe(true);
  });

  it('cada bloque declara archivo y sección de origen', () => {
    for (const p of modelo.pantallas) {
      for (const b of p.bloques) expect(b.fuente).toMatch(/^contenido\.txt § Diapositiva \d+$/);
    }
  });

  it('las notas del presentador provienen del guion', () => {
    for (const p of modelo.pantallas.filter((x) => x.diapositiva)) {
      const primera = normalizar(p.notas.split('\n')[0]);
      expect(guion.includes(primera)).toBe(true);
    }
  });

  it('las duraciones suman 20 minutos', () => {
    expect(modelo.pantallas.reduce((s, p) => s + p.duracion_s, 0)).toBe(1200);
  });

  it('cada pantalla de contenido tiene un apoyo visual', () => {
    for (const p of modelo.pantallas.filter((x) => x.tipo === 'contenido')) {
      expect(p.visual, `pantalla ${p.id}`).not.toBeNull();
    }
  });

  it('hay una pantalla de QR antes del cierre y un dashboard al final', () => {
    const qr = modelo.pantallas.findIndex((p) => p.tipo === 'qr');
    const cierre = modelo.pantallas.findIndex((p) => p.diapositiva === 20);
    expect(qr).toBeGreaterThan(-1);
    expect(qr).toBeLessThan(cierre);
    expect(modelo.pantallas.at(-1)!.tipo).toBe('dashboard');
  });

  it('las pantallas siguen el orden cronológico del guion', () => {
    const orden = modelo.pantallas.map((p) => p.diapositiva).filter((d): d is number => d !== null);
    expect([...orden].sort((a, b) => a - b)).toEqual(orden);
    expect(new Set(orden).size).toBe(20);
  });
});
