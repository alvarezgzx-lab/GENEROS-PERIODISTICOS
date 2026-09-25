/** App de presentación: lienzo 1920×1080 escalado, navegación por hash y teclado. */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Brand } from './components/Brand';
import { EscalaContext } from './components/escala';
import { Glossary } from './components/Glossary';
import { Notes } from './components/Notes';
import { ProgressBar } from './components/ProgressBar';
import { QrPanel } from './components/QrPanel';
import { Slide } from './components/Slide';
import slidesJson from './content/slides.json';
import type { ModeloSlides } from './content/types';
import { Dashboard } from './dashboard/Dashboard';
import { L } from './ui/labels';

const modelo = slidesJson as unknown as ModeloSlides;
const TOTAL = modelo.pantallas.length;

function leerHash(): number {
  const m = window.location.hash.match(/^#\/(\d+)/);
  const n = m ? Number(m[1]) : 1;
  return Math.min(Math.max(n, 1), TOTAL) - 1;
}

function useEscalaVentana() {
  const [v, setV] = useState({ s: 1, x: 0, y: 0 });
  useLayoutEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const s = Math.min(w / 1920, h / 1080);
      setV({ s, x: (w - 1920 * s) / 2, y: (h - 1080 * s) / 2 });
    };
    calc();
    window.addEventListener('resize', calc);
    return () => window.removeEventListener('resize', calc);
  }, []);
  return v;
}

const TECLAS_NAV = new Set(['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown', ' ', 'PageDown', 'PageUp', 'Home', 'End']);

export default function App() {
  const [indice, setIndice] = useState(leerHash);
  const [notas, setNotas] = useState(false);
  const [glosario, setGlosario] = useState(false);
  const escala = useEscalaVentana();
  const lienzo = useRef<HTMLDivElement>(null);
  const p = modelo.pantallas[indice];

  const ir = useCallback((n: number) => {
    const i = Math.min(Math.max(n, 0), TOTAL - 1);
    window.location.hash = `#/${i + 1}`;
  }, []);

  useEffect(() => {
    const alCambiar = () => {
      setIndice(leerHash());
      setGlosario(false);
    };
    window.addEventListener('hashchange', alCambiar);
    if (!/^#\/\d+/.test(window.location.hash)) window.history.replaceState(null, '', `#/${indice + 1}`);
    return () => window.removeEventListener('hashchange', alCambiar);
  }, [indice]);

  useEffect(() => {
    document.title = `${p.titulo ? p.titulo.texto.replace(/\*/g, '') : p.segmento} · ${L.app.titulo}`;
  }, [p]);

  useEffect(() => {
    const alTeclear = (e: KeyboardEvent) => {
      if (e.altKey || e.ctrlKey || e.metaKey) return;
      const objetivo = e.target as HTMLElement | null;
      const enInteractivo = !!objetivo?.closest?.('[data-interactivo], [data-notas]');
      const esCampo = !!objetivo?.closest?.('input, textarea, select');
      if (e.key === 'Escape') {
        // Escape devuelve el control a la navegación.
        if (enInteractivo || esCampo) {
          (document.activeElement as HTMLElement | null)?.blur();
          lienzo.current?.focus();
        }
        return;
      }
      if (enInteractivo || esCampo) return;
      const esBoton = !!objetivo?.closest?.('button, a');
      if (esBoton && (e.key === ' ' || e.key === 'Enter')) return;
      if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        try {
          if (document.fullscreenElement) void document.exitFullscreen();
          else void document.documentElement.requestFullscreen();
        } catch {
          /* pantalla completa no disponible */
        }
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        setNotas((v) => !v);
        return;
      }
      if (!TECLAS_NAV.has(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown' || e.key === 'ArrowDown') ir(indice + 1);
      else if (e.key === 'ArrowLeft' || e.key === 'PageUp' || e.key === 'ArrowUp') ir(indice - 1);
      else if (e.key === 'Home') ir(0);
      else if (e.key === 'End') ir(TOTAL - 1);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [indice, ir]);

  const duracionSegmento = useMemo(
    () => modelo.pantallas.filter((x) => x.segmento === p.segmento).reduce((s, x) => s + x.duracion_s, 0),
    [p.segmento],
  );
  const entradasGlosario = modelo.glosario.filter((g) => p.glosario.includes(g.termino));

  let contenido;
  if (p.tipo === 'qr') {
    contenido = (
      <section className="pantalla pantalla-qr" data-pantalla={p.id}>
        <QrPanel />
      </section>
    );
  } else if (p.tipo === 'dashboard') {
    contenido = (
      <section className="pantalla" data-pantalla={p.id}>
        <Dashboard modelo={modelo} />
      </section>
    );
  } else {
    contenido = <Slide p={p} />;
  }

  return (
    <EscalaContext.Provider value={escala.s}>
      <main className="viewport" aria-label={L.app.lienzo}>
        <div
          ref={lienzo}
          className="canvas"
          tabIndex={-1}
          data-canvas
          style={{ transform: `translate(${escala.x}px, ${escala.y}px) scale(${escala.s})` }}
        >
          <div key={p.id} style={{ display: 'contents' }}>
            {contenido}
          </div>
          <Glossary entradas={entradasGlosario} abierto={glosario} onAbrir={() => setGlosario(true)} onCerrar={() => setGlosario(false)} />
          <button className="borde-nav izq" onClick={() => ir(indice - 1)} disabled={indice === 0} aria-label={L.nav.anterior}>
            <ChevronLeft size={64} aria-hidden="true" />
          </button>
          <button className="borde-nav der" onClick={() => ir(indice + 1)} disabled={indice === TOTAL - 1} aria-label={L.nav.siguiente}>
            <ChevronRight size={64} aria-hidden="true" />
          </button>
          <footer className="pie">
            <ProgressBar indice={indice} total={TOTAL} fase={p.fase_lgr} />
            <Brand />
          </footer>
          <p className="sr-only">{L.nav.ayuda}</p>
        </div>
        {notas && <Notes pantalla={p} duracionSegmento={duracionSegmento} onCerrar={() => setNotas(false)} />}
      </main>
    </EscalaContext.Provider>
  );
}
