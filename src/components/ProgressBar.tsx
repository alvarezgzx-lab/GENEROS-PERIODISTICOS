import type { FaseLgr } from '../content/types';
import { L } from '../ui/labels';

interface Props {
  indice: number;
  total: number;
  fase: FaseLgr;
}

/** Barra de progreso discreta: fase de la liberación gradual y número de pantalla. */
export function ProgressBar({ indice, total, fase }: Props) {
  const pct = ((indice + 1) / total) * 100;
  return (
    <div className="progreso" data-ui>
      <span className="fase">{L.fases[fase]}</span>
      <div
        className="pista"
        role="progressbar"
        aria-label={L.nav.pantallaLarga(indice + 1, total)}
        aria-valuemin={1}
        aria-valuemax={total}
        aria-valuenow={indice + 1}
      >
        <div className="avance" style={{ width: `${pct}%` }} />
      </div>
      <span className="numero" aria-hidden="true">
        {L.nav.pantalla(indice + 1, total)}
      </span>
    </div>
  );
}
