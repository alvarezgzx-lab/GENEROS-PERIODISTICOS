/** Métricas del dashboard, incluida la separación de datos simulados (prueba 10). */
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  aCsv,
  aciertoPorReactivo,
  calidadJustificacion,
  filtrar,
  matrizConfusion,
  participacion,
  reactivos,
  sintesis,
  tiempoMedio,
} from '../src/dashboard/metrics';
import type { ModeloSlides } from '../src/content/types';
import type { Respuesta } from '../src/state/store';

const modelo = JSON.parse(readFileSync(path.resolve(__dirname, '../src/content/slides.json'), 'utf8')) as ModeloSlides;
const its = reactivos(modelo);

const r = (o: Partial<Respuesta>): Respuesta => ({
  id_sesion: 's',
  alias: 'P1',
  origen: 'en_vivo',
  id_reactivo: 'D17',
  opcion_elegida: 'C',
  respuesta_correcta: 'C',
  es_correcta: true,
  marcadores_de_justificacion: [],
  justificacion_suficiente: null,
  paso_del_trayecto: 'reconoce',
  nivel_de_lectura: null,
  proceso_pisa: null,
  falla_diagnosticada: null,
  categoria_elegida: 'opinion',
  categoria_correcta: 'opinion',
  timestamp: '2026-01-01T00:00:00Z',
  tiempo_de_respuesta_s: 10,
  ...o,
});

const datos: Respuesta[] = [
  r({}),
  r({
    opcion_elegida: 'A',
    es_correcta: false,
    categoria_elegida: 'informativo',
    falla_diagnosticada: 'Clasifica por una cifra',
    tiempo_de_respuesta_s: 20,
  }),
  r({ origen: 'semilla', opcion_elegida: 'A', es_correcta: false, categoria_elegida: 'informativo' }),
  r({ id_reactivo: 'D19', paso_del_trayecto: 'justifica', justificacion_suficiente: false }),
  r({ id_reactivo: 'D19', paso_del_trayecto: 'justifica', justificacion_suficiente: true }),
];

describe('métricas', () => {
  it('separa la participación por origen', () => {
    const d17 = participacion(datos, its).find((p) => p.id === 'D17')!;
    expect(d17).toMatchObject({ en_vivo: 2, semilla: 1, total: 3 });
  });

  it('oculta datos simulados o en vivo por separado', () => {
    expect(filtrar(datos, { semilla: false, enVivo: true }).every((x) => x.origen === 'en_vivo')).toBe(true);
    expect(filtrar(datos, { semilla: true, enVivo: false }).every((x) => x.origen === 'semilla')).toBe(true);
    expect(filtrar(datos, { semilla: false, enVivo: false })).toHaveLength(0);
  });

  it('calcula el acierto por reactivo', () => {
    const d17 = aciertoPorReactivo(filtrar(datos, { semilla: false, enVivo: true }), its).find(
      (t) => t.clave === 'D17',
    )!;
    expect(d17.pct).toBe(50);
  });

  it('construye la matriz de confusión', () => {
    const m = matrizConfusion(datos);
    expect(m.opinion.opinion).toBe(3);
    expect(m.opinion.informativo).toBe(2);
  });

  it('mide la calidad de la justificación y el tiempo medio', () => {
    expect(calidadJustificacion(datos)).toEqual({ con: 1, sin: 1 });
    expect(tiempoMedio([r({ tiempo_de_respuesta_s: 10 }), r({ tiempo_de_respuesta_s: 20 })])).toBe(15);
  });

  it('la síntesis elige el paso con mayor falla y la intervención del guion', () => {
    // reconoce: 2 fallas de 3 (67 %); justifica: 1 de 2 (50 %).
    const s = sintesis(datos, modelo)!;
    expect(s.paso).toBe('reconoce');
    expect(s.intervencion).toMatch(/Si clasifica por una cifra/);
    const soloJustifica = sintesis(
      datos.filter((x) => x.id_reactivo === 'D19'),
      modelo,
    )!;
    expect(soloJustifica.paso).toBe('justifica');
    expect(soloJustifica.intervencion).toMatch(/Si acierta sin justificar/);
  });

  it('exporta CSV con los campos del registro', () => {
    const csv = aCsv([r({ marcadores_de_justificacion: ['un desastre', 'debe'] })]);
    expect(csv).toContain('un desastre; debe');
    expect(csv.split('\n')[0]).toContain('tiempo_de_respuesta_s');
  });
});
