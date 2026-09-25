/** Contenido de una pantalla según su tipo (contenido, interactivo, QR o dashboard). */
import type { Pantalla } from '../content/types';
import { Dashboard } from '../dashboard/Dashboard';
import { modelo } from '../modelo';
import { QrPanel } from './QrPanel';
import { Slide } from './Slide';

export function PantallaVista({ p }: { p: Pantalla }) {
  if (p.tipo === 'qr') {
    return (
      <section className="pantalla pantalla-qr" data-pantalla={p.id}>
        <QrPanel />
      </section>
    );
  }
  if (p.tipo === 'dashboard') {
    return (
      <section className="pantalla" data-pantalla={p.id}>
        <Dashboard modelo={modelo} />
      </section>
    );
  }
  return <Slide p={p} />;
}
