/** Panel del QR proporcionado (sin regenerar ni alterar), con zona de silencio y enlace de respaldo. */
import { ScanLine } from 'lucide-react';
import qrUrl from '../../content/qr-url.json';
import qrSvg from '../assets/qr-ficha.svg';
import { L } from '../ui/labels';

/** true si el SVG tiene módulos claros sobre fondo oscuro. El QR entregado es oscuro sobre blanco. */
const INVERTIDO = false;

export function QrPanel() {
  return (
    <div className="qr-contenido">
      <div className={`panel-qr${INVERTIDO ? ' invertido' : ''}`} data-qr-panel>
        <img src={qrSvg} alt={L.qr.alt} width={600} height={600} />
      </div>
      <div className="qr-texto">
        <h1 className="titulo">{L.qr.titulo}</h1>
        <p className="b" style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
          <ScanLine size={72} color="var(--color-2)" aria-hidden="true" />
          {L.qr.instruccion}
        </p>
        <p className="b">
          {L.qr.respaldo}:
          <br />
          <a className="qr-url" href={qrUrl.url} target="_blank" rel="noopener noreferrer" data-qr-url>
            {qrUrl.url}
          </a>
        </p>
      </div>
    </div>
  );
}
