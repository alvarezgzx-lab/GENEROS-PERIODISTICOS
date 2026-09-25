/** Vista de notas del presentador: guion del segmento, duración prevista y cronómetro. */
import { MonitorUp, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { Pantalla } from '../content/types';
import { L } from '../ui/labels';
import { richText } from './RichText';

export function formato(s: number) {
  const m = Math.floor(s / 60);
  const r = Math.floor(s % 60);
  return `${m}:${String(r).padStart(2, '0')}`;
}

export function useCronometro(clave: string) {
  const [acumulado, setAcumulado] = useState(0);
  const [corriendo, setCorriendo] = useState(true);
  const inicio = useRef(Date.now());
  const [, forzar] = useState(0);

  useEffect(() => {
    // Cada segmento arranca su propio cronómetro.
    inicio.current = Date.now();
    setAcumulado(0);
    setCorriendo(true);
  }, [clave]);

  useEffect(() => {
    if (!corriendo) return;
    const t = window.setInterval(() => forzar((n) => n + 1), 500);
    return () => window.clearInterval(t);
  }, [corriendo]);

  const segundos = acumulado + (corriendo ? (Date.now() - inicio.current) / 1000 : 0);
  return {
    segundos,
    corriendo,
    alternar() {
      if (corriendo) setAcumulado(segundos);
      else inicio.current = Date.now();
      setCorriendo(!corriendo);
    },
    reiniciar() {
      inicio.current = Date.now();
      setAcumulado(0);
    },
  };
}

export function Guion({ texto }: { texto: string }) {
  return (
    <div className="guion">
      {texto.split('\n').map((linea, i) => {
        const l = linea.trim();
        if (!l) return null;
        if (l.startsWith('## ')) return <h3 key={i}>{l.slice(3)}</h3>;
        const limpio = l.replace(/^[-*>] /, '• ').replace(/^> /, '');
        return <p key={i}>{richText(limpio)}</p>;
      })}
    </div>
  );
}

interface CuerpoProps {
  pantalla: Pantalla;
  duracionSegmento: number;
}

/** Contenido de las notas: datos del segmento, cronómetro, marcas [REVISAR] y guion. */
export function NotasCuerpo({ pantalla, duracionSegmento }: CuerpoProps) {
  const crono = useCronometro(pantalla.segmento);
  const excedido = duracionSegmento > 0 && crono.segundos > duracionSegmento;
  return (
    <>
      <dl>
        <dt>{L.notas.segmento}</dt>
        <dd>{pantalla.segmento}</dd>
        <dt>{L.notas.fase}</dt>
        <dd>{L.fases[pantalla.fase_lgr]}</dd>
        <dt>{L.notas.duracion}</dt>
        <dd>
          {duracionSegmento > 0
            ? `${formato(duracionSegmento)} (${L.notas.segundos(pantalla.duracion_s)})`
            : L.notas.sinDuracion}
        </dd>
      </dl>
      <div>
        <h3>{L.notas.cronometro}</h3>
        <div className={`crono${excedido ? ' excedido' : ''}`} aria-live="off" data-crono-segmento>
          {formato(crono.segundos)}
        </div>
        <div className="acciones">
          <button className="btn" onClick={crono.alternar}>
            {crono.corriendo ? L.notas.pausar : L.notas.iniciar}
          </button>
          <button className="btn" onClick={crono.reiniciar}>
            {L.notas.reiniciar}
          </button>
        </div>
      </div>
      {pantalla.revisar.length > 0 && (
        <div className="revisar">
          <h3>{L.notas.revisar}</h3>
          <ul>
            {pantalla.revisar.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
      {pantalla.visual && (
        <p>
          <strong>{L.notas.visual}:</strong> {pantalla.visual.descripcion}
        </p>
      )}
      <h3>{L.notas.guion}</h3>
      <Guion texto={pantalla.notas} />
    </>
  );
}

interface Props extends CuerpoProps {
  onCerrar: () => void;
  onPresentador: () => void;
  aviso?: string;
}

export function Notes({ pantalla, duracionSegmento, onCerrar, onPresentador, aviso }: Props) {
  return (
    <aside className="notas" aria-label={L.notas.titulo} data-notas>
      <div className="acciones">
        <button className="btn" onClick={onPresentador}>
          <MonitorUp size={20} aria-hidden="true" /> {L.notas.abrirPresentador}
        </button>
        <button className="btn notas-cerrar" onClick={onCerrar}>
          <X size={20} aria-hidden="true" /> {L.notas.cerrar}
        </button>
      </div>
      {aviso && (
        <p className="aviso-notas" role="alert">
          {aviso}
        </p>
      )}
      <h2>{L.notas.titulo}</h2>
      <NotasCuerpo pantalla={pantalla} duracionSegmento={duracionSegmento} />
    </aside>
  );
}
