/** Ventana proyectada: lienzo 1920×1080 escalado, navegación por hash y teclado. */
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Brand } from './components/Brand';
import { EscalaContext } from './components/escala';
import { Glossary } from './components/Glossary';
import { Notes } from './components/Notes';
import { PantallaVista } from './components/PantallaVista';
import { ProgressBar } from './components/ProgressBar';
import {
  abrirPresentador,
  destinoPorTecla,
  duracionSegmento,
  irA,
  leerHash,
  modelo,
  TECLAS_NAV,
  TOTAL,
} from './modelo';
import { useSincronia } from './state/sincronia';
import { L } from './ui/labels';

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

export default function App() {
  const [indice, setIndice] = useState(leerHash);
  const [notas, setNotas] = useState(false);
  const [glosario, setGlosario] = useState(false);
  const [aviso, setAviso] = useState('');
  const escala = useEscalaVentana();
  const lienzo = useRef<HTMLDivElement>(null);
  const p = modelo.pantallas[indice];

  useSincronia(indice);

  const presentador = useCallback(() => {
    if (!abrirPresentador()) {
      setAviso(L.presentador.bloqueada);
      setNotas(true);
    } else setAviso('');
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
      if (e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        presentador();
        return;
      }
      if (!TECLAS_NAV.has(e.key)) return;
      e.preventDefault();
      // Se lee la posición del hash en el momento de la tecla para no perder pulsaciones rápidas.
      const destino = destinoPorTecla(e.key, leerHash());
      if (destino !== null) irA(destino);
    };
    window.addEventListener('keydown', alTeclear);
    return () => window.removeEventListener('keydown', alTeclear);
  }, [presentador]);

  const entradasGlosario = modelo.glosario.filter((g) => p.glosario.includes(g.termino));

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
            <PantallaVista p={p} />
          </div>
          <Glossary
            entradas={entradasGlosario}
            abierto={glosario}
            onAbrir={() => setGlosario(true)}
            onCerrar={() => setGlosario(false)}
          />
          <button
            className="borde-nav izq"
            onClick={() => irA(indice - 1)}
            disabled={indice === 0}
            aria-label={L.nav.anterior}
          >
            <ChevronLeft size={64} aria-hidden="true" />
          </button>
          <button
            className="borde-nav der"
            onClick={() => irA(indice + 1)}
            disabled={indice === TOTAL - 1}
            aria-label={L.nav.siguiente}
          >
            <ChevronRight size={64} aria-hidden="true" />
          </button>
          <footer className="pie">
            <ProgressBar indice={indice} total={TOTAL} fase={p.fase_lgr} />
            <Brand />
          </footer>
          <p className="sr-only">{L.nav.ayuda}</p>
        </div>
        {notas && (
          <Notes
            pantalla={p}
            duracionSegmento={duracionSegmento(p.segmento)}
            onCerrar={() => setNotas(false)}
            onPresentador={presentador}
            aviso={aviso}
          />
        )}
      </main>
    </EscalaContext.Provider>
  );
}
