/** Glosario emergente con definiciones literales de los insumos. */
import { BookOpen, X } from 'lucide-react';
import { useEffect, useRef } from 'react';
import type { EntradaGlosario } from '../content/types';
import { L } from '../ui/labels';
import { richText } from './RichText';

interface Props {
  entradas: EntradaGlosario[];
  abierto: boolean;
  onAbrir: () => void;
  onCerrar: () => void;
}

export function Glossary({ entradas, abierto, onAbrir, onCerrar }: Props) {
  const cerrarRef = useRef<HTMLButtonElement>(null);
  const abrirRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (abierto) cerrarRef.current?.focus();
  }, [abierto]);
  if (entradas.length === 0) return null;
  return (
    <>
      <button
        ref={abrirRef}
        className="btn chico btn-glosario"
        onClick={onAbrir}
        aria-haspopup="dialog"
        aria-expanded={abierto}
      >
        <BookOpen size={32} aria-hidden="true" /> {L.glosario.boton}
      </button>
      {abierto && (
        <div
          className="dialogo-glosario"
          role="dialog"
          aria-modal="true"
          aria-labelledby="glosario-titulo"
          data-interactivo
          onKeyDown={(e) => {
            if (e.key === 'Escape') {
              e.stopPropagation();
              onCerrar();
              abrirRef.current?.focus();
            }
          }}
        >
          <h2 id="glosario-titulo">{L.glosario.titulo}</h2>
          <dl>
            {entradas.map((e) => (
              <div key={e.termino}>
                <dt>{e.termino}</dt>
                <dd className="b" data-contenido>
                  {richText(e.definicion.texto)}
                </dd>
              </div>
            ))}
          </dl>
          <button
            ref={cerrarRef}
            className="btn chico"
            style={{ alignSelf: 'flex-start' }}
            onClick={() => {
              onCerrar();
              abrirRef.current?.focus();
            }}
          >
            <X size={32} aria-hidden="true" /> {L.glosario.cerrar}
          </button>
        </div>
      )}
    </>
  );
}
