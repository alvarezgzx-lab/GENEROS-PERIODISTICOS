/**
 * Completar huecos arrastrando expresiones del banco.
 * Modalidades: puntero (ratón o táctil), teclado (sensor de @dnd-kit con saltos entre espacios)
 * y selección por clic (tocar una expresión y luego un espacio).
 */
import {
  DndContext,
  KeyboardCode,
  KeyboardSensor,
  PointerSensor,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
  type KeyboardCoordinateGetter,
  type UniqueIdentifier,
} from '@dnd-kit/core';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Fragment, useMemo, useRef, useState } from 'react';
import { richText } from '../components/RichText';
import { useEscala } from '../components/escala';
import type { InteraccionArrastre } from '../content/types';
import { store, useRespuestas } from '../state/store';
import { L } from '../ui/labels';
import { Feedback, type Estado } from './Feedback';

const BANCO = 'banco';
const idHueco = (i: number) => `hueco-${i}`;
const idFicha = (i: number) => `ficha-${i}`;

function Ficha({
  indice,
  texto,
  seleccionada,
  onClick,
  deshabilitada,
  colocada,
}: {
  indice: number;
  texto: string;
  seleccionada: boolean;
  onClick: () => void;
  deshabilitada: boolean;
  colocada: boolean;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: idFicha(indice),
    disabled: deshabilitada,
  });
  const escala = useEscala();
  const estilo = transform
    ? { transform: `translate3d(${transform.x / escala}px, ${transform.y / escala}px, 0)`, zIndex: 30 }
    : undefined;
  return (
    <button
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      type="button"
      className={`ficha${colocada ? ' colocada' : ''}${isDragging ? ' arrastrando' : ''}`}
      style={estilo}
      aria-pressed={seleccionada}
      onClick={onClick}
      disabled={deshabilitada}
      data-ficha={texto}
    >
      {texto}
    </button>
  );
}

function Hueco({
  indice,
  children,
  onClick,
  estado,
  deshabilitado,
}: {
  indice: number;
  children?: React.ReactNode;
  onClick: () => void;
  estado: 'ok' | 'mal' | null;
  deshabilitado: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: idHueco(indice), disabled: deshabilitado });
  return (
    <span
      ref={setNodeRef}
      className={`hueco${isOver ? ' sobre' : ''}${estado ? ` ${estado}` : ''}`}
      data-hueco={indice}
    >
      {children ?? (
        <button
          type="button"
          className="hueco-vacio"
          onClick={onClick}
          disabled={deshabilitado}
          aria-label={`${L.interaccion.hueco(indice + 1)}: ${L.interaccion.huecoVacio}`}
        >
          <span aria-hidden="true">{indice + 1}</span>
        </button>
      )}
      {estado === 'ok' && <CheckCircle2 size={40} color="var(--color-2)" aria-label={L.feedback.correcto} />}
      {estado === 'mal' && <XCircle size={40} color="var(--color-3)" aria-label={L.feedback.incorrecto} />}
    </span>
  );
}

function Banco({ children, titulo }: { children: React.ReactNode; titulo: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id: BANCO });
  return (
    <div ref={setNodeRef} className={`banco${isOver ? ' sobre' : ''}`} role="group" aria-label={L.interaccion.banco}>
      {titulo}
      <div className="banco-fichas">{children}</div>
    </div>
  );
}

export function DragDropItem({ interaccion: it }: { interaccion: InteraccionArrastre }) {
  const huecos = useMemo(() => it.parrafos.flat(), [it]);
  const [asignacion, setAsignacion] = useState<(number | null)[]>(() => huecos.map(() => null));
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [resultado, setResultado] = useState<{ estado: Estado; titulo: string; detalle: string[] } | null>(null);
  const inicio = useRef(Date.now());
  const { enVivo } = useRespuestas();
  const registradas = enVivo.filter((r) => r.id_reactivo === it.id_reactivo).length;
  const enviado = resultado !== null;

  // Orden de destinos para el teclado: espacios en orden de lectura y, al final, el banco.
  const destinos: UniqueIdentifier[] = useMemo(() => [...huecos.map((_, i) => idHueco(i)), BANCO], [huecos]);
  const cursor = useRef(-1);

  const coordenadas: KeyboardCoordinateGetter = (evento, { context }) => {
    const { droppableRects, collisionRect } = context;
    const mover = {
      [KeyboardCode.Right]: 1,
      [KeyboardCode.Down]: 1,
      [KeyboardCode.Left]: -1,
      [KeyboardCode.Up]: -1,
    } as Record<string, number>;
    const paso = mover[evento.code];
    if (!paso || !collisionRect) return undefined;
    evento.preventDefault();
    const n = destinos.length;
    cursor.current = cursor.current < 0 ? (paso > 0 ? 0 : n - 1) : (cursor.current + paso + n) % n;
    const r = droppableRects.get(destinos[cursor.current]);
    if (!r) return undefined;
    return {
      x: r.left + r.width / 2 - collisionRect.width / 2,
      y: r.top + r.height / 2 - collisionRect.height / 2,
    };
  };

  const sensores = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: coordenadas }),
  );

  const nombreDestino = (id: UniqueIdentifier | undefined) => {
    if (id === undefined) return '';
    if (id === BANCO) return L.interaccion.banco;
    return L.interaccion.hueco(Number(String(id).split('-')[1]) + 1);
  };
  const textoFicha = (id: UniqueIdentifier) => it.banco[Number(String(id).split('-')[1])];
  const anuncios: Announcements = {
    onDragStart: ({ active }) => L.interaccion.arrastreInicio(textoFicha(active.id)),
    onDragOver: ({ active, over }) =>
      over ? L.interaccion.arrastreSobre(textoFicha(active.id), nombreDestino(over.id)) : undefined,
    onDragEnd: ({ active, over }) =>
      over && over.id !== BANCO
        ? L.interaccion.arrastreFin(textoFicha(active.id), nombreDestino(over.id))
        : L.interaccion.arrastreFuera(textoFicha(active.id)),
    onDragCancel: ({ active }) => L.interaccion.arrastreCancelado(textoFicha(active.id)),
  };

  function colocar(ficha: number, hueco: number | null) {
    setAsignacion((prev) => {
      const sig = prev.map((f) => (f === ficha ? null : f));
      if (hueco !== null) sig[hueco] = ficha;
      return sig;
    });
    setSeleccion(null);
  }

  function alSoltar(e: DragEndEvent) {
    cursor.current = -1;
    const ficha = Number(String(e.active.id).split('-')[1]);
    if (!e.over) return;
    if (e.over.id === BANCO) colocar(ficha, null);
    else colocar(ficha, Number(String(e.over.id).split('-')[1]));
  }

  function clicFicha(i: number) {
    if (enviado) return;
    const enHueco = asignacion.indexOf(i);
    if (enHueco >= 0 && seleccion === null) {
      colocar(i, null);
      return;
    }
    setSeleccion((s) => (s === i ? null : i));
  }

  function clicHueco(h: number) {
    if (enviado || seleccion === null) return;
    colocar(seleccion, h);
  }

  const completo = asignacion.every((a) => a !== null);

  function enviar() {
    if (!completo) return;
    const elegidas = asignacion.map((a) => it.banco[a!]);
    const correctas = huecos.map((h) => h.correcta);
    const aciertos = elegidas.filter((e, i) => e === correctas[i]).length;
    const esCorrecta = aciertos === huecos.length;
    store.registrar({
      id_reactivo: it.id_reactivo,
      opcion_elegida: elegidas.join(' | '),
      respuesta_correcta: correctas.join(' | '),
      es_correcta: esCorrecta,
      marcadores_de_justificacion: [],
      justificacion_suficiente: null,
      paso_del_trayecto: it.paso_del_trayecto,
      nivel_de_lectura: it.nivel_de_lectura,
      proceso_pisa: it.proceso_pisa,
      falla_diagnosticada: null,
      categoria_elegida: null,
      categoria_correcta: it.categoria_correcta,
      tiempo_de_respuesta_s: Math.round((Date.now() - inicio.current) / 100) / 10,
    });
    setResultado({
      estado: esCorrecta ? 'correcto' : 'incorrecto',
      titulo: esCorrecta ? L.feedback.correcto : L.feedback.incorrecto,
      detalle: [L.feedback.aciertos(aciertos, huecos.length)],
    });
  }

  function otra() {
    setAsignacion(huecos.map(() => null));
    setSeleccion(null);
    setResultado(null);
    inicio.current = Date.now();
  }

  const acciones = (
    <>
      <div className="acciones-reactivo">
        {!enviado ? (
          <button type="button" className="btn primario" onClick={enviar} disabled={!completo}>
            {L.interaccion.enviar}
          </button>
        ) : (
          <button type="button" className="btn" onClick={otra}>
            {L.interaccion.otraRespuesta}
          </button>
        )}
        <span className="estado-reactivo">
          {!completo && !enviado ? L.interaccion.completaHuecos : L.interaccion.respuestasRegistradas(registradas)}
        </span>
      </div>
      <Feedback estado={resultado?.estado ?? null} titulo={resultado?.titulo}>
        {resultado?.detalle.map((d, i) => (
          <p className="b" key={i}>
            {d}
          </p>
        ))}
      </Feedback>
    </>
  );

  let k = 0;
  return (
    <div className="arrastre" data-interactivo data-reactivo={it.id_reactivo}>
      <p className="sr-only" id={`ayuda-${it.id_reactivo}`}>
        {L.interaccion.instruccionArrastre}
      </p>
      <DndContext
        sensors={sensores}
        onDragEnd={alSoltar}
        onDragCancel={() => (cursor.current = -1)}
        accessibility={{
          announcements: anuncios,
          screenReaderInstructions: { draggable: L.interaccion.instruccionArrastre },
        }}
      >
        <div className="arrastre-rejilla">
          <div className="arrastre-izq">
            <div className="texto-huecos">
              {it.parrafos.map((parrafo, pi) => (
                <p className="b" key={pi}>
                  {parrafo.map((h) => {
                    const i = k++;
                    const f = asignacion[i];
                    const estado = enviado ? (f !== null && it.banco[f] === h.correcta ? 'ok' : 'mal') : null;
                    return (
                      <Fragment key={i}>
                        {h.antes && <span data-contenido-fragmento>{richText(h.antes)} </span>}
                        <Hueco indice={i} onClick={() => clicHueco(i)} estado={estado} deshabilitado={enviado}>
                          {f !== null ? (
                            <Ficha
                              indice={f}
                              texto={it.banco[f]}
                              seleccionada={seleccion === f}
                              onClick={() => clicFicha(f)}
                              deshabilitada={enviado}
                              colocada
                            />
                          ) : undefined}
                        </Hueco>
                        <span data-contenido-fragmento>{richText(h.despues)}</span>{' '}
                      </Fragment>
                    );
                  })}
                </p>
              ))}
            </div>
            {acciones}
          </div>
          <Banco
            titulo={
              <p className="b b-subtitulo banco-titulo" data-contenido>
                {richText(it.bancoTitulo.texto)}
              </p>
            }
          >
            {it.banco.map((t, i) =>
              asignacion.includes(i) ? (
                <span key={i} className="ficha-hueco" aria-hidden="true" />
              ) : (
                <Ficha
                  key={i}
                  indice={i}
                  texto={t}
                  seleccionada={seleccion === i}
                  onClick={() => clicFicha(i)}
                  deshabilitada={enviado}
                  colocada={false}
                />
              ),
            )}
          </Banco>
        </div>
      </DndContext>
    </div>
  );
}
