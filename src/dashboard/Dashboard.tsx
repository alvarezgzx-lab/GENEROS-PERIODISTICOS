/** Dashboard de resultados de la sesión: gráficas SVG propias con etiquetas directas. */
import { Check, Download, RotateCcw } from 'lucide-react';
import { useMemo, useRef, useState, type KeyboardEvent } from 'react';
import { CategoryBadge } from '../components/CategoryBadge';
import type { ModeloSlides, PasoTrayecto } from '../content/types';
import { store, useRespuestas } from '../state/store';
import { L } from '../ui/labels';
import {
  aCsv,
  aciertoPor,
  aciertoPorReactivo,
  calidadJustificacion,
  CATEGORIAS,
  distractores,
  filtrar,
  matrizConfusion,
  participacion,
  reactivos,
  sintesis,
  tiempoMedio,
} from './metrics';

type Pestana = keyof typeof L.dashboard.pestañas;
const PESTANAS: Pestana[] = ['participacion', 'acierto', 'confusion', 'distractores', 'sintesis'];

interface Barra {
  etiqueta: string;
  valor: number | null;
  texto: string;
  valor2?: number;
}

/** Barras horizontales con etiqueta directa a la izquierda y valor escrito a la derecha. */
function Barras({
  filas,
  max,
  ancho = 1728,
  etiquetaAncho = 300,
  alto = 50,
  titulo,
}: {
  filas: Barra[];
  max: number;
  ancho?: number;
  etiquetaAncho?: number;
  alto?: number;
  titulo: string;
}) {
  const textoAncho = 400;
  const util = ancho - etiquetaAncho - textoAncho - 24;
  const h = filas.length * alto;
  return (
    <svg width={ancho} height={h} viewBox={`0 0 ${ancho} ${h}`} role="img" aria-label={titulo} className="grafica">
      {filas.map((f, i) => {
        const y = i * alto;
        const w = f.valor === null || max === 0 ? 0 : (f.valor / max) * util;
        const w2 = f.valor2 && max ? (f.valor2 / max) * util : 0;
        return (
          <g key={i}>
            <text x={0} y={y + alto / 2} fontSize={36} dominantBaseline="middle" style={{ fill: 'var(--color-5)' }}>
              {f.etiqueta}
            </text>
            <rect x={etiquetaAncho} y={y + 10} width={util} height={alto - 20} fill="var(--superficie-2)" rx={6} />
            {w > 0 && <rect x={etiquetaAncho} y={y + 10} width={w} height={alto - 20} fill="var(--color-2)" rx={6} />}
            {w2 > 0 && (
              <rect
                x={etiquetaAncho + w}
                y={y + 10}
                width={w2}
                height={alto - 20}
                fill="url(#rayado)"
                stroke="var(--color-5)"
                strokeWidth={2}
                rx={6}
              />
            )}
            <text
              x={etiquetaAncho + util + 24}
              y={y + alto / 2}
              fontSize={36}
              dominantBaseline="middle"
              style={{ fill: 'var(--color-5)' }}
            >
              {f.texto}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const PASOS_ORDEN: PasoTrayecto[] = ['encuentra', 'explica', 'reconoce', 'justifica'];

export function Dashboard({ modelo }: { modelo: ModeloSlides }) {
  const { enVivo, semilla, almacenamientoOk } = useRespuestas();
  const [filtro, setFiltro] = useState({ semilla: true, enVivo: true });
  const [pestana, setPestana] = useState<Pestana>('participacion');
  const [confirmando, setConfirmando] = useState(false);
  const [aviso, setAviso] = useState('');
  const refs = useRef<Record<string, HTMLButtonElement | null>>({});

  const its = useMemo(() => reactivos(modelo), [modelo]);
  const todas = useMemo(() => [...semilla, ...enVivo], [semilla, enVivo]);
  const rs = useMemo(() => filtrar(todas, filtro), [todas, filtro]);

  function exportar() {
    const blob = new Blob([aCsv(rs)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `resultados-${store.sesion().slice(0, 8)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function teclaPestanas(e: KeyboardEvent) {
    const i = PESTANAS.indexOf(pestana);
    let j = i;
    if (e.key === 'ArrowRight') j = (i + 1) % PESTANAS.length;
    else if (e.key === 'ArrowLeft') j = (i - 1 + PESTANAS.length) % PESTANAS.length;
    else if (e.key === 'Home') j = 0;
    else if (e.key === 'End') j = PESTANAS.length - 1;
    else return;
    e.preventDefault();
    e.stopPropagation();
    setPestana(PESTANAS[j]);
    refs.current[PESTANAS[j]]?.focus();
  }

  const part = participacion(rs, its);
  const maxPart = Math.max(1, ...part.map((p) => p.total));
  const porReactivo = aciertoPorReactivo(rs, its);
  const porPaso = PASOS_ORDEN.map(
    (p) =>
      aciertoPor(rs, 'paso_del_trayecto', L.dashboard.sinEtiqueta).find((t) => t.clave === p) ?? {
        clave: p,
        aciertos: 0,
        total: 0,
        pct: null,
      },
  );
  const porNivel = aciertoPor(rs, 'nivel_de_lectura', L.dashboard.sinEtiqueta);
  const porPisa = aciertoPor(rs, 'proceso_pisa', L.dashboard.sinEtiqueta);
  const matriz = matrizConfusion(rs);
  const dist = distractores(rs, its).filter((d) => d.opcion !== null);
  const just = calidadJustificacion(rs);
  const tMedio = tiempoMedio(rs);
  const sint = sintesis(rs, modelo);
  const pctTexto = (t: { pct: number | null; aciertos: number; total: number }) =>
    t.pct === null ? '—' : `${L.dashboard.porcentaje(t.pct)} (${t.aciertos}/${t.total})`;

  return (
    <div className="dashboard" data-interactivo data-dashboard>
      <div className="dash-cabecera">
        <h1 className="titulo">{L.dashboard.titulo}</h1>
        <div className="dash-controles">
          <label className="interruptor">
            <input
              type="checkbox"
              checked={filtro.enVivo}
              onChange={(e) => setFiltro((f) => ({ ...f, enVivo: e.target.checked }))}
            />
            <span>
              {L.dashboard.mostrarEnVivo} ({enVivo.length})
            </span>
          </label>
          <label className="interruptor">
            <input
              type="checkbox"
              checked={filtro.semilla}
              onChange={(e) => setFiltro((f) => ({ ...f, semilla: e.target.checked }))}
              data-toggle-semilla
            />
            <span>
              <span className="etiqueta-simulado">{L.dashboard.simulado}</span> ({semilla.length})
            </span>
          </label>
        </div>
      </div>

      <div className="dash-fila">
        <div className="dash-pestanas" role="tablist" aria-label={L.dashboard.titulo} onKeyDown={teclaPestanas}>
          {PESTANAS.map((p) => (
            <button
              key={p}
              ref={(el) => {
                refs.current[p] = el;
              }}
              role="tab"
              id={`tab-${p}`}
              aria-selected={pestana === p}
              aria-controls={`panel-${p}`}
              tabIndex={pestana === p ? 0 : -1}
              className="pestana"
              onClick={() => setPestana(p)}
            >
              {L.dashboard.pestañas[p]}
            </button>
          ))}
        </div>
        <div className="dash-controles">
          <button type="button" className="btn chico" onClick={exportar}>
            <Download size={32} aria-hidden="true" /> {L.dashboard.exportar}
          </button>
          <button type="button" className="btn chico" onClick={() => setConfirmando(true)}>
            <RotateCcw size={32} aria-hidden="true" /> {L.dashboard.reiniciar}
          </button>
        </div>
      </div>

      <p className="b dash-aviso" role="status" aria-live="polite">
        {aviso ||
          (semilla.length === 0 && filtro.semilla ? L.dashboard.sinSemilla : '') ||
          (rs.length === 0 ? L.dashboard.sinDatos : '') ||
          (!almacenamientoOk ? L.sistema.almacenamientoNoDisponible : '')}
      </p>

      <svg width={0} height={0} aria-hidden="true" style={{ position: 'absolute' }}>
        <defs>
          <pattern id="rayado" width={12} height={12} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width={12} height={12} fill="var(--color-1)" />
            <line x1={0} y1={0} x2={0} y2={12} stroke="var(--color-5)" strokeWidth={6} />
          </pattern>
        </defs>
      </svg>

      <div
        role="tabpanel"
        id={`panel-${pestana}`}
        aria-labelledby={`tab-${pestana}`}
        className="dash-panel"
        tabIndex={0}
      >
        {pestana === 'participacion' && (
          <>
            <h2 className="b b-subtitulo">{L.dashboard.participacionPorReactivo}</h2>
            <Barras
              titulo={L.dashboard.participacionPorReactivo}
              max={maxPart}
              filas={part.map((p) => ({
                etiqueta: p.etiqueta,
                valor: p.en_vivo,
                valor2: p.semilla,
                texto: `${p.en_vivo} ${L.dashboard.enVivo.toLowerCase()} · ${p.semilla} ${L.dashboard.simulado.toLowerCase()}`,
              }))}
            />
          </>
        )}

        {pestana === 'acierto' && (
          <div className="dash-dos">
            <div>
              <h2 className="b b-subtitulo">{L.dashboard.aciertoPorReactivo}</h2>
              <Barras
                titulo={L.dashboard.aciertoPorReactivo}
                ancho={940}
                etiquetaAncho={220}
                max={100}
                filas={porReactivo.map((t) => ({
                  etiqueta: t.etiqueta,
                  valor: t.pct,
                  texto: t.sinClave ? L.dashboard.excluido : pctTexto(t),
                }))}
              />
            </div>
            <div>
              <h2 className="b b-subtitulo">{L.dashboard.aciertoPorPaso}</h2>
              <Barras
                titulo={L.dashboard.aciertoPorPaso}
                ancho={720}
                etiquetaAncho={240}
                max={100}
                filas={porPaso.map((t) => ({
                  etiqueta: L.pasosCortos[t.clave as PasoTrayecto],
                  valor: t.pct,
                  texto: pctTexto(t),
                }))}
              />
              <h2 className="b b-subtitulo">{L.dashboard.aciertoPorNivel}</h2>
              <Barras
                titulo={L.dashboard.aciertoPorNivel}
                ancho={720}
                etiquetaAncho={0}
                max={100}
                filas={(porNivel.length
                  ? porNivel
                  : [{ clave: L.dashboard.sinEtiqueta, pct: null, aciertos: 0, total: 0 }]
                ).map((t) => ({
                  etiqueta: '',
                  valor: t.pct,
                  texto: `${t.clave}: ${pctTexto(t)}`,
                }))}
              />
              <h2 className="b b-subtitulo">{L.dashboard.aciertoPorPisa}</h2>
              <Barras
                titulo={L.dashboard.aciertoPorPisa}
                ancho={720}
                etiquetaAncho={0}
                max={100}
                filas={(porPisa.length
                  ? porPisa
                  : [{ clave: L.dashboard.sinEtiqueta, pct: null, aciertos: 0, total: 0 }]
                ).map((t) => ({
                  etiqueta: '',
                  valor: t.pct,
                  texto: `${t.clave}: ${pctTexto(t)}`,
                }))}
              />
            </div>
          </div>
        )}

        {pestana === 'confusion' && (
          <>
            <h2 className="b b-subtitulo">{L.dashboard.matriz}</h2>
            <table className="matriz">
              <thead>
                <tr>
                  <th scope="col">
                    {L.dashboard.correcta} ↓ / {L.dashboard.elegida} →
                  </th>
                  {CATEGORIAS.map((c) => (
                    <th scope="col" key={c}>
                      <CategoryBadge cat={c} tamano={48} />
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CATEGORIAS.map((f) => {
                  const fila = matriz[f];
                  const total = Object.values(fila).reduce((a, b) => a + b, 0);
                  return (
                    <tr key={f}>
                      <th scope="row">
                        <CategoryBadge cat={f} tamano={48} />
                      </th>
                      {CATEGORIAS.map((c) => (
                        <td key={c} className={c === f ? 'diagonal' : ''}>
                          <span className="celda-valor">
                            {c === f && <Check size={32} aria-label={L.dashboard.correcta} />}
                            {fila[c]}
                          </span>
                          <span className="celda-barra" style={{ width: `${total ? (fila[c] / total) * 100 : 0}%` }} />
                        </td>
                      ))}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </>
        )}

        {pestana === 'distractores' && (
          <div className="dash-dos">
            <div>
              <h2 className="b b-subtitulo">{L.dashboard.distractor}</h2>
              {dist.length === 0 ? (
                <p className="b">{L.dashboard.ninguno}</p>
              ) : (
                <table className="tabla tabla-dash">
                  <tbody>
                    {dist.slice(0, 8).map((d) => (
                      <tr key={d.id}>
                        <th scope="row">{d.etiqueta}</th>
                        <td>
                          {d.opcion} ({d.veces})
                        </td>
                        <td>{d.falla?.etiqueta ?? L.dashboard.sinFalla}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div>
              <h2 className="b b-subtitulo">{L.dashboard.justificacion}</h2>
              <Barras
                titulo={L.dashboard.justificacion}
                ancho={720}
                etiquetaAncho={0}
                max={Math.max(1, just.con + just.sin)}
                filas={[
                  { etiqueta: '', valor: just.con, texto: `${L.dashboard.conJustificacion}: ${just.con}` },
                  { etiqueta: '', valor: just.sin, texto: `${L.dashboard.sinJustificacion}: ${just.sin}` },
                ]}
                alto={110}
              />
              <h2 className="b b-subtitulo">{L.dashboard.tiempoMedio}</h2>
              <p className="b dash-cifra">{tMedio === null ? '—' : L.dashboard.segundos(tMedio)}</p>
            </div>
          </div>
        )}

        {pestana === 'sintesis' && (
          <div className="dash-sintesis">
            <h2 className="b b-subtitulo">{L.dashboard.sintesis}</h2>
            {sint ? (
              <>
                <p className="b">
                  {L.dashboard.pasoMayorFalla}: <strong>{L.pasos[sint.paso]}</strong> ({sint.fallas}/{sint.total})
                </p>
                <p className="b">{L.dashboard.intervencion}:</p>
                <p className="b b-cita">{sint.intervencion}</p>
              </>
            ) : (
              <p className="b">{L.dashboard.sinFallas}</p>
            )}
          </div>
        )}
      </div>

      {confirmando && (
        <div className="confirmacion" role="alertdialog" aria-modal="true" aria-labelledby="confirmar-texto">
          <p id="confirmar-texto" className="b">
            {L.dashboard.confirmarReinicio}
          </p>
          <div className="acciones-reactivo">
            <button
              type="button"
              className="btn primario"
              autoFocus
              onClick={() => {
                store.reiniciar();
                setConfirmando(false);
                setAviso(L.dashboard.reiniciado);
              }}
            >
              {L.dashboard.confirmar}
            </button>
            <button type="button" className="btn" onClick={() => setConfirmando(false)}>
              {L.dashboard.cancelar}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
