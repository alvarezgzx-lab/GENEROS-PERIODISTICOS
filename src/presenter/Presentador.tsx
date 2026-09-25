/**
 * Ventana del presentador: guion, cronómetros, pantalla actual y siguiente.
 * Se abre con P (o desde las notas) y avanza sincronizada con la ventana proyectada.
 */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { EscalaContext } from '../components/escala';
import { formato, NotasCuerpo } from '../components/Notes';
import { PantallaVista } from '../components/PantallaVista';
import type { Pantalla } from '../content/types';
import { destinoPorTecla, duracionSegmento, irA, leerHash, modelo, TECLAS_NAV, TOTAL } from '../modelo';
import { useSincronia } from '../state/sincronia';
import { L } from '../ui/labels';

const DURACION_TOTAL = modelo.duracion_total_s;

/** Vista previa no interactiva de una pantalla, escalada al ancho disponible. */
function Miniatura({ p, etiqueta }: { p: Pantalla | null; etiqueta: string }) {
  const caja = useRef<HTMLDivElement>(null);
  const [escala, setEscala] = useState(0.3);
  useLayoutEffect(() => {
    const el = caja.current;
    if (!el) return;
    const calc = () => setEscala(el.clientWidth / 1920);
    calc();
    const ro = new ResizeObserver(calc);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const inerte = useRef<HTMLDivElement>(null);
  useEffect(() => {
    inerte.current?.setAttribute('inert', '');
  }, []);
  return (
    <figure className="miniatura">
      <figcaption>{etiqueta}</figcaption>
      <div ref={caja} className="miniatura-caja">
        {p ? (
          <div
            ref={inerte}
            className="canvas"
            aria-hidden="true"
            style={{ transform: `scale(${escala})`, pointerEvents: 'none' }}
          >
            <EscalaContext.Provider value={escala}>
              <div key={p.id} style={{ display: 'contents' }}>
                <PantallaVista p={p} />
              </div>
            </EscalaContext.Provider>
          </div>
        ) : (
          <p className="miniatura-fin">{L.presentador.fin}</p>
        )}
      </div>
    </figure>
  );
}

function useTiempoSesion() {
  const inicio = useRef(Date.now());
  const [, forzar] = useState(0);
  useEffect(() => {
    const t = window.setInterval(() => forzar((n) => n + 1), 1000);
    return () => window.clearInterval(t);
  }, []);
  return (Date.now() - inicio.current) / 1000;
}

export default function Presentador() {
  const [indice, setIndice] = useState(leerHash);
  const p = modelo.pantallas[indice];
  const siguiente = modelo.pantallas[indice + 1] ?? null;
  const sesion = useTiempoSesion();

  useSincronia(indice);

  useEffect(() => {
    const alCambiar = () => setIndice(leerHash());
    window.addEventListener('hashchange', alCambiar);
    if (!/^#\/\d+/.test(window.location.hash)) window.history.replaceState(null, '', `#/${indice + 1}`);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, [indice]);

  useEffect(() => {
    document.title = L.presentador.documento;
    const alTeclear = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey || !TECLAS_NAV.has(e.key)) return;
      const objetivo = e.target as HTMLElement | null;
      if (objetivo?.closest?.('button, a, input') && (e.key === ' ' || e.key === 'Enter')) return;
      e.preventDefault();
      const destino = destinoPorTecla(e.key, leerHash());
      if (destino !== null) irA(destino);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, []);

  return (
    <div className="presentador" data-presentador>
      <header className="presentador-cabecera">
        <div>
          <h1>{L.presentador.titulo}</h1>
          <p className="presentador-ayuda">{L.presentador.ayuda}</p>
        </div>
        <div className="presentador-estado">
          <span className="presentador-numero" data-presentador-numero>
            {L.nav.pantallaLarga(indice + 1, TOTAL)}
          </span>
          <span>{L.fases[p.fase_lgr]}</span>
          <span className="presentador-sesion">
            {L.presentador.sesion}: <strong>{formato(sesion)}</strong> {L.presentador.planeado(DURACION_TOTAL / 60)}
          </span>
        </div>
      </header>
      <main className="presentador-cuerpo">
        <section className="presentador-vistas" aria-label={L.presentador.actual}>
          <Miniatura p={p} etiqueta={L.presentador.actual} />
          <div className="presentador-nav">
            <button className="btn" onClick={() => irA(indice - 1)} disabled={indice === 0}>
              <ChevronLeft size={24} aria-hidden="true" /> {L.presentador.anterior}
            </button>
            <button className="btn primario" onClick={() => irA(indice + 1)} disabled={indice === TOTAL - 1}>
              {L.presentador.avanzar} <ChevronRight size={24} aria-hidden="true" />
            </button>
          </div>
          <Miniatura p={siguiente} etiqueta={L.presentador.siguiente} />
        </section>
        <aside className="notas presentador-notas" aria-label={L.notas.titulo} data-notas>
          <h2>{L.notas.titulo}</h2>
          <NotasCuerpo key={p.segmento} pantalla={p} duracionSegmento={duracionSegmento(p.segmento)} />
        </aside>
      </main>
    </div>
  );
}
