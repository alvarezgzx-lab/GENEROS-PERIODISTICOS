/** Prueba 1 · Integridad de insumos: INSUMOS_DIR sin cambios y manifiesto coincidente. */
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

interface Fuente {
  rol: string;
  ruta_original: string;
  sha256: string;
  copia_de_trabajo: string | null;
  sha256_copia: string | null;
}

const raiz = path.resolve(__dirname, '..');
const manifiesto = JSON.parse(readFileSync(path.join(raiz, 'content/extracted/manifest.json'), 'utf8')) as {
  insumos_dir: string;
  fuentes: Fuente[];
};
const sha = (b: Buffer | string) => createHash('sha256').update(b).digest('hex');

describe('integridad de insumos', () => {
  it('git status limpio en INSUMOS_DIR', () => {
    const salida = execFileSync('git', ['status', '--porcelain', '--', manifiesto.insumos_dir], {
      cwd: raiz,
      encoding: 'utf8',
    });
    expect(salida.trim()).toBe('');
  });

  it('asigna los tres roles', () => {
    expect(manifiesto.fuentes.map((f) => f.rol).sort()).toEqual(['contenido', 'guion', 'qr']);
  });

  it.each(manifiesto.fuentes.map((f) => ({ ruta: f.ruta_original, f })))(
    '$ruta coincide con el manifiesto',
    ({ f }) => {
      expect(sha(readFileSync(path.join(raiz, f.ruta_original)))).toBe(f.sha256);
      if (f.copia_de_trabajo) {
        expect(sha(readFileSync(path.join(raiz, f.copia_de_trabajo), 'utf8'))).toBe(f.sha256_copia);
      }
    },
  );
});
