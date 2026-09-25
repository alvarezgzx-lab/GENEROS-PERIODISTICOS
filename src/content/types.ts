/** Tipos del modelo de contenido (src/content/slides.json). */

export type Estilo =
  | 'titulo'
  | 'subtitulo'
  | 'parrafo'
  | 'item'
  | 'numerado'
  | 'cita'
  | 'fuente'
  | 'destacado'
  | 'tabla-encabezado'
  | 'tabla-celda';

export interface Bloque {
  texto: string;
  /** Archivo y sección de origen, p. ej. "contenido.txt § Diapositiva 3". */
  fuente: string;
  estilo: Estilo;
  /** Columna de la tabla (0, 1…) para estilos de tabla. */
  col?: number;
  /** Columna de diseño para pantallas de dos o tres columnas. */
  zona?: 'izquierda' | 'derecha' | 'a' | 'b' | 'c';
}

export type Categoria = 'informativo' | 'interpretativo' | 'opinion';

export type PasoTrayecto = 'encuentra' | 'explica' | 'reconoce' | 'justifica';

export type FaseLgr = 'yo' | 'nosotros' | 'ustedes' | 'tu' | 'cierre';

export interface Falla {
  /** Etiqueta breve de la falla (tomada del guion) o null si el guion no la nombra. */
  etiqueta: string | null;
  /** Intervención docente propuesta por el guion (texto literal). */
  intervencion: string | null;
}

export interface Opcion {
  clave: string;
  texto: string;
  categoria?: Categoria | null;
}

interface ReactivoBase {
  id_reactivo: string;
  /** Etiqueta corta para el dashboard (interfaz). */
  etiqueta: string;
  paso_del_trayecto: PasoTrayecto;
  nivel_de_lectura: string | null;
  proceso_pisa: string | null;
  /** Categoría correcta para la matriz de confusión (si aplica). */
  categoria_correcta: Categoria | null;
  /** true cuando el tipo de interacción no lo indica el guion y se usó el predeterminado. */
  tipo_predeterminado: boolean;
}

export interface InteraccionSeleccion extends ReactivoBase {
  tipo: 'seleccion';
  enunciado: Bloque;
  multiple: boolean;
  opciones: Opcion[];
  /** Clave(s) correcta(s). null si el insumo no identifica respuesta correcta. */
  correcta: string[] | null;
  fallas: Record<string, Falla>;
  /** Selección de marcadores que justifican la respuesta (si el guion lo pide). */
  marcadores?: {
    titulo: Bloque;
    /** Expresiones seleccionables (literales del contenido). */
    opciones: string[];
    /** Expresiones que constituyen evidencia válida. */
    validas: string[];
    /** Número mínimo de evidencias válidas distintas para una justificación suficiente. */
    minimo: number;
    /** Etiquetas de las ranuras de evidencia (literales del contenido). */
    ranuras: Bloque[];
    /** Texto donde se seleccionan las expresiones, si se hace sobre el fragmento. */
    fragmento?: Bloque;
  };
}

export interface Hueco {
  antes: string;
  despues: string;
  correcta: string;
}

export interface InteraccionArrastre extends ReactivoBase {
  tipo: 'arrastre';
  /** Párrafos con huecos. Cada párrafo es una lista de huecos (texto antes, hueco, texto después). */
  parrafos: Hueco[][];
  banco: string[];
  bancoTitulo: Bloque;
  fuenteTexto: string;
  fallas: Record<string, Falla>;
}

export type Interaccion = InteraccionSeleccion | InteraccionArrastre;

export interface Visual {
  id: string;
  descripcion: string;
  categoria?: Categoria;
}

export interface Pantalla {
  id: number;
  segmento: string;
  diapositiva: number | null;
  fase_lgr: FaseLgr;
  duracion_s: number;
  tipo: 'contenido' | 'interactivo' | 'qr' | 'dashboard';
  titulo: Bloque | null;
  bloques: Bloque[];
  visual: Visual | null;
  interaccion: Interaccion | null;
  notas: string;
  revisar: string[];
  glosario: string[];
  diseno?: 'una-columna' | 'dos-columnas' | 'tres-columnas' | 'tabla';
}

export interface EntradaGlosario {
  termino: string;
  definicion: Bloque;
}

export interface ModeloSlides {
  titulo: string;
  duracion_total_s: number;
  pantallas: Pantalla[];
  glosario: EntradaGlosario[];
  intervenciones: Record<PasoTrayecto, { texto: string; fuente: string }>;
}
