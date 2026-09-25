/** Prueba 5 · Contraste: cada par de tokens usado cumple WCAG 2.2 AA. */
import { describe, expect, it } from 'vitest';
import { contraste, verificar } from '../scripts/check-contrast';

describe('contraste de tokens', () => {
  it('la fórmula reproduce valores conocidos', () => {
    expect(contraste('#000000', '#ffffff')).toBeCloseTo(21, 1);
  });
  it.each(verificar().map((p) => [`${p.texto} sobre ${p.fondo} (${p.uso})`, p]))('%s', (_n, p) => {
    expect(p.razon).toBeGreaterThanOrEqual(p.minimo);
  });
});
