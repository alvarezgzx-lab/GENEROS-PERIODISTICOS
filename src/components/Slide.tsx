/** Renderiza una pantalla de slides.json según su tipo y diseño. */
import type { ReactNode } from 'react';
import type { Bloque, Categoria, Pantalla } from '../content/types';
import { ChoiceItem } from '../interactions/ChoiceItem';
import { DragDropItem } from '../interactions/DragDropItem';
import { CAT, FormaCategoria } from './CategoryBadge';
import { richText } from './RichText';
import { ICONOS_TABLA_17, VisualSvg } from './Visuals';

function BloqueTexto({ b }: { b: Bloque }) {
  const contenido = richText(b.texto);
  if (b.estilo === 'subtitulo') {
    return (
      <h2 className="b b-subtitulo" data-contenido>
        {contenido}
      </h2>
    );
  }
  if (b.estilo === 'fuente' && /^https?:\/\//.test(b.texto)) {
    return (
      <p className="b b-fuente" data-contenido>
        <a href={b.texto} target="_blank" rel="noopener noreferrer">
          {b.texto}
        </a>
      </p>
    );
  }
  return (
    <p className={`b b-${b.estilo}`} data-contenido>
      {contenido}
    </p>
  );
}

/** Agrupa ítems consecutivos en listas semánticas. */
export function Bloques({ bloques }: { bloques: Bloque[] }) {
  const salida: ReactNode[] = [];
  let i = 0;
  while (i < bloques.length) {
    const b = bloques[i];
    if (b.estilo === 'item' || b.estilo === 'numerado') {
      const estilo = b.estilo;
      const grupo: Bloque[] = [];
      while (i < bloques.length && bloques[i].estilo === estilo) grupo.push(bloques[i++]);
      const Lista = estilo === 'numerado' ? 'ol' : 'ul';
      salida.push(
        <Lista className="lista" key={`l${i}`}>
          {grupo.map((g, k) => (
            <li className={`b b-${estilo}`} key={k} data-contenido>
              {richText(g.texto)}
            </li>
          ))}
        </Lista>,
      );
      continue;
    }
    salida.push(<BloqueTexto b={b} key={`b${i}`} />);
    i++;
  }
  return <>{salida}</>;
}

function Miniforma({ cat }: { cat: Categoria }) {
  return (
    <svg width={56} height={56} viewBox="0 0 100 100" aria-hidden="true" style={{ flex: 'none' }}>
      <FormaCategoria cat={cat} cx={50} cy={cat === 'opinion' ? 56 : 50} r={cat === 'opinion' ? 42 : 48} />
    </svg>
  );
}

function Tabla({ p }: { p: Pantalla }) {
  const previos = p.bloques.filter((b) => !b.estilo.startsWith('tabla'));
  const enc = p.bloques.filter((b) => b.estilo === 'tabla-encabezado');
  const celdas = p.bloques.filter((b) => b.estilo === 'tabla-celda');
  const filas: Bloque[][] = [];
  for (let i = 0; i < celdas.length; i += enc.length) filas.push(celdas.slice(i, i + enc.length));
  const catsEnc: (Categoria | null)[] =
    p.visual?.id === 'encabezados-categoria' ? ['informativo', 'interpretativo'] : [null, null];
  const iconos = p.visual?.id === 'iconos-tabla';
  return (
    <div className="columna-texto" style={{ maxWidth: 1728 }}>
      <div className="columna-texto">
        <Bloques bloques={previos} />
      </div>
      <table className="tabla">
        <thead>
          <tr>
            {enc.map((h, i) => (
              <th scope="col" key={i} data-contenido>
                <span className="celda-icono">
                  {catsEnc[i] && <Miniforma cat={catsEnc[i]!} />}
                  <span>{richText(h.texto)}</span>
                </span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {filas.map((f, r) => (
            <tr key={r}>
              {f.map((c, k) => {
                const Icono = iconos && k === 1 ? ICONOS_TABLA_17[r] : null;
                return (
                  <td key={k} data-contenido>
                    <span className="celda-icono">
                      {Icono && (
                        <Icono size={44} color={r === 0 ? 'var(--color-2)' : 'var(--color-4)'} aria-hidden="true" />
                      )}
                      <span>{richText(c.texto)}</span>
                    </span>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function TresColumnas({ p }: { p: Pantalla }) {
  const zonas: Array<{ z: 'a' | 'b' | 'c'; cat: Categoria }> = [
    { z: 'a', cat: 'informativo' },
    { z: 'b', cat: 'interpretativo' },
    { z: 'c', cat: 'opinion' },
  ];
  return (
    <div className="tres-columnas">
      {zonas.map(({ z, cat }) => {
        const bs = p.bloques.filter((b) => b.zona === z);
        return (
          <div className="columna" key={z} style={{ borderTop: `8px solid ${CAT[cat].color}`, paddingTop: 24 }}>
            <div className="celda-icono" style={{ alignItems: 'center' }}>
              <Miniforma cat={cat} />
              <BloqueTexto b={bs[0]} />
            </div>
            <Bloques bloques={bs.slice(1)} />
          </div>
        );
      })}
    </div>
  );
}

export function Slide({ p }: { p: Pantalla }) {
  const it = p.interaccion;
  const titulo = p.titulo && (
    <h1 id={`t-${p.id}`} className={`titulo${p.id === 1 ? ' portada' : ''}`} data-contenido>
      {richText(p.titulo.texto)}
    </h1>
  );

  let cuerpo: ReactNode;
  if (p.diseno === 'tabla') {
    cuerpo = <Tabla p={p} />;
  } else if (p.diseno === 'tres-columnas') {
    cuerpo = <TresColumnas p={p} />;
  } else if (it?.tipo === 'arrastre') {
    cuerpo = (
      <div className="cuerpo-arrastre">
        <Bloques bloques={p.bloques} />
        <DragDropItem interaccion={it} />
      </div>
    );
  } else if (it && p.diseno === 'dos-columnas' && it.tipo === 'seleccion') {
    cuerpo = <ChoiceItem interaccion={it} izquierda={<Bloques bloques={p.bloques} />} />;
  } else {
    const visual = p.visual ? <VisualSvg visual={p.visual} /> : null;
    cuerpo = (
      <div className={`cuerpo${visual ? '' : ' sin-visual'}`}>
        <div className="columna-texto">
          <Bloques bloques={p.bloques} />
          {it?.tipo === 'seleccion' && <ChoiceItem interaccion={it} />}
        </div>
        {visual && <div className="visual">{visual}</div>}
      </div>
    );
  }

  return (
    <section
      className={`pantalla tipo-${p.tipo}`}
      aria-labelledby={p.titulo ? `t-${p.id}` : undefined}
      data-pantalla={p.id}
    >
      {titulo}
      {cuerpo}
    </section>
  );
}
