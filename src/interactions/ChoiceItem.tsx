/**
 * Reactivo de selección (única o múltiple) con botón Enviar.
 * Nada se registra antes de enviar. Opcionalmente pide seleccionar las expresiones
 * que justifican la respuesta (sobre el fragmento o como fichas).
 */
import { Fragment, useMemo, useRef, useState, type ReactNode } from 'react';
import { richText } from '../components/RichText';
import type { Bloque, InteraccionSeleccion } from '../content/types';
import { store, useRespuestas } from '../state/store';
import { L } from '../ui/labels';
import { Feedback, type Estado } from './Feedback';

interface Props {
  interaccion: InteraccionSeleccion;
  /** Contenido de la columna izquierda en pantallas de dos columnas. */
  izquierda?: ReactNode;
}

/** Divide el fragmento en texto y expresiones seleccionables, conservando el énfasis original. */
function segmentarFragmento(raw: string, opciones: string[]) {
  const piezas: Array<{ tipo: 'texto'; t: string } | { tipo: 'expr'; t: string; negrita: boolean }> = [];
  let resto = raw;
  const pendientes = [...opciones];
  while (resto.length) {
    let mejor: { i: number; op: string } | null = null;
    for (const op of pendientes) {
      const i = resto.indexOf(op);
      if (i >= 0 && (!mejor || i < mejor.i)) mejor = { i, op };
    }
    if (!mejor) {
      piezas.push({ tipo: 'texto', t: resto });
      break;
    }
    let antes = resto.slice(0, mejor.i);
    let despues = resto.slice(mejor.i + mejor.op.length);
    const negrita = antes.endsWith('**') && despues.startsWith('**');
    if (negrita) {
      antes = antes.slice(0, -2);
      despues = despues.slice(2);
    }
    if (antes) piezas.push({ tipo: 'texto', t: antes });
    piezas.push({ tipo: 'expr', t: mejor.op, negrita });
    pendientes.splice(pendientes.indexOf(mejor.op), 1);
    resto = despues;
  }
  return piezas;
}

function BloqueP({ b }: { b: Bloque }) {
  if (b.estilo === 'subtitulo') {
    return (
      <h2 className="b b-subtitulo" data-contenido>
        {richText(b.texto)}
      </h2>
    );
  }
  return (
    <p className={`b b-${b.estilo}`} data-contenido>
      {richText(b.texto)}
    </p>
  );
}

export function ChoiceItem({ interaccion: it, izquierda }: Props) {
  const [elegidas, setElegidas] = useState<string[]>([]);
  const [marcas, setMarcas] = useState<string[]>([]);
  const [resultado, setResultado] = useState<{ estado: Estado; titulo: string; detalle: string[] } | null>(null);
  const inicio = useRef(Date.now());
  const { enVivo } = useRespuestas();
  const registradas = enVivo.filter((r) => r.id_reactivo === it.id_reactivo).length;
  const enviado = resultado !== null;
  const nombre = `reactivo-${it.id_reactivo}`;
  const m = it.marcadores;

  const piezas = useMemo(() => (m?.fragmento ? segmentarFragmento(m.fragmento.texto, m.opciones) : null), [m]);

  function alternarOpcion(clave: string) {
    if (enviado) return;
    setElegidas((prev) =>
      it.multiple ? (prev.includes(clave) ? prev.filter((c) => c !== clave) : [...prev, clave]) : [clave],
    );
  }

  function alternarMarca(expr: string) {
    if (enviado) return;
    setMarcas((prev) => (prev.includes(expr) ? prev.filter((x) => x !== expr) : [...prev, expr]));
  }

  function enviar() {
    if (!elegidas.length) return;
    const ordenadas = [...elegidas].sort();
    const correcta = it.correcta ? [...it.correcta].sort() : null;
    const esCorrecta = correcta ? ordenadas.join(',') === correcta.join(',') : null;
    const validas = m ? new Set(marcas.filter((x) => m.validas.includes(x))) : null;
    const suficiente = m ? validas!.size >= m.minimo : null;
    const incorrectas = ordenadas.filter((c) => !correcta?.includes(c));
    const falla = incorrectas.length ? (it.fallas[incorrectas[0]]?.etiqueta ?? null) : null;
    const catElegida = it.opciones.find((o) => o.clave === ordenadas[0])?.categoria ?? null;
    store.registrar({
      id_reactivo: it.id_reactivo,
      opcion_elegida: ordenadas.join(','),
      respuesta_correcta: correcta ? correcta.join(',') : null,
      es_correcta: esCorrecta,
      marcadores_de_justificacion: marcas,
      justificacion_suficiente: suficiente,
      paso_del_trayecto: it.paso_del_trayecto,
      nivel_de_lectura: it.nivel_de_lectura,
      proceso_pisa: it.proceso_pisa,
      falla_diagnosticada: falla,
      categoria_elegida: catElegida,
      categoria_correcta: it.categoria_correcta,
      tiempo_de_respuesta_s: Math.round((Date.now() - inicio.current) / 100) / 10,
    });
    const detalle: string[] = [];
    if (correcta && !esCorrecta) detalle.push(L.feedback.esperada(correcta.join(', ')));
    if (m) detalle.push(suficiente ? L.feedback.justificacionSuficiente : L.feedback.justificacionInsuficiente);
    if (esCorrecta === null) {
      setResultado({ estado: 'neutral', titulo: L.feedback.sinClave, detalle: [L.feedback.sinClaveDetalle] });
    } else {
      setResultado({
        estado: esCorrecta && suficiente !== false ? 'correcto' : 'incorrecto',
        titulo: esCorrecta ? L.feedback.correcto : L.feedback.incorrecto,
        detalle,
      });
    }
  }

  function otra() {
    setElegidas([]);
    setMarcas([]);
    setResultado(null);
    inicio.current = Date.now();
  }

  const fragmento = piezas && m?.fragmento && (
    <p className="b b-cita fragmento" data-contenido-compuesto>
      {piezas.map((p, i) =>
        p.tipo === 'texto' ? (
          <Fragment key={i}>{richText(p.t)}</Fragment>
        ) : (
          <span
            key={i}
            role="button"
            tabIndex={enviado ? -1 : 0}
            className="expr"
            aria-pressed={marcas.includes(p.t)}
            aria-disabled={enviado}
            onClick={() => alternarMarca(p.t)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                alternarMarca(p.t);
              }
            }}
            data-expr={p.t}
          >
            {p.negrita ? <strong>{p.t}</strong> : p.t}
          </span>
        ),
      )}
    </p>
  );

  const ranuras = m && (
    <div className="ranuras">
      <BloqueP b={m.titulo} />
      {!m.fragmento && (
        <div className="fichas" role="group" aria-label={L.interaccion.evidenciaInstruccion}>
          {m.opciones.map((o) => (
            <button
              key={o}
              type="button"
              className="ficha"
              aria-pressed={marcas.includes(o)}
              disabled={enviado}
              onClick={() => alternarMarca(o)}
              data-expr={o}
            >
              {o}
            </button>
          ))}
        </div>
      )}
      {m.ranuras.map((r, i) => (
        <div className="ranura" key={i}>
          <span className="b" data-contenido>
            {richText(r.texto)}
          </span>
          <span
            className={`ranura-valor${marcas[i] ? ' llena' : ''}`}
            aria-label={`${L.interaccion.evidencia} ${i + 1}`}
          >
            {marcas[i] ?? '—'}
          </span>
        </div>
      ))}
    </div>
  );

  const pregunta = (
    <div className="reactivo" data-interactivo data-reactivo={it.id_reactivo}>
      <fieldset className="opciones" disabled={enviado}>
        <legend className="b b-subtitulo" data-contenido>
          {richText(it.enunciado.texto)}
        </legend>
        {it.opciones.map((o) => {
          const marcada = elegidas.includes(o.clave);
          const esClave = it.correcta?.includes(o.clave);
          return (
            <label key={o.clave} className={`opcion${marcada ? ' marcada' : ''}${enviado && esClave ? ' clave' : ''}`}>
              <input
                type={it.multiple ? 'checkbox' : 'radio'}
                name={nombre}
                value={o.clave}
                checked={marcada}
                onChange={() => alternarOpcion(o.clave)}
                className="sr-only"
              />
              <span className="letra" aria-hidden="true">
                {o.clave}
              </span>
              <span className="b" data-contenido>
                {richText(o.texto)}
              </span>
            </label>
          );
        })}
      </fieldset>
      {!izquierda && ranuras}
      <div className="acciones-reactivo">
        {!enviado ? (
          <button
            type="button"
            className="btn primario"
            onClick={enviar}
            disabled={!elegidas.length}
            aria-describedby={`${nombre}-ayuda`}
          >
            {L.interaccion.enviar}
          </button>
        ) : (
          <button type="button" className="btn" onClick={otra}>
            {L.interaccion.otraRespuesta}
          </button>
        )}
        <span id={`${nombre}-ayuda`} className="estado-reactivo">
          {!elegidas.length && !enviado
            ? L.interaccion.seleccionaOpcion
            : L.interaccion.respuestasRegistradas(registradas)}
        </span>
      </div>
      <Feedback estado={resultado?.estado ?? null} titulo={resultado?.titulo}>
        {resultado && resultado.detalle.length > 0 && <p className="b">{resultado.detalle.join(' · ')}</p>}
      </Feedback>
    </div>
  );

  if (izquierda !== undefined) {
    return (
      <div className="dos-columnas" data-interactivo>
        <div className="col">
          {izquierda}
          {fragmento}
          {ranuras}
        </div>
        <div className="col">{pregunta}</div>
      </div>
    );
  }
  return pregunta;
}
