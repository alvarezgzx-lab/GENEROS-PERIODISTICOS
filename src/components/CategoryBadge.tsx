/**
 * Codificación consistente de las categorías del contenido:
 * cada una lleva color, ícono, forma y etiqueta escrita.
 */
import { Megaphone, Network, Newspaper, type LucideIcon } from 'lucide-react';
import type { Categoria } from '../content/types';
import { L } from '../ui/labels';

export const CAT: Record<Categoria, { color: string; Icono: LucideIcon; tinta: string }> = {
  informativo: { color: 'var(--color-2)', Icono: Newspaper, tinta: 'var(--color-1)' },
  interpretativo: { color: 'var(--color-4)', Icono: Network, tinta: 'var(--color-1)' },
  opinion: { color: 'var(--color-5)', Icono: Megaphone, tinta: 'var(--color-1)' },
};

/** Forma SVG de la categoría (círculo, cuadrado o triángulo) con su ícono, centrada en (cx, cy). */
export function FormaCategoria({ cat, cx, cy, r }: { cat: Categoria; cx: number; cy: number; r: number }) {
  const { color, Icono, tinta } = CAT[cat];
  const icono = r * 1.0;
  let forma;
  let dy = 0;
  if (cat === 'informativo') forma = <circle cx={cx} cy={cy} r={r} fill={color} />;
  else if (cat === 'interpretativo')
    forma = <rect x={cx - r * 0.9} y={cy - r * 0.9} width={r * 1.8} height={r * 1.8} fill={color} />;
  else {
    const h = r * 1.9;
    forma = (
      <polygon points={`${cx},${cy - h * 0.62} ${cx + r * 1.1},${cy + h * 0.45} ${cx - r * 1.1},${cy + h * 0.45}`} fill={color} />
    );
    dy = r * 0.18;
  }
  return (
    <g>
      {forma}
      <Icono
        x={cx - icono / 2}
        y={cy - icono / 2 + dy}
        width={icono}
        height={icono}
        color={tinta}
        strokeWidth={2.2}
        aria-hidden="true"
      />
    </g>
  );
}

/** Distintivo en línea (HTML): forma + ícono + etiqueta escrita. */
export function CategoryBadge({ cat, tamano = 64 }: { cat: Categoria; tamano?: number }) {
  return (
    <span className="distintivo">
      <svg width={tamano} height={tamano} viewBox="0 0 100 100" aria-hidden="true">
        <FormaCategoria cat={cat} cx={50} cy={50} r={cat === 'opinion' ? 44 : 48} />
      </svg>
      <span>{L.categorias[cat]}</span>
    </span>
  );
}
