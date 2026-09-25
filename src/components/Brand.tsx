import { L } from '../ui/labels';

/** Firma editorial discreta (24–28 px, opacidad 66 %): única excepción documentada al tamaño mínimo. */
export function Brand() {
  return (
    <p className="marca" data-marca>
      {L.app.marca}
    </p>
  );
}
