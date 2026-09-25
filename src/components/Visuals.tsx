/**
 * Apoyos visuales SVG propios (íconos de Lucide + geometría con la paleta).
 * Cada visual tiene función explicativa; su descripción (de slides.json) es el texto alternativo.
 * Los textos dentro de los SVG son etiquetas de interfaz (src/ui/labels.ts) a 36 px.
 */
import {
  ArrowLeftRight,
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  Equal,
  FileText,
  Flag,
  FolderOpen,
  Hash,
  HelpCircle,
  MapPin,
  Plus,
  Puzzle,
  Quote,
  Scale,
  Search,
  Signpost,
  Target,
  TriangleAlert,
  User,
  Users,
  Workflow,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { Categoria, Visual } from '../content/types';
import { L } from '../ui/labels';
import { CAT, FormaCategoria } from './CategoryBadge';

const W = 520;
const T = 36; // tamaño de texto en los visuales (px reales: el SVG se dibuja 1:1)
const C5 = 'var(--color-5)';
const C4 = 'var(--color-4)';
const C2 = 'var(--color-2)';
const C3 = 'var(--color-3)';
const LINEA = 'var(--linea)';

function Lienzo({ alto, desc, children }: { alto: number; desc: string; children: ReactNode }) {
  return (
    <svg className="apoyo" viewBox={`0 0 ${W} ${alto}`} width={W} height={alto} role="img" aria-label={desc}>
      {children}
    </svg>
  );
}

function Icono({ I, x, y, s = 56, color = C5, sw = 2 }: { I: LucideIcon; x: number; y: number; s?: number; color?: string; sw?: number }) {
  return <I x={x - s / 2} y={y - s / 2} width={s} height={s} color={color} strokeWidth={sw} aria-hidden="true" />;
}

function Texto({ x, y, children, anchor = 'start', color = C5, peso = 500 }: { x: number; y: number; children: ReactNode; anchor?: 'start' | 'middle' | 'end'; color?: string; peso?: number }) {
  return (
    <text x={x} y={y} fontSize={T} textAnchor={anchor} dominantBaseline="middle" style={{ fill: color, fontWeight: peso }}>
      {children}
    </text>
  );
}

function Flecha({ x1, y1, x2, y2, color = C5, doble = false }: { x1: number; y1: number; x2: number; y2: number; color?: string; doble?: boolean }) {
  const ang = Math.atan2(y2 - y1, x2 - x1);
  const punta = (x: number, y: number, a: number) => {
    const l = 18;
    return `${x},${y} ${x - l * Math.cos(a - 0.45)},${y - l * Math.sin(a - 0.45)} ${x - l * Math.cos(a + 0.45)},${y - l * Math.sin(a + 0.45)}`;
  };
  return (
    <g>
      <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={color} strokeWidth={4} strokeLinecap="round" />
      <polygon points={punta(x2, y2, ang)} fill={color} />
      {doble && <polygon points={punta(x1, y1, ang + Math.PI)} fill={color} />}
    </g>
  );
}

/** Filas de ícono + etiqueta: la forma más legible de asociar una pista con su función. */
function Filas({ filas, desc, color = C5 }: { filas: Array<{ I: LucideIcon; t: string; tachado?: boolean; c?: string }>; desc: string; color?: string }) {
  const paso = 112;
  const alto = filas.length * paso + 16;
  return (
    <Lienzo alto={alto} desc={desc}>
      {filas.map((f, i) => {
        const y = 56 + i * paso;
        const c = f.c ?? color;
        return (
          <g key={i}>
            <rect x={4} y={y - 48} width={96} height={96} rx={20} fill="none" stroke={c} strokeWidth={4} />
            <Icono I={f.I} x={52} y={y} color={c} s={52} />
            {f.tachado && <line x1={16} y1={y + 36} x2={88} y2={y - 36} stroke={C3} strokeWidth={8} strokeLinecap="round" />}
            <Texto x={128} y={y}>
              {f.t}
            </Texto>
          </g>
        );
      })}
    </Lienzo>
  );
}

function Ruta({ activos, desc }: { activos: number[]; desc: string }) {
  const pasos: Array<{ I: LucideIcon; t: string }> = [
    { I: Search, t: L.pasosCortos.encuentra },
    { I: Workflow, t: L.pasosCortos.explica },
    { I: Target, t: L.pasosCortos.reconoce },
    { I: CheckCircle2, t: L.pasosCortos.justifica },
  ];
  const paso = 150;
  return (
    <Lienzo alto={4 * paso} desc={desc}>
      <line x1={70} y1={70} x2={70} y2={70 + 3 * paso} stroke={LINEA} strokeWidth={6} />
      {pasos.map((p, i) => {
        const y = 70 + i * paso;
        const on = activos.includes(i + 1);
        return (
          <g key={i}>
            <circle cx={70} cy={y} r={58} fill={on ? C4 : 'var(--color-1)'} stroke={on ? C4 : LINEA} strokeWidth={5} />
            <Icono I={p.I} x={70} y={y} s={52} color={on ? 'var(--color-1)' : C5} sw={2.4} />
            <Texto x={156} y={y - 2} peso={on ? 700 : 500}>
              {`${i + 1}. ${p.t}`}
            </Texto>
          </g>
        );
      })}
    </Lienzo>
  );
}

function Intenciones({ desc }: { desc: string }) {
  const filas: Array<{ cat: Categoria; t: string }> = [
    { cat: 'informativo', t: L.intenciones.informar },
    { cat: 'interpretativo', t: L.intenciones.explicar },
    { cat: 'opinion', t: L.intenciones.opinar },
  ];
  return (
    <Lienzo alto={600} desc={desc}>
      <rect x={4} y={236} width={150} height={128} rx={16} fill="none" stroke={C5} strokeWidth={4} />
      <Icono I={FileText} x={79} y={280} s={52} />
      <Texto x={79} y={336} anchor="middle">
        {L.intenciones.hecho}
      </Texto>
      {filas.map((f, i) => {
        const y = 100 + i * 200;
        return (
          <g key={f.cat}>
            <Flecha x1={160} y1={300} x2={236} y2={y + (300 - y) * 0.15} />
            <FormaCategoria cat={f.cat} cx={300} cy={y} r={52} />
            <Texto x={376} y={y}>
              {f.t}
            </Texto>
          </g>
        );
      })}
    </Lienzo>
  );
}

function GenerosTrio({ desc }: { desc: string }) {
  const cats: Categoria[] = ['informativo', 'interpretativo', 'opinion'];
  return (
    <Lienzo alto={640} desc={desc}>
      {cats.map((cat, i) => {
        const y = 90 + i * 170;
        return (
          <g key={cat}>
            <FormaCategoria cat={cat} cx={80} cy={y} r={60} />
            <Texto x={172} y={y}>
              {L.categorias[cat]}
            </Texto>
          </g>
        );
      })}
      <Icono I={Scale} x={80} y={590} s={64} color={C4} />
    </Lienzo>
  );
}

function Categoria1({ cat, desc }: { cat: Categoria; desc: string }) {
  const pistas: Record<Categoria, LucideIcon[]> = {
    informativo: [CalendarDays, MapPin, User, Hash],
    interpretativo: [ArrowRight, ArrowLeftRight, Equal, Users],
    opinion: [User, Scale, Signpost, Target],
  };
  return (
    <Lienzo alto={560} desc={desc}>
      <FormaCategoria cat={cat} cx={260} cy={170} r={140} />
      <Texto x={260} y={380} anchor="middle" peso={700}>
        {L.categorias[cat]}
      </Texto>
      {pistas[cat].map((I, i) => (
        <g key={i}>
          <rect x={30 + i * 120} y={440} width={96} height={96} rx={20} fill="none" stroke={CAT[cat].color} strokeWidth={4} />
          <Icono I={I} x={78 + i * 120} y={488} s={50} color={CAT[cat].color} />
        </g>
      ))}
    </Lienzo>
  );
}

function PreguntasHecho({ desc }: { desc: string }) {
  const iconos = [HelpCircle, Users, CalendarDays, MapPin, Workflow];
  const cx = 260;
  const cy = 280;
  return (
    <Lienzo alto={560} desc={desc}>
      <circle cx={cx} cy={cy} r={90} fill={C2} />
      <Icono I={FileText} x={cx} y={cy - 12} s={64} color="var(--color-1)" />
      <text x={cx} y={cy + 50} fontSize={T} textAnchor="middle" dominantBaseline="middle" style={{ fill: 'var(--color-1)', fontWeight: 700 }}>
        {L.intenciones.hecho}
      </text>
      {iconos.map((I, i) => {
        const a = -Math.PI / 2 + (i * 2 * Math.PI) / 5;
        const x = cx + Math.cos(a) * 205;
        const y = cy + Math.sin(a) * 205;
        return (
          <g key={i}>
            <line x1={cx + Math.cos(a) * 96} y1={cy + Math.sin(a) * 96} x2={x - Math.cos(a) * 54} y2={y - Math.sin(a) * 54} stroke={LINEA} strokeWidth={4} />
            <circle cx={x} cy={y} r={52} fill="none" stroke={C5} strokeWidth={4} />
            <Icono I={I} x={x} y={y} s={48} />
          </g>
        );
      })}
    </Lienzo>
  );
}

function AutorPresente({ desc }: { desc: string }) {
  return (
    <Lienzo alto={560} desc={desc}>
      <Icono I={User} x={260} y={60} s={88} />
      <Texto x={260} y={140} anchor="middle">
        {L.visuales.autor}
      </Texto>
      <line x1={260} y1={180} x2={260} y2={470} stroke={C5} strokeWidth={6} />
      <line x1={80} y1={300} x2={440} y2={240} stroke={C5} strokeWidth={6} strokeLinecap="round" />
      <polygon points="260,470 200,520 320,520" fill={C5} />
      <rect x={20} y={300} width={140} height={100} rx={16} fill={C2} />
      <Icono I={BadgeCheck} x={90} y={350} s={56} color="var(--color-1)" />
      <Texto x={90} y={440} anchor="middle">
        {L.visuales.dato}
      </Texto>
      <rect x={380} y={186} width={120} height={60} rx={12} fill="none" stroke={LINEA} strokeWidth={4} />
      <Icono I={Scale} x={440} y={216} s={40} color={LINEA} />
    </Lienzo>
  );
}

function Relaciones({ desc }: { desc: string }) {
  const nodos = [
    { t: L.visuales.antecedente, y: 90 },
    { t: L.intenciones.hecho, y: 290 },
    { t: L.visuales.consecuencia, y: 490 },
  ];
  return (
    <Lienzo alto={600} desc={desc}>
      <rect x={10} y={10} width={500} height={580} rx={24} fill="none" stroke={C4} strokeWidth={3} strokeDasharray="12 10" />
      <Texto x={260} y={560} anchor="middle" color={C4}>
        {L.visuales.contexto}
      </Texto>
      {nodos.map((n, i) => (
        <g key={i}>
          <rect x={110} y={n.y - 50} width={300} height={100} fill={i === 1 ? C4 : 'none'} stroke={C4} strokeWidth={4} />
          <Texto x={260} y={n.y} anchor="middle" color={i === 1 ? 'var(--color-1)' : C5} peso={700}>
            {n.t}
          </Texto>
        </g>
      ))}
      <Flecha x1={260} y1={144} x2={260} y2={234} color={C4} />
      <Flecha x1={260} y1={344} x2={260} y2={434} color={C4} />
    </Lienzo>
  );
}

function ComparaInfoInterp({ desc }: { desc: string }) {
  return (
    <Lienzo alto={560} desc={desc}>
      {[0, 1, 2].map((i) => (
        <circle key={i} cx={110} cy={90 + i * 150} r={46} fill={C2} />
      ))}
      <Texto x={110} y={520} anchor="middle">
        {L.categorias.informativo}
      </Texto>
      {[0, 1, 2].map((i) => (
        <rect key={i} x={364} y={46 + i * 150} width={88} height={88} fill={C4} />
      ))}
      <Flecha x1={408} y1={140} x2={408} y2={190} color={C4} />
      <Flecha x1={408} y1={290} x2={408} y2={340} color={C4} />
      <path d="M 460 90 C 520 150, 520 330, 460 390" stroke={C4} strokeWidth={4} fill="none" />
      <Texto x={408} y={520} anchor="middle">
        {L.categorias.interpretativo}
      </Texto>
      <line x1={260} y1={40} x2={260} y2={470} stroke={LINEA} strokeWidth={3} />
    </Lienzo>
  );
}

function Postura({ desc }: { desc: string }) {
  return (
    <Lienzo alto={560} desc={desc}>
      <FormaCategoria cat="opinion" cx={260} cy={110} r={90} />
      <Texto x={260} y={250} anchor="middle" peso={700}>
        {L.visuales.postura}
      </Texto>
      <rect x={60} y={286} width={400} height={16} fill={C5} />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={80 + i * 140} y={302} width={80} height={170} fill="none" stroke={C5} strokeWidth={4} />
          <Icono I={Quote} x={120 + i * 140} y={387} s={40} />
        </g>
      ))}
      <Texto x={260} y={520} anchor="middle">
        {`3 × ${L.visuales.razon}`}
      </Texto>
    </Lienzo>
  );
}

function EstructuraOpinion({ desc }: { desc: string }) {
  const partes = [
    { t: L.visuales.introduccion, I: Flag },
    { t: L.visuales.desarrollo, I: Quote },
    { t: L.visuales.conclusion, I: Target },
  ];
  return (
    <Lienzo alto={560} desc={desc}>
      {partes.map((p, i) => {
        const y = 40 + i * 170;
        return (
          <g key={i}>
            <rect x={20} y={y} width={420} height={120} rx={16} fill="none" stroke={C5} strokeWidth={4} />
            <Icono I={p.I} x={80} y={y + 60} s={52} />
            <Texto x={130} y={y + 60}>
              {p.t}
            </Texto>
          </g>
        );
      })}
      <path d="M 440 440 C 510 440, 510 100, 450 100" stroke={C4} strokeWidth={5} fill="none" />
      <polygon points="442,100 462,88 462,112" fill={C4} />
    </Lienzo>
  );
}

function Puente({ desc }: { desc: string }) {
  return (
    <Lienzo alto={520} desc={desc}>
      <rect x={10} y={60} width={180} height={120} rx={16} fill="none" stroke={C5} strokeWidth={4} />
      <Texto x={100} y={120} anchor="middle">
        {L.visuales.ideaA} 1
      </Texto>
      <rect x={330} y={60} width={180} height={120} rx={16} fill="none" stroke={C5} strokeWidth={4} />
      <Texto x={420} y={120} anchor="middle">
        {L.visuales.ideaB} 2
      </Texto>
      <path d="M 190 150 Q 260 60 330 150" stroke={C4} strokeWidth={8} fill="none" />
      <Icono I={Signpost} x={260} y={240} s={80} color={C4} />
      {[
        { I: Plus, x: 60 },
        { I: ArrowRight, x: 160 },
        { I: ArrowLeftRight, x: 260 },
        { I: Equal, x: 360 },
        { I: Flag, x: 460 },
      ].map((f, i) => (
        <g key={i}>
          <circle cx={f.x} cy={400} r={44} fill="none" stroke={C4} strokeWidth={4} />
          <Icono I={f.I} x={f.x} y={400} s={44} color={C4} />
        </g>
      ))}
    </Lienzo>
  );
}

function LupaTexto({ cat, desc }: { cat: Categoria; desc: string }) {
  const color = CAT[cat].color;
  return (
    <Lienzo alto={560} desc={desc}>
      <rect x={20} y={20} width={380} height={480} rx={16} fill="var(--superficie-2)" />
      {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
        <g key={i}>
          <rect x={52} y={60 + i * 54} width={316} height={16} rx={8} fill={LINEA} />
          {[0, 3, 5, 7].includes(i) && <rect x={52 + (i % 3) * 60} y={54 + i * 54} width={150} height={28} rx={6} fill={color} />}
        </g>
      ))}
      <circle cx={380} cy={380} r={100} fill="none" stroke={C5} strokeWidth={10} />
      <line x1={450} y1={450} x2={505} y2={505} stroke={C5} strokeWidth={18} strokeLinecap="round" />
    </Lienzo>
  );
}

function UnaPista({ desc }: { desc: string }) {
  return (
    <Lienzo alto={560} desc={desc}>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <rect key={i} x={40 + (i % 3) * 150} y={40 + Math.floor(i / 3) * 150} width={110} height={110} rx={16} fill="none" stroke={i === 0 ? C5 : LINEA} strokeWidth={i === 0 ? 6 : 3} strokeDasharray={i === 0 ? undefined : '8 8'} />
      ))}
      <Icono I={Hash} x={95} y={95} s={56} />
      <Icono I={User} x={245} y={95} s={48} color={LINEA} />
      <Icono I={Scale} x={395} y={95} s={48} color={LINEA} />
      <Icono I={Signpost} x={95} y={245} s={48} color={LINEA} />
      <Icono I={Quote} x={245} y={245} s={48} color={LINEA} />
      <Icono I={Target} x={395} y={245} s={48} color={LINEA} />
      <Icono I={TriangleAlert} x={70} y={440} s={80} color={C3} sw={2.6} />
      <Texto x={140} y={440}>
        {L.visuales.unaPista}
      </Texto>
    </Lienzo>
  );
}

function VariasPistas({ desc }: { desc: string }) {
  const iconos = [Hash, User, Scale, Signpost];
  return (
    <Lienzo alto={560} desc={desc}>
      <circle cx={230} cy={220} r={190} fill="none" stroke={C5} strokeWidth={10} />
      <line x1={365} y1={355} x2={450} y2={440} stroke={C5} strokeWidth={22} strokeLinecap="round" />
      {iconos.map((I, i) => (
        <Icono key={i} I={I} x={160 + (i % 2) * 140} y={160 + Math.floor(i / 2) * 130} s={64} color={C4} />
      ))}
      <Icono I={CheckCircle2} x={60} y={510} s={64} color={C2} />
      <Texto x={110} y={510}>
        {L.visuales.variasPistas}
      </Texto>
    </Lienzo>
  );
}

function Completar({ cat, desc }: { cat?: Categoria; desc: string }) {
  const color = cat ? CAT[cat].color : C5;
  return (
    <Lienzo alto={480} desc={desc}>
      <rect x={20} y={40} width={200} height={64} rx={12} fill="none" stroke={C5} strokeWidth={4} strokeDasharray="10 8" />
      <rect x={250} y={56} width={250} height={32} rx={8} fill={LINEA} />
      <rect x={20} y={170} width={200} height={64} rx={32} fill={color} />
      <Flecha x1={120} y1={164} x2={120} y2={112} color={color} />
      <Icono I={Puzzle} x={260} y={370} s={140} color={color} sw={1.6} />
    </Lienzo>
  );
}

function DosTextos({ desc }: { desc: string }) {
  return (
    <Lienzo alto={560} desc={desc}>
      {[0, 1].map((k) => {
        const x = k === 0 ? 10 : 270;
        const color = k === 0 ? C2 : C4;
        return (
          <g key={k}>
            <rect x={x} y={20} width={240} height={420} rx={16} fill="var(--superficie-2)" />
            {[0, 1, 2].map((i) =>
              k === 0 ? (
                <circle key={i} cx={x + 120} cy={100 + i * 120} r={36} fill={color} />
              ) : (
                <rect key={i} x={x + 84} y={64 + i * 120} width={72} height={72} fill={color} />
              ),
            )}
            {k === 1 && (
              <>
                <Flecha x1={x + 120} y1={140} x2={x + 120} y2={180} color={C4} />
                <Flecha x1={x + 120} y1={260} x2={x + 120} y2={300} color={C4} />
              </>
            )}
            <Texto x={x + 120} y={500} anchor="middle" peso={700}>
              {k === 0 ? L.visuales.textoA : L.visuales.textoB}
            </Texto>
          </g>
        );
      })}
    </Lienzo>
  );
}

function DocumentoFuente({ desc }: { desc: string }) {
  const filas = [User, FileText, FolderOpen, CalendarDays];
  return (
    <Lienzo alto={560} desc={desc}>
      <rect x={20} y={20} width={480} height={520} rx={16} fill="var(--superficie-2)" />
      <FormaCategoria cat="opinion" cx={100} cy={110} r={56} />
      <rect x={180} y={80} width={280} height={24} rx={8} fill={C5} />
      <rect x={180} y={124} width={200} height={16} rx={8} fill={LINEA} />
      {filas.map((I, i) => (
        <g key={i}>
          <Icono I={I} x={90} y={240 + i * 80} s={48} color={C4} />
          <rect x={140} y={232 + i * 80} width={300 - i * 30} height={18} rx={8} fill={LINEA} />
        </g>
      ))}
    </Lienzo>
  );
}

function BalanzaPistas({ desc }: { desc: string }) {
  return (
    <Lienzo alto={560} desc={desc}>
      <polygon points="260,500 200,550 320,550" fill={C5} />
      <line x1={260} y1={120} x2={260} y2={500} stroke={C5} strokeWidth={6} />
      <line x1={60} y1={160} x2={460} y2={300} stroke={C5} strokeWidth={6} strokeLinecap="round" />
      <rect x={10} y={40} width={150} height={110} rx={16} fill={C2} />
      <Icono I={Hash} x={85} y={78} s={44} color="var(--color-1)" />
      <text x={85} y={126} fontSize={T} textAnchor="middle" dominantBaseline="middle" style={{ fill: 'var(--color-1)', fontWeight: 700 }}>
        {L.visuales.datos}
      </text>
      <rect x={300} y={300} width={210} height={170} rx={16} fill={C5} />
      <Icono I={Scale} x={360} y={350} s={48} color="var(--color-1)" />
      <Icono I={Signpost} x={450} y={350} s={48} color="var(--color-1)" />
      <text x={405} y={420} fontSize={T} textAnchor="middle" dominantBaseline="middle" style={{ fill: 'var(--color-1)', fontWeight: 700 }}>
        {L.visuales.postura}
      </text>
    </Lienzo>
  );
}

function Pregunta({ desc }: { desc: string }) {
  return (
    <Lienzo alto={520} desc={desc}>
      <Icono I={HelpCircle} x={260} y={130} s={200} color={C2} sw={1.6} />
      <Icono I={Target} x={120} y={390} s={72} color={C4} />
      <Texto x={180} y={390}>
        {L.pasosCortos.reconoce}
      </Texto>
    </Lienzo>
  );
}

/** Íconos por fila para la tabla de la Diapositiva 17 (pista → qué muestra). */
export const ICONOS_TABLA_17: LucideIcon[] = [Hash, User, Scale, Signpost, ArrowRight, Flag];

export function VisualSvg({ visual }: { visual: Visual }) {
  const d = visual.descripcion;
  const cat = visual.categoria;
  switch (visual.id) {
    case 'intenciones':
      return <Intenciones desc={d} />;
    case 'ruta':
      return <Ruta activos={[1, 2, 3, 4]} desc={d} />;
    case 'ruta-12':
      return <Ruta activos={[1, 2]} desc={d} />;
    case 'ruta-34':
      return <Ruta activos={[3, 4]} desc={d} />;
    case 'generos-trio':
      return <GenerosTrio desc={d} />;
    case 'preguntas-hecho':
      return <PreguntasHecho desc={d} />;
    case 'categoria':
      return <Categoria1 cat={cat ?? 'informativo'} desc={d} />;
    case 'autor-presente':
      return <AutorPresente desc={d} />;
    case 'relaciones':
      return <Relaciones desc={d} />;
    case 'compara-info-interp':
      return <ComparaInfoInterp desc={d} />;
    case 'postura':
      return <Postura desc={d} />;
    case 'estructura-opinion':
      return <EstructuraOpinion desc={d} />;
    case 'puente':
      return <Puente desc={d} />;
    case 'funciones-marcador':
      return (
        <Filas
          desc={d}
          color={C4}
          filas={[
            { I: Plus, t: L.visuales.agregar },
            { I: ArrowRight, t: L.visuales.causa },
            { I: ArrowLeftRight, t: L.visuales.contraste },
          ]}
        />
      );
    case 'funciones-marcador-2':
      return (
        <Filas
          desc={d}
          color={C4}
          filas={[
            { I: Equal, t: L.visuales.aclarar },
            { I: Flag, t: L.visuales.cerrar },
          ]}
        />
      );
    case 'pistas-1':
      return (
        <Filas
          desc={d}
          filas={[
            { I: Quote, t: L.visuales.fuente },
            { I: BadgeCheck, t: L.visuales.dato },
          ]}
        />
      );
    case 'pistas-2':
      return (
        <Filas
          desc={d}
          filas={[
            { I: Scale, t: L.visuales.valoracion },
            { I: User, t: L.visuales.autor },
            { I: Signpost, t: L.visuales.accion },
          ]}
        />
      );
    case 'lupa-texto':
      return <LupaTexto cat={cat ?? 'informativo'} desc={d} />;
    case 'pistas-encontradas':
      return (
        <Filas
          desc={d}
          color={C2}
          filas={[
            { I: Quote, t: L.visuales.fuente },
            { I: Hash, t: L.visuales.dato },
            { I: Plus, t: L.visuales.agregar },
            { I: Flag, t: L.visuales.cerrar },
            { I: Scale, t: L.visuales.sinValoracion, tachado: true, c: C5 },
          ]}
        />
      );
    case 'pistas-encontradas-interp':
      return (
        <Filas
          desc={d}
          color={C4}
          filas={[
            { I: Plus, t: L.visuales.agregar },
            { I: ArrowLeftRight, t: L.visuales.contraste },
            { I: Equal, t: L.visuales.aclarar },
            { I: Users, t: L.visuales.perspectivas },
          ]}
        />
      );
    case 'pistas-opinion':
      return (
        <Filas
          desc={d}
          filas={[
            { I: User, t: L.visuales.autor },
            { I: Scale, t: L.visuales.valoracion },
            { I: Users, t: L.visuales.nosotros },
            { I: Target, t: L.visuales.postura },
          ]}
        />
      );
    case 'autor-visible':
      return (
        <Filas
          desc={d}
          filas={[
            { I: User, t: L.visuales.autor },
            { I: Scale, t: L.visuales.valoracion },
          ]}
        />
      );
    case 'una-pista':
      return <UnaPista desc={d} />;
    case 'varias-pistas':
      return <VariasPistas desc={d} />;
    case 'completar':
      return <Completar cat={cat} desc={d} />;
    case 'dos-textos':
      return <DosTextos desc={d} />;
    case 'documento-fuente':
      return <DocumentoFuente desc={d} />;
    case 'balanza-pistas':
      return <BalanzaPistas desc={d} />;
    case 'pregunta':
      return <Pregunta desc={d} />;
    default:
      return null;
  }
}
