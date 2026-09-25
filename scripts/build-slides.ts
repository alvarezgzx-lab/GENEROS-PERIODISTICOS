/**
 * Genera src/content/slides.json y src/content/seed.json a partir de las copias extraídas.
 *
 * Cada texto se toma literalmente de content/extracted/contenido.txt; la función `c()`
 * comprueba en tiempo de generación que el texto exista en la sección de origen.
 * Las notas del presentador se copian del guion (content/extracted/guion-docente.txt).
 *
 * Uso: npx tsx scripts/build-slides.ts
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EXTRACTED_DIR, ROOT } from './config.ts';
import type {
  Bloque,
  Estilo,
  FaseLgr,
  Hueco,
  Interaccion,
  ModeloSlides,
  Pantalla,
  Visual,
} from '../src/content/types.ts';

const contenido = readFileSync(path.join(EXTRACTED_DIR, 'contenido.txt'), 'utf8');
const guion = readFileSync(path.join(EXTRACTED_DIR, 'guion-docente.txt'), 'utf8');

function seccion(texto: string, n: number): string {
  const re = new RegExp(`^## Diapositiva ${n}\\. [\\s\\S]*?(?=^## |(?![\\s\\S]))`, 'm');
  const m = texto.match(re);
  if (!m) throw new Error(`No se encontró la Diapositiva ${n}`);
  return m[0];
}

const tituloDiapositiva = (n: number) =>
  seccion(contenido, n)
    .split('\n')[0]
    .replace(/^## Diapositiva \d+\. /, '');

/** Bloque de contenido literal de la Diapositiva n. */
function c(n: number, texto: string, estilo: Estilo = 'parrafo', extra: Partial<Bloque> = {}): Bloque {
  if (!seccion(contenido, n).includes(texto)) {
    throw new Error(`Texto no literal en Diapositiva ${n}: «${texto}»`);
  }
  return { texto, fuente: `contenido.txt § Diapositiva ${n}`, estilo, ...extra };
}

/** Verifica que un fragmento sea literal (para huecos, opciones y expresiones). */
function lit(n: number, texto: string): string {
  if (!seccion(contenido, n).includes(texto)) {
    throw new Error(`Fragmento no literal en Diapositiva ${n}: «${texto}»`);
  }
  return texto;
}

const titulo = (n: number): Bloque => c(n, tituloDiapositiva(n), 'titulo');

function notasGuion(n: number): string {
  return seccion(guion, n).trim();
}

const orientaciones = guion.slice(guion.indexOf('## Orientaciones para revisar las respuestas')).trim();

function guionLit(texto: string): string {
  if (!guion.includes(texto)) throw new Error(`Texto no literal en el guion: «${texto}»`);
  return texto;
}

// ---------------------------------------------------------------------------
// Fases de la liberación gradual (inferidas de las indicaciones del guion)
// ---------------------------------------------------------------------------
function fase(n: number): FaseLgr {
  if (n <= 10) return 'yo';
  if (n <= 17) return 'nosotros';
  if (n <= 19) return 'ustedes';
  return 'cierre';
}

const REVISAR_GLOBAL =
  '[REVISAR] El guion no indica duraciones; se asignaron 60 s por diapositiva (20 diapositivas = 20 min) repartidos entre sus pantallas.';
const REVISAR_FASE =
  '[REVISAR] El guion no nombra las fases de la liberación gradual; la fase se infirió de sus indicaciones (p. ej., «Voy a analizar», «Completemos», «Ahora realiza el procedimiento sin una explicación previa»).';

interface Borrador {
  diapositiva: number | null;
  tipo?: Pantalla['tipo'];
  titulo?: Bloque | null;
  bloques?: Bloque[];
  visual: Visual | null;
  interaccion?: Interaccion | null;
  revisar?: string[];
  glosario?: string[];
  diseno?: Pantalla['diseno'];
  notasExtra?: string;
}

const V = (id: string, descripcion: string, categoria?: Visual['categoria']): Visual => ({
  id,
  descripcion,
  ...(categoria ? { categoria } : {}),
});

const borradores: Borrador[] = [];
const add = (b: Borrador) => borradores.push(b);

// ---------------------------------------------------------------------------
// Diapositiva 1
// ---------------------------------------------------------------------------
add({
  diapositiva: 1,
  titulo: titulo(1),
  bloques: [
    c(
      1,
      'Los medios de comunicación publican textos sobre hechos y asuntos de interés para la sociedad. Sin embargo, no todos esos textos tienen la misma finalidad.',
    ),
    c(
      1,
      'Algunos se concentran en **informar**; otros buscan **explicar** los hechos y relacionarlos con sus causas o consecuencias; otros expresan una **opinión** y tratan de convencer al lector o invitarlo a reflexionar.',
    ),
  ],
  visual: V(
    'intenciones',
    'Tres flechas que salen de un mismo hecho hacia tres intenciones: informar, explicar y opinar, cada una con su ícono, forma y etiqueta.',
  ),
});
add({
  diapositiva: 1,
  titulo: titulo(1),
  bloques: [
    c(1, 'En esta lección aprenderás a:', 'subtitulo'),
    c(1, 'distinguir textos informativos, interpretativos y de opinión;', 'item'),
    c(1, 'reconocer palabras y expresiones que relacionan las ideas;', 'item'),
    c(1, 'identificar si el autor manifiesta una postura;', 'item'),
    c(1, 'justificar una clasificación con evidencias del texto.', 'item'),
  ],
  visual: V(
    'ruta',
    'Ruta de cuatro pasos (encontrar, explicar, reconocer, justificar) que anticipa lo que se hará en la lección.',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 2
// ---------------------------------------------------------------------------
add({
  diapositiva: 2,
  titulo: titulo(2),
  bloques: [
    c(
      2,
      'Los **géneros periodísticos** son distintas formas de presentar acontecimientos, ideas y asuntos de interés público en los medios de comunicación.',
    ),
    c(2, 'Cada género se organiza de acuerdo con la intención de quien escribe:'),
    c(2, 'comunicar lo que ocurrió;', 'item'),
    c(2, 'explicar por qué ocurrió o qué consecuencias puede tener;', 'item'),
    c(2, 'expresar una postura y defenderla mediante razones.', 'item'),
  ],
  visual: V(
    'intenciones',
    'Un mismo hecho y tres intenciones posibles de quien escribe: comunicar, explicar o expresar una postura.',
  ),
  glosario: ['géneros periodísticos'],
});
add({
  diapositiva: 2,
  titulo: titulo(2),
  bloques: [
    c(
      2,
      'Un texto puede combinar información, explicaciones y opiniones. Para clasificarlo debemos reconocer cuál de esas intenciones es la más importante.',
    ),
    c(2, 'Tres grandes grupos', 'subtitulo'),
    c(2, '1. Géneros informativos.', 'numerado'),
    c(2, '2. Géneros interpretativos.', 'numerado'),
    c(2, '3. Géneros de opinión.', 'numerado'),
  ],
  visual: V(
    'generos-trio',
    'Los tres grupos con su ícono, forma y etiqueta: informativo (círculo), interpretativo (cuadrado) y de opinión (triángulo). Una balanza indica que se busca la intención que predomina.',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 3
// ---------------------------------------------------------------------------
add({
  diapositiva: 3,
  titulo: titulo(3),
  bloques: [
    c(3, 'Los textos informativos tienen como propósito principal **dar a conocer hechos de interés público**.'),
    c(
      3,
      'Presentan acontecimientos, datos y declaraciones que pueden comprobarse. Generalmente responden preguntas como:',
    ),
    c(3, '¿qué ocurrió?;', 'item'),
    c(3, '¿quiénes participaron?;', 'item'),
    c(3, '¿cuándo y dónde sucedió?;', 'item'),
    c(3, '¿cómo se desarrollaron los hechos?', 'item'),
  ],
  visual: V(
    'preguntas-hecho',
    'Un hecho en el centro rodeado de los íconos de las preguntas qué, quiénes, cuándo, dónde y cómo.',
    'informativo',
  ),
});
add({
  diapositiva: 3,
  titulo: titulo(3),
  bloques: [
    c(3, 'Características principales', 'subtitulo'),
    c(3, 'Incluyen fechas, lugares, nombres y cifras.', 'item'),
    c(3, 'Identifican a las personas o instituciones que proporcionan la información.', 'item'),
    c(3, 'Emplean expresiones como **según**, **de acuerdo con**, **informó**, **señaló** o **explicó**.', 'item'),
    c(3, 'Evitan que la valoración personal del redactor sea el centro del texto.', 'item'),
    c(3, 'Organizan los acontecimientos de manera clara y ordenada.', 'item'),
  ],
  visual: V(
    'categoria',
    'Distintivo del género informativo (círculo con ícono de periódico) con las pistas que lo caracterizan: calendario, ubicación, persona y cifra.',
    'informativo',
  ),
});
add({
  diapositiva: 3,
  titulo: titulo(3),
  bloques: [
    c(
      3,
      'Que un texto informativo evite una valoración explícita no significa que carezca de autor. Significa que su propósito dominante es comunicar hechos verificables.',
      'destacado',
    ),
  ],
  visual: V(
    'autor-presente',
    'Una persona que escribe detrás del texto: el autor existe aunque su opinión no sea el centro; la balanza se inclina hacia los hechos verificables.',
    'informativo',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 4
// ---------------------------------------------------------------------------
add({
  diapositiva: 4,
  titulo: titulo(4),
  bloques: [
    c(4, 'Los textos interpretativos tienen como propósito principal **explicar y analizar los hechos**.'),
    c(
      4,
      'No se limitan a decir qué ocurrió. También presentan antecedentes, comparan perspectivas y establecen relaciones entre causas, consecuencias y contextos.',
    ),
  ],
  visual: V(
    'relaciones',
    'Red de nodos: antecedente → hecho → consecuencia, con un contexto que los rodea; las flechas muestran que el texto relaciona los datos.',
    'interpretativo',
  ),
});
add({
  diapositiva: 4,
  titulo: titulo(4),
  bloques: [
    c(4, 'Características principales', 'subtitulo'),
    c(4, 'Incluyen datos y fuentes de información.', 'item'),
    c(4, 'Explican por qué ocurrió un hecho o qué efectos puede producir.', 'item'),
    c(4, 'Comparan situaciones o puntos de vista.', 'item'),
    c(4, 'Aclaran el significado de cifras y acontecimientos.', 'item'),
    c(
      4,
      'Relacionan información mediante expresiones como **porque**, **por ello**, **sin embargo**, **por el contrario** y **es decir**.',
      'item',
    ),
    c(4, 'No necesitan presentar una opinión personal explícita del redactor.', 'item'),
  ],
  visual: V(
    'categoria',
    'Distintivo del género interpretativo (cuadrado con ícono de red) y las relaciones que construye: causa, contraste y aclaración.',
    'interpretativo',
  ),
});
add({
  diapositiva: 4,
  titulo: titulo(4),
  bloques: [
    c(
      4,
      'La diferencia principal es que el texto informativo comunica los hechos, mientras que el interpretativo los relaciona para ayudar al lector a comprender su significado.',
      'destacado',
    ),
  ],
  visual: V(
    'compara-info-interp',
    'Comparación: a la izquierda, datos sueltos en lista (informativo); a la derecha, los mismos datos unidos por flechas (interpretativo).',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 5
// ---------------------------------------------------------------------------
add({
  diapositiva: 5,
  titulo: titulo(5),
  bloques: [
    c(
      5,
      'Los textos de opinión tienen como propósito principal **expresar y defender una postura** sobre un asunto de interés público.',
    ),
    c(
      5,
      'El autor no solo presenta hechos: también los valora, propone una interpretación y ofrece razones para convencer al lector o invitarlo a reflexionar.',
    ),
  ],
  visual: V(
    'postura',
    'Una postura central sostenida por tres razones (columnas), con el autor visible junto a ella.',
    'opinion',
  ),
});
add({
  diapositiva: 5,
  titulo: titulo(5),
  bloques: [
    c(5, 'Características principales', 'subtitulo'),
    c(5, 'Presentan una postura o idea central.', 'item'),
    c(5, 'Desarrollan argumentos, ejemplos y evidencias.', 'item'),
    c(5, 'Pueden emplear la primera persona: **considero**, **pienso**, **valoro**, **me parece**.', 'item'),
    c(5, 'Utilizan palabras que expresan una valoración: **grave**, **acertado**, **injusto**, **necesario**.', 'item'),
    c(5, 'Pueden formular recomendaciones u obligaciones: **debe**, **hay que**, **conviene**, **urge**.', 'item'),
    c(5, 'Concluyen con una reflexión, una propuesta o un llamado a actuar.', 'item'),
  ],
  visual: V(
    'categoria',
    'Distintivo del género de opinión (triángulo con ícono de megáfono) y sus pistas: primera persona, valoración y recomendación.',
    'opinion',
  ),
});
add({
  diapositiva: 5,
  titulo: titulo(5),
  bloques: [
    c(5, 'Organización frecuente', 'subtitulo'),
    c(5, '**Introducción:** presenta el tema y la postura.'),
    c(5, '**Desarrollo:** expone razones, ejemplos y pruebas.'),
    c(5, '**Conclusión:** recupera la postura y puede proponer una acción o reflexión.'),
    c(
      5,
      'Un texto de opinión también puede contener datos y fuentes. La diferencia es que esos datos se utilizan para sostener una postura.',
      'destacado',
    ),
  ],
  visual: V(
    'estructura-opinion',
    'Tres bloques apilados (introducción, desarrollo, conclusión) con una flecha que regresa a la postura inicial.',
    'opinion',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 6
// ---------------------------------------------------------------------------
add({
  diapositiva: 6,
  titulo: titulo(6),
  bloques: [
    c(
      6,
      'Los **marcadores discursivos** son palabras o expresiones que conectan las partes de un texto y ayudan a comprender la relación entre sus ideas.',
    ),
    c(
      6,
      'Funcionan como señales que indican si una idea se agrega, se opone, explica, ejemplifica o concluye otra idea.',
    ),
  ],
  visual: V('puente', 'Dos ideas unidas por un puente-señal: el marcador indica qué tipo de relación hay entre ellas.'),
  glosario: ['marcadores discursivos'],
});
add({
  diapositiva: 6,
  titulo: titulo(6),
  bloques: [
    c(6, 'Para ordenar y agregar información', 'subtitulo'),
    c(6, '**en primer lugar**, **además**, **asimismo**, **por otra parte**, **por último**.'),
    c(6, 'Para expresar causa o consecuencia', 'subtitulo'),
    c(6, '**porque**, **debido a**, **por ello**, **por tanto**, **en consecuencia**.'),
    c(6, 'Para contrastar ideas', 'subtitulo'),
    c(6, '**pero**, **sin embargo**, **en cambio**, **por el contrario**, **aunque**.'),
  ],
  visual: V(
    'funciones-marcador',
    'Íconos de función: suma (agregar), flecha (causa y consecuencia) y flechas opuestas (contraste).',
  ),
  glosario: ['marcadores discursivos'],
});
add({
  diapositiva: 6,
  titulo: titulo(6),
  bloques: [
    c(6, 'Para explicar o presentar ejemplos', 'subtitulo'),
    c(6, '**es decir**, **en otras palabras**, **por ejemplo**, **en particular**.'),
    c(6, 'Para cerrar o resumir', 'subtitulo'),
    c(6, '**en conclusión**, **en suma**, **en fin**, **por último**.'),
    c(
      6,
      'Un marcador aislado no permite clasificar un texto. Es necesario observar qué ideas relaciona y qué intención ayuda a construir.',
      'destacado',
    ),
  ],
  visual: V(
    'funciones-marcador-2',
    'Íconos de función: signo de igualdad (explicar o aclarar) y bandera de meta (cerrar o resumir).',
  ),
  glosario: ['marcadores discursivos'],
  revisar: [
    '[REVISAR] «por último» aparece en dos grupos: «Para ordenar y agregar información» y «Para cerrar o resumir». Se muestra tal como viene.',
  ],
});

// ---------------------------------------------------------------------------
// Diapositiva 7
// ---------------------------------------------------------------------------
add({
  diapositiva: 7,
  titulo: titulo(7),
  bloques: [
    c(7, 'Además de los marcadores discursivos, existen otras pistas que permiten reconocer la intención de un texto.'),
    c(7, 'Atribución de información', 'subtitulo'),
    c(
      7,
      'Permite saber quién proporciona el dato: **según**, **de acuerdo con**, **informó**, **señaló**, **explicó**.',
    ),
    c(7, 'Datos verificables', 'subtitulo'),
    c(7, 'Pueden comprobarse: fechas, cifras, nombres, lugares, documentos y declaraciones.'),
  ],
  visual: V(
    'pistas-1',
    'Íconos de pista: comillas con persona (atribución) y marca de verificación sobre un dato (dato verificable).',
  ),
  glosario: ['atribución de información', 'datos verificables'],
});
add({
  diapositiva: 7,
  titulo: titulo(7),
  bloques: [
    c(7, 'Valoración', 'subtitulo'),
    c(
      7,
      'Expresa un juicio sobre una persona, hecho o situación: **grave**, **injusto**, **excelente**, **innecesario**, **un desastre**.',
    ),
    c(7, 'Presencia del autor', 'subtitulo'),
    c(
      7,
      'Hace visible su experiencia o punto de vista: **creo**, **considero**, **lo que más valoro**, **me parece**, **en mi experiencia**.',
    ),
    c(7, 'Obligación o recomendación', 'subtitulo'),
    c(7, 'Indica lo que debería hacerse: **debe**, **deben**, **hay que**, **conviene**, **urge**.'),
  ],
  visual: V(
    'pistas-2',
    'Íconos de pista: balanza (valoración), persona que habla (presencia del autor) y señal de indicación (obligación o recomendación).',
  ),
  glosario: ['valoración', 'presencia del autor'],
});

// ---------------------------------------------------------------------------
// Diapositiva 8
// ---------------------------------------------------------------------------
add({
  diapositiva: 8,
  titulo: titulo(8),
  bloques: [
    c(8, 'Primero: encuentra las pistas', 'subtitulo'),
    c(8, 'Localiza marcadores, datos, fuentes, valoraciones y expresiones que hagan visible al autor.'),
    c(8, 'Después: explica su función', 'subtitulo'),
    c(
      8,
      'Pregúntate si agregan información, establecen una causa, contrastan dos ideas, aclaran un dato, expresan una valoración o recomiendan una acción.',
    ),
  ],
  visual: V('ruta-12', 'Ruta de cuatro pasos con el paso 1 (encontrar) y el paso 2 (explicar) resaltados.'),
});
add({
  diapositiva: 8,
  titulo: titulo(8),
  bloques: [
    c(8, 'Luego: reconoce la intención principal', 'subtitulo'),
    c(8, 'Decide si el texto busca principalmente informar, explicar o expresar y defender una opinión.'),
    c(8, 'Finalmente: justifica tu respuesta', 'subtitulo'),
    c(
      8,
      'El texto pertenece al género __________ porque la expresión __________ indica __________ y la expresión __________ muestra __________.',
      'cita',
    ),
  ],
  visual: V('ruta-34', 'Ruta de cuatro pasos con el paso 3 (reconocer) y el paso 4 (justificar) resaltados.'),
});

// ---------------------------------------------------------------------------
// Diapositiva 9
// ---------------------------------------------------------------------------
add({
  diapositiva: 9,
  titulo: titulo(9),
  bloques: [
    c(9, 'Semana Nacional de Vacunación', 'subtitulo'),
    c(
      9,
      '**De acuerdo con las autoridades sanitarias**, la primera Semana Nacional de Vacunación de 2025 se desarrollaría entre el 26 de abril y el 3 de mayo. La meta era vacunar a **1.8 millones de personas**.',
    ),
    c(
      9,
      '**Asimismo**, se aplicarían las vacunas del esquema básico en hospitales, clínicas y escuelas. **Además**, las autoridades explicaron los beneficios de la vacunación. **Por último**, recordaron la importancia de la vacunación colectiva.',
    ),
  ],
  visual: V(
    'lupa-texto',
    'Lupa sobre el texto: las expresiones resaltadas son las pistas que se analizarán.',
    'informativo',
  ),
});
add({
  diapositiva: 9,
  titulo: titulo(9),
  bloques: [
    c(9, 'Análisis', 'subtitulo'),
    c(9, '**De acuerdo con las autoridades sanitarias** identifica la fuente de la información.', 'item'),
    c(9, '**1.8 millones de personas** es un dato verificable.', 'item'),
    c(9, '**Asimismo** y **además** agregan información.', 'item'),
    c(9, '**Por último** ordena el cierre de la explicación.', 'item'),
    c(9, 'No aparece una valoración personal explícita del redactor.', 'item'),
  ],
  visual: V(
    'pistas-encontradas',
    'Cada pista encontrada con el ícono de su función: fuente, dato verificable, agregar y cerrar; la valoración aparece ausente.',
    'informativo',
  ),
});
add({
  diapositiva: 9,
  titulo: titulo(9),
  bloques: [
    c(9, 'Conclusión', 'subtitulo'),
    c(9, 'El propósito principal es informar sobre las fechas, la meta y las acciones de una campaña de vacunación.'),
    c(9, '**Pertenece al género informativo.**', 'destacado'),
    c(
      9,
      'Texto adaptado de “Salud arranca la primera Semana Nacional de Vacunación de 2025”, Redacción Animal Político.',
      'fuente',
    ),
    c(9, 'https://grupoanimal.mx/salud/semana-nacional-vacunacion-2025-fecha', 'fuente'),
  ],
  visual: V('categoria', 'Distintivo del género informativo como conclusión del análisis.', 'informativo'),
});

// ---------------------------------------------------------------------------
// Diapositiva 10
// ---------------------------------------------------------------------------
add({
  diapositiva: 10,
  titulo: titulo(10),
  bloques: [
    c(10, 'Centros de datos en México', 'subtitulo'),
    c(
      10,
      'En México aumenta la llegada de centros de datos. **A su vez**, la transparencia sobre el uso de agua y energía no avanza al mismo ritmo.',
    ),
    c(
      10,
      '**Por el contrario**, el optimismo por las inversiones contrasta con la falta de una regulación específica. **Es decir**, el beneficio económico adquiere otro significado cuando se relaciona con sus posibles costos sociales y ambientales.',
    ),
    c(
      10,
      '**Sin embargo**, las autoridades, las empresas y los especialistas no valoran estos riesgos de la misma manera.',
    ),
  ],
  visual: V(
    'lupa-texto',
    'Lupa sobre el texto: las expresiones resaltadas son las pistas que se analizarán.',
    'interpretativo',
  ),
});
add({
  diapositiva: 10,
  titulo: titulo(10),
  bloques: [
    c(10, 'Análisis', 'subtitulo'),
    c(10, '**A su vez** incorpora otro aspecto del problema.', 'item'),
    c(10, '**Por el contrario** presenta un contraste.', 'item'),
    c(10, '**Es decir** aclara el significado de la información.', 'item'),
    c(10, '**Sin embargo** permite comparar distintas perspectivas.', 'item'),
    c(10, 'Los datos se relacionan para explicar un problema.', 'item'),
    c(10, 'No domina una valoración personal de los redactores.', 'item'),
  ],
  visual: V(
    'pistas-encontradas-interp',
    'Cada marcador con el ícono de su función: agregar, contrastar, aclarar y comparar perspectivas.',
    'interpretativo',
  ),
});
add({
  diapositiva: 10,
  titulo: titulo(10),
  bloques: [
    c(10, 'Conclusión', 'subtitulo'),
    c(
      10,
      'El propósito principal es explicar la relación entre las inversiones, la falta de regulación y el uso de recursos.',
    ),
    c(10, '**Pertenece al género interpretativo.**', 'destacado'),
    c(
      10,
      'Texto adaptado de “Centros de Datos se asientan en México entre falta de regulación, opacidad y optimismo por inversión”, Aline Corpus, Lorena Ríos y Gabriel Orihuela.',
      'fuente',
    ),
    c(10, 'https://grupoanimal.mx/sociedad/centros-datos-mexico-falta-regulacion-inversion', 'fuente'),
  ],
  visual: V('categoria', 'Distintivo del género interpretativo como conclusión del análisis.', 'interpretativo'),
});

// ---------------------------------------------------------------------------
// Diapositiva 11
// ---------------------------------------------------------------------------
add({
  diapositiva: 11,
  titulo: titulo(11),
  diseno: 'tabla',
  bloques: [
    c(11, 'Los dos textos anteriores contienen datos y fuentes. Sin embargo, los utilizan de manera diferente.'),
    c(11, 'Texto informativo', 'tabla-encabezado', { col: 0 }),
    c(11, 'Texto interpretativo', 'tabla-encabezado', { col: 1 }),
    c(11, 'Comunica qué ocurrió.', 'tabla-celda', { col: 0 }),
    c(11, 'Explica cómo se relacionan los hechos.', 'tabla-celda', { col: 1 }),
    c(11, 'Presenta datos y declaraciones.', 'tabla-celda', { col: 0 }),
    c(11, 'Compara datos, situaciones y perspectivas.', 'tabla-celda', { col: 1 }),
    c(11, 'Ordena la información.', 'tabla-celda', { col: 0 }),
    c(11, 'Establece causas, consecuencias, contrastes y contextos.', 'tabla-celda', { col: 1 }),
    c(11, 'Evita una valoración explícita del redactor.', 'tabla-celda', { col: 0 }),
    c(11, 'Puede explicar un problema sin expresar una postura personal.', 'tabla-celda', { col: 1 }),
  ],
  visual: V('encabezados-categoria', 'Cada columna de la tabla lleva el ícono, la forma y la etiqueta de su género.'),
});
add({
  diapositiva: 11,
  tipo: 'interactivo',
  titulo: titulo(11),
  bloques: [],
  visual: V('pregunta', 'Ícono de pregunta con la ruta de análisis: reconocer la intención con varias pistas.'),
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D11',
    etiqueta: 'D11',
    enunciado: c(11, '¿Por qué el texto sobre centros de datos es interpretativo?', 'subtitulo'),
    multiple: false,
    opciones: [
      { clave: 'A', texto: lit(11, 'Porque tiene un título y una fecha.'), categoria: null },
      { clave: 'B', texto: lit(11, 'Porque presenta cifras y nombres.'), categoria: null },
      {
        clave: 'C',
        texto: lit(11, 'Porque relaciona los hechos mediante contrastes, explicaciones y contexto.'),
        categoria: null,
      },
    ],
    correcta: ['C'],
    fallas: {
      A: { etiqueta: null, intervencion: null },
      B: {
        etiqueta: 'Clasifica por una cifra',
        intervencion: guionLit(
          'Es verdad que aparecen cifras, pero también aparecían en el texto informativo. Necesitamos una diferencia que no compartan.',
        ),
      },
    },
    paso_del_trayecto: 'reconoce',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: true,
  },
});
add({
  diapositiva: 11,
  titulo: titulo(11),
  bloques: [
    c(11, 'Respuesta', 'subtitulo'),
    c(
      11,
      '**C.** Las expresiones **por el contrario**, **es decir** y **sin embargo** relacionan la información para explicar su significado.',
      'destacado',
    ),
  ],
  visual: V('relaciones', 'Las tres expresiones como flechas que relacionan los datos del texto.', 'interpretativo'),
});

// ---------------------------------------------------------------------------
// Diapositiva 12
// ---------------------------------------------------------------------------
add({
  diapositiva: 12,
  titulo: titulo(12),
  bloques: [
    c(12, 'El futuro del turismo en México', 'subtitulo'),
    c(
      12,
      'José Ángel Díaz Rebolledo comenta la realización de un foro sobre el futuro del turismo. El autor informa quiénes participaron, pero también hace visible su valoración mediante expresiones como:',
    ),
    c(12, '**No exagero**.', 'item'),
    c(12, '**Lo que más valoro**.', 'item'),
    c(12, '**Nuestro papel**.', 'item'),
    c(12, '**Me quedo con la impresión**.', 'item'),
  ],
  visual: V('autor-visible', 'Un autor que se asoma al texto: sus expresiones personales lo hacen visible.', 'opinion'),
});
add({
  diapositiva: 12,
  titulo: titulo(12),
  bloques: [
    c(12, 'Análisis', 'subtitulo'),
    c(12, '**No exagero** refuerza una afirmación personal.', 'item'),
    c(12, '**Lo que más valoro** expresa claramente un juicio.', 'item'),
    c(12, '**Nuestro papel** muestra que el autor se incluye en el asunto.', 'item'),
    c(12, '**Me quedo con la impresión** comunica una conclusión personal.', 'item'),
    c(12, 'El acontecimiento funciona como punto de partida para defender una postura.', 'item'),
  ],
  visual: V(
    'pistas-opinion',
    'Cada expresión con el ícono de lo que muestra: afirmación personal, juicio, inclusión del autor y conclusión personal.',
    'opinion',
  ),
});
add({
  diapositiva: 12,
  titulo: titulo(12),
  bloques: [
    c(12, 'Conclusión', 'subtitulo'),
    c(
      12,
      'El propósito principal es valorar la importancia del encuentro y defender una visión sobre el futuro del turismo.',
    ),
    c(12, '**Pertenece al género de opinión.**', 'destacado'),
    c(
      12,
      'Ejemplo tomado de “La agenda impostergable y el futuro del turismo en México”, José Ángel Díaz Rebolledo.',
      'fuente',
    ),
    c(
      12,
      'https://www.eluniversal.com.mx/opinion/articulista-invitado/la-agenda-impostergable-y-el-futuro-del-turismo-en-mexico/',
      'fuente',
    ),
  ],
  visual: V('categoria', 'Distintivo del género de opinión como conclusión del análisis.', 'opinion'),
});

// ---------------------------------------------------------------------------
// Diapositiva 13
// ---------------------------------------------------------------------------
add({
  diapositiva: 13,
  tipo: 'interactivo',
  titulo: c(13, 'Cuidado con las pistas aisladas', 'titulo'),
  bloques: [
    c(13, 'Un lector afirmó:'),
    c(
      13,
      '“El texto sobre turismo menciona un foro, participantes y hechos reales. Por eso debe ser informativo.”',
      'cita',
    ),
  ],
  visual: V(
    'una-pista',
    'Una sola pista iluminada frente a varias pistas ignoradas: clasificar con una sola pista lleva a error.',
  ),
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D13',
    etiqueta: 'D13',
    enunciado: c(13, '¿Qué error cometió?', 'subtitulo'),
    multiple: false,
    opciones: [
      { clave: 'A', texto: lit(13, 'Pensó que los textos de opinión nunca tienen datos.'), categoria: null },
      { clave: 'B', texto: lit(13, 'Clasificó el texto utilizando una sola pista.'), categoria: null },
      { clave: 'C', texto: lit(13, 'Supuso que todos los textos firmados son interpretativos.'), categoria: null },
    ],
    correcta: ['B'],
    fallas: {
      A: { etiqueta: null, intervencion: null },
      C: { etiqueta: null, intervencion: null },
    },
    paso_del_trayecto: 'justifica',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: true,
  },
});
add({
  diapositiva: 13,
  titulo: c(13, 'Cuidado con las pistas aisladas', 'titulo'),
  bloques: [
    c(13, 'Respuesta', 'subtitulo'),
    c(13, '**B. Clasificó el texto utilizando una sola pista.**', 'destacado'),
    c(
      13,
      'El texto contiene información sobre un hecho real, pero también presenta primera persona, valoraciones, una interpretación personal y una conclusión que orienta al lector.',
    ),
    c(
      13,
      'Los datos pueden aparecer en los tres tipos de textos. Para clasificarlos hay que reconocer qué intención domina.',
      'cita',
    ),
  ],
  visual: V('varias-pistas', 'Varias pistas reunidas bajo una lupa: la intención se reconoce al combinarlas.'),
});

// ---------------------------------------------------------------------------
// Diapositiva 14
// ---------------------------------------------------------------------------
const H = (antes: string, despues: string, correcta: string): Hueco => ({ antes, despues, correcta });

add({
  diapositiva: 14,
  tipo: 'interactivo',
  titulo: titulo(14),
  bloques: [c(14, 'Texto A', 'subtitulo')],
  visual: null,
  interaccion: {
    tipo: 'arrastre',
    id_reactivo: 'D14-A',
    etiqueta: 'D14 · A',
    parrafos: [
      [
        H(
          '',
          lit(14, ' las autoridades sanitarias, la meta de la campaña era vacunar a 1.8 millones de personas.'),
          'De acuerdo con',
        ),
      ],
      [
        H(
          '',
          lit(14, ', se aplicarían las vacunas del esquema básico en hospitales, clínicas y escuelas.'),
          'Asimismo',
        ),
      ],
      [H('', lit(14, ', las autoridades recordaron la importancia de la vacunación colectiva.'), 'Por último')],
    ],
    banco: [lit(14, 'Asimismo'), lit(14, 'Por último'), lit(14, 'De acuerdo con')],
    bancoTitulo: c(14, '**Banco de palabras:**', 'subtitulo'),
    fuenteTexto: 'contenido.txt § Diapositiva 14 (respuestas: § Diapositiva 15)',
    fallas: {},
    paso_del_trayecto: 'explica',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: false,
  },
});
add({
  diapositiva: 14,
  tipo: 'interactivo',
  titulo: titulo(14),
  bloques: [c(14, 'Texto B', 'subtitulo')],
  visual: null,
  interaccion: {
    tipo: 'arrastre',
    id_reactivo: 'D14-B',
    etiqueta: 'D14 · B',
    parrafos: [
      [H('', lit(14, ', el optimismo por las inversiones contrasta con la falta de regulación.'), 'Por el contrario')],
      [
        H(
          '',
          lit(
            14,
            ', las cifras económicas deben relacionarse con el consumo de agua y energía para comprender su importancia.',
          ),
          'Es decir',
        ),
      ],
      [
        H(
          '',
          lit(14, ', algunas autoridades consideran que los riesgos pueden atenderse mediante nuevas tecnologías.'),
          'Sin embargo',
        ),
      ],
    ],
    banco: [lit(14, 'Sin embargo'), lit(14, 'Por el contrario'), lit(14, 'Es decir')],
    bancoTitulo: c(14, '**Banco de palabras:**', 'subtitulo'),
    fuenteTexto: 'contenido.txt § Diapositiva 14 (respuestas: § Diapositiva 15)',
    fallas: {},
    paso_del_trayecto: 'explica',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: false,
  },
});
add({
  diapositiva: 14,
  tipo: 'interactivo',
  titulo: titulo(14),
  bloques: [c(14, 'Después de completar', 'subtitulo')],
  visual: V('dos-textos', 'Dos documentos, A y B: uno con datos en lista y otro con datos unidos por flechas.'),
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D14-1',
    etiqueta: 'D14 · 1',
    enunciado: c(14, '1. ¿Cuál texto se concentra en presentar información?', 'parrafo'),
    multiple: false,
    opciones: [
      { clave: 'A', texto: lit(14, 'Texto A'), categoria: null },
      { clave: 'B', texto: lit(14, 'Texto B'), categoria: null },
    ],
    correcta: ['A'],
    fallas: { B: { etiqueta: null, intervencion: null } },
    paso_del_trayecto: 'reconoce',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: true,
  },
});
add({
  diapositiva: 14,
  tipo: 'interactivo',
  titulo: titulo(14),
  bloques: [c(14, '3. ¿Qué función cumple cada expresión?', 'parrafo')],
  visual: V('dos-textos', 'Dos documentos, A y B: uno con datos en lista y otro con datos unidos por flechas.'),
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D14-2',
    etiqueta: 'D14 · 2',
    enunciado: c(14, '2. ¿Cuál relaciona los hechos para explicar un problema?', 'parrafo'),
    multiple: false,
    opciones: [
      { clave: 'A', texto: lit(14, 'Texto A'), categoria: null },
      { clave: 'B', texto: lit(14, 'Texto B'), categoria: null },
    ],
    correcta: ['B'],
    fallas: { A: { etiqueta: null, intervencion: null } },
    paso_del_trayecto: 'reconoce',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: true,
  },
});

// ---------------------------------------------------------------------------
// Diapositiva 15
// ---------------------------------------------------------------------------
add({
  diapositiva: 15,
  titulo: titulo(15),
  bloques: [
    c(15, 'Texto A', 'subtitulo'),
    c(
      15,
      '**De acuerdo con** las autoridades sanitarias, la meta de la campaña era vacunar a 1.8 millones de personas.',
    ),
    c(15, '**Asimismo**, se aplicarían las vacunas del esquema básico en hospitales, clínicas y escuelas.'),
    c(15, '**Por último**, las autoridades recordaron la importancia de la vacunación colectiva.'),
  ],
  visual: V(
    'lupa-texto',
    'Lupa sobre el texto completado: las expresiones resaltadas son las respuestas.',
    'informativo',
  ),
});
add({
  diapositiva: 15,
  titulo: titulo(15),
  bloques: [
    c(15, 'Texto A', 'subtitulo'),
    c(15, '**De acuerdo con** identifica la fuente.', 'item'),
    c(15, '**Asimismo** agrega información.', 'item'),
    c(15, '**Por último** ordena el cierre.', 'item'),
    c(15, 'El propósito principal es **informar**.', 'destacado'),
  ],
  visual: V(
    'categoria',
    'Distintivo del género informativo con las funciones de fuente, agregar y cerrar.',
    'informativo',
  ),
});
add({
  diapositiva: 15,
  titulo: titulo(15),
  bloques: [
    c(15, 'Texto B', 'subtitulo'),
    c(15, '**Por el contrario**, el optimismo por las inversiones contrasta con la falta de regulación.'),
    c(
      15,
      '**Es decir**, las cifras económicas deben relacionarse con el consumo de agua y energía para comprender su importancia.',
    ),
    c(
      15,
      '**Sin embargo**, algunas autoridades consideran que los riesgos pueden atenderse mediante nuevas tecnologías.',
    ),
  ],
  visual: V(
    'lupa-texto',
    'Lupa sobre el texto completado: las expresiones resaltadas son las respuestas.',
    'interpretativo',
  ),
});
add({
  diapositiva: 15,
  titulo: titulo(15),
  bloques: [
    c(15, 'Texto B', 'subtitulo'),
    c(15, '**Por el contrario** establece un contraste.', 'item'),
    c(15, '**Es decir** aclara una idea.', 'item'),
    c(15, '**Sin embargo** confronta otra perspectiva.', 'item'),
    c(15, 'El propósito principal es **explicar e interpretar**.', 'destacado'),
  ],
  visual: V(
    'categoria',
    'Distintivo del género interpretativo con las funciones de contrastar, aclarar y confrontar.',
    'interpretativo',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 16
// ---------------------------------------------------------------------------
const bancoVolaris = [
  lit(16, 'deben hacer'),
  lit(16, 'experiencia personal'),
  lit(16, 'un desastre'),
  lit(16, 'debe poner'),
  lit(16, 'deben ser enviados'),
  lit(16, 'deben analizar y actuar'),
];
add({
  diapositiva: 16,
  titulo: titulo(16),
  bloques: [
    c(16, 'Al “deshuesadero” aviones de Volaris', 'subtitulo'),
    c(16, '**Autor:** Daniel Rodríguez'),
    c(16, '**Medio:** *El Informador*'),
    c(16, '**Sección:** Ideas'),
    c(16, '**Fecha:** 19 de marzo de 2024'),
    c(16, 'Completa el fragmento con las expresiones del banco.', 'destacado'),
    c(16, 'Texto tomado de la actividad del libro base.', 'fuente'),
    c(16, 'https://www.informador.mx/ideas/Al-deshuesadero-aviones-de-Volaris-20240319-0031.html', 'fuente'),
  ],
  visual: V(
    'documento-fuente',
    'Ficha de un artículo con autor, medio, sección y fecha: datos que identifican quién escribe y dónde se publicó.',
    'opinion',
  ),
});
add({
  diapositiva: 16,
  tipo: 'interactivo',
  titulo: titulo(16),
  bloques: [],
  visual: null,
  diseno: 'una-columna',
  interaccion: {
    tipo: 'arrastre',
    id_reactivo: 'D16-1',
    etiqueta: 'D16 · 1',
    parrafos: [
      [
        H(
          lit(
            16,
            'Las autoridades de aeronáutica civil de Estados Unidos han iniciado una investigación de los incidentes con varias aerolíneas. Y precisamente es lo mismo que',
          ),
          lit(16, ' las autoridades aquí en México.'),
          'deben hacer',
        ),
        H(
          lit(16, 'Esto lo comento por una'),
          lit(16, ' del pasado 9 de marzo en un vuelo de Volaris.'),
          'experiencia personal',
        ),
      ],
      [H(lit(16, 'Total,'), lit(16, ' de aparato en lo que se refiere al mantenimiento.'), 'un desastre')],
    ],
    banco: bancoVolaris,
    bancoTitulo: c(16, 'Banco de expresiones', 'subtitulo'),
    fuenteTexto: 'contenido.txt § Diapositiva 16 (respuestas: § Diapositiva 17)',
    fallas: {},
    paso_del_trayecto: 'encuentra',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: false,
  },
});
add({
  diapositiva: 16,
  tipo: 'interactivo',
  titulo: titulo(16),
  bloques: [],
  visual: null,
  diseno: 'una-columna',
  interaccion: {
    tipo: 'arrastre',
    id_reactivo: 'D16-2',
    etiqueta: 'D16 · 2',
    parrafos: [
      [
        H(
          lit(16, 'Volaris, que acaba de cumplir 18 años y cuenta con 132 naves en servicio,'),
          lit(16, ' mucha atención en el servicio y mantenimiento de sus aviones.'),
          'debe poner',
        ),
      ],
      [
        H(
          lit(16, 'Esos aviones que ya no se encuentren en condiciones apropiadas'),
          lit(16, ' al ‘deshuesadero’.'),
          'deben ser enviados',
        ),
      ],
      [
        H(
          lit(16, 'Quienes están al frente de Volaris'),
          lit(16, ' de inmediato a favor de la seguridad de los pasajeros.'),
          'deben analizar y actuar',
        ),
      ],
    ],
    banco: bancoVolaris,
    bancoTitulo: c(16, 'Banco de expresiones', 'subtitulo'),
    fuenteTexto: 'contenido.txt § Diapositiva 16 (respuestas: § Diapositiva 17)',
    fallas: {},
    paso_del_trayecto: 'encuentra',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: null,
    tipo_predeterminado: false,
  },
});

// ---------------------------------------------------------------------------
// Diapositiva 17
// ---------------------------------------------------------------------------
add({
  diapositiva: 17,
  titulo: titulo(17),
  diseno: 'tabla',
  bloques: [
    c(17, 'Respuestas', 'subtitulo'),
    c(
      17,
      '**deben hacer** — **experiencia personal** — **un desastre** — **debe poner** — **deben ser enviados** — **deben analizar y actuar**.',
    ),
    c(17, 'Pista del texto', 'tabla-encabezado', { col: 0 }),
    c(17, '¿Qué muestra?', 'tabla-encabezado', { col: 1 }),
    c(17, '18 años, 132 naves y más de 33 millones de pasajeros', 'tabla-celda', { col: 0 }),
    c(17, 'Datos verificables', 'tabla-celda', { col: 1 }),
    c(17, '**experiencia personal**', 'tabla-celda', { col: 0 }),
    c(17, 'Presencia del autor', 'tabla-celda', { col: 1 }),
    c(17, '**un desastre**', 'tabla-celda', { col: 0 }),
    c(17, 'Valoración', 'tabla-celda', { col: 1 }),
    c(17, '**debe poner**', 'tabla-celda', { col: 0 }),
    c(17, 'Recomendación', 'tabla-celda', { col: 1 }),
    c(17, '**deben ser enviados**', 'tabla-celda', { col: 0 }),
    c(17, 'Propuesta de acción', 'tabla-celda', { col: 1 }),
    c(17, '**deben analizar y actuar**', 'tabla-celda', { col: 0 }),
    c(17, 'Obligación o llamado a actuar', 'tabla-celda', { col: 1 }),
  ],
  visual: V(
    'iconos-tabla',
    'Cada fila de la tabla lleva el ícono de lo que muestra la pista: dato, autor, valoración, recomendación, propuesta y llamado a actuar.',
  ),
  revisar: [
    '[REVISAR] La tabla cita «más de 33 millones de pasajeros», dato que no aparece en el fragmento de la Diapositiva 16. Se muestra tal como viene.',
  ],
});
add({
  diapositiva: 17,
  tipo: 'interactivo',
  titulo: titulo(17),
  bloques: [],
  visual: V(
    'balanza-pistas',
    'Balanza: de un lado los datos verificables; del otro, la valoración y las recomendaciones, que pesan más.',
  ),
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D17',
    etiqueta: 'D17',
    enunciado: c(17, '¿Cuál es la intención principal del texto?', 'subtitulo'),
    multiple: false,
    opciones: [
      { clave: 'A', texto: lit(17, 'Informar cuántos aviones y pasajeros tiene Volaris.'), categoria: 'informativo' },
      {
        clave: 'B',
        texto: lit(17, 'Explicar de manera neutral el crecimiento de la empresa.'),
        categoria: 'interpretativo',
      },
      {
        clave: 'C',
        texto: lit(17, 'Valorar el estado de los aviones y pedir que se tomen medidas.'),
        categoria: 'opinion',
      },
    ],
    correcta: ['C'],
    fallas: {
      A: {
        etiqueta: 'Clasifica por una cifra',
        intervencion: guionLit('¿Las cifras tienen mayor peso que la valoración y las recomendaciones?'),
      },
      B: {
        etiqueta: null,
        intervencion: guionLit('El texto presenta antecedentes, pero ¿mantiene una explicación neutral?'),
      },
    },
    paso_del_trayecto: 'reconoce',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: 'opinion',
    tipo_predeterminado: true,
  },
});
add({
  diapositiva: 17,
  titulo: titulo(17),
  bloques: [
    c(17, 'Respuesta', 'subtitulo'),
    c(
      17,
      '**C.** Las cifras proporcionan información, pero la experiencia personal, la valoración y las recomendaciones muestran que el autor defiende una postura.',
    ),
    c(17, '**Pertenece al género de opinión.**', 'destacado'),
  ],
  visual: V('categoria', 'Distintivo del género de opinión como conclusión del análisis.', 'opinion'),
});

// ---------------------------------------------------------------------------
// Diapositiva 18
// ---------------------------------------------------------------------------
const fragmento18 = c(
  18,
  'En México crece la instalación de centros de datos. **Por el contrario**, las reglas para vigilar su funcionamiento no avanzan al mismo ritmo. Su llegada promete inversiones; **sin embargo**, también despierta preguntas sobre el consumo de agua y energía. **Es decir**, para comprender su importancia es necesario considerar tanto los beneficios como los posibles costos.',
  'cita',
);
add({
  diapositiva: 18,
  tipo: 'interactivo',
  titulo: titulo(18),
  diseno: 'dos-columnas',
  bloques: [c(18, 'Lee el siguiente fragmento:', 'parrafo', { zona: 'izquierda' })],
  visual: null,
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D18',
    etiqueta: 'D18',
    enunciado: c(18, '¿A qué género pertenece?', 'subtitulo'),
    multiple: false,
    opciones: [
      {
        clave: 'A',
        texto: lit(18, 'Informativo, porque únicamente comunica hechos separados.'),
        categoria: 'informativo',
      },
      {
        clave: 'B',
        texto: lit(18, 'Interpretativo, porque relaciona beneficios, problemas y consecuencias.'),
        categoria: 'interpretativo',
      },
      {
        clave: 'C',
        texto: lit(18, 'De opinión, porque toda comparación expresa una postura personal.'),
        categoria: 'opinion',
      },
    ],
    correcta: ['B'],
    fallas: {
      A: { etiqueta: null, intervencion: null },
      C: { etiqueta: null, intervencion: null },
    },
    marcadores: {
      titulo: c(18, 'Justifica', 'subtitulo'),
      fragmento: fragmento18,
      opciones: [
        lit(18, 'crece la instalación de centros de datos'),
        lit(18, 'Por el contrario'),
        lit(18, 'promete inversiones'),
        lit(18, 'sin embargo'),
        lit(18, 'Es decir'),
      ],
      validas: ['Por el contrario', 'sin embargo', 'Es decir'],
      minimo: 2,
      ranuras: [c(18, '**Primera evidencia:**', 'parrafo'), c(18, '**Segunda evidencia:**', 'parrafo')],
    },
    paso_del_trayecto: 'reconoce',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: 'interpretativo',
    tipo_predeterminado: true,
  },
});
add({
  diapositiva: 18,
  titulo: titulo(18),
  bloques: [
    c(18, 'Respuesta para revisión', 'subtitulo'),
    c(
      18,
      '**B. Interpretativo.** Las expresiones **por el contrario** y **sin embargo** contrastan distintas situaciones. **Es decir** aclara cómo deben relacionarse los datos para comprender el problema.',
      'destacado',
    ),
  ],
  visual: V(
    'relaciones',
    'Las expresiones como flechas que contrastan y aclaran la relación entre los datos.',
    'interpretativo',
  ),
});

// ---------------------------------------------------------------------------
// Diapositiva 19
// ---------------------------------------------------------------------------
add({
  diapositiva: 19,
  tipo: 'interactivo',
  titulo: titulo(19),
  diseno: 'dos-columnas',
  bloques: [
    c(
      19,
      'En el texto sobre Volaris aparecen cifras sobre la empresa, pero también expresiones como **experiencia personal**, **un desastre**, **debe** y **deben actuar**.',
      'parrafo',
      { zona: 'izquierda' },
    ),
  ],
  visual: null,
  interaccion: {
    tipo: 'seleccion',
    id_reactivo: 'D19',
    etiqueta: 'D19',
    enunciado: c(19, '¿Cuál es su propósito principal?', 'subtitulo'),
    multiple: false,
    opciones: [
      {
        clave: 'A',
        texto: lit(19, 'Informar sobre la cantidad de aviones sin expresar una valoración.'),
        categoria: 'informativo',
      },
      {
        clave: 'B',
        texto: lit(19, 'Explicar de forma neutral las causas del crecimiento de Volaris.'),
        categoria: 'interpretativo',
      },
      {
        clave: 'C',
        texto: lit(19, 'Valorar las condiciones de los aviones y plantear la necesidad de actuar.'),
        categoria: 'opinion',
      },
    ],
    correcta: ['C'],
    fallas: {
      A: { etiqueta: null, intervencion: null },
      B: { etiqueta: null, intervencion: null },
    },
    marcadores: {
      titulo: c(19, 'Completa tu respuesta', 'subtitulo'),
      opciones: [
        lit(19, 'cifras sobre la empresa'),
        lit(19, 'experiencia personal'),
        lit(19, 'un desastre'),
        lit(19, 'debe'),
        lit(19, 'deben actuar'),
      ],
      validas: ['experiencia personal', 'un desastre', 'debe', 'deben actuar'],
      minimo: 2,
      ranuras: [c(19, 'porque la expresión', 'parrafo'), c(19, 'Además, la expresión', 'parrafo')],
    },
    paso_del_trayecto: 'justifica',
    nivel_de_lectura: null,
    proceso_pisa: null,
    categoria_correcta: 'opinion',
    tipo_predeterminado: true,
  },
  revisar: [
    '[REVISAR] El contenido cita «deben actuar», pero el fragmento de Volaris dice «deben analizar y actuar». Se muestra tal como viene.',
    '[REVISAR] La fórmula de respuesta de esta diapositiva («…muestra… Además, la expresión… indica…») difiere de la de la Diapositiva 8 («…indica… y la expresión… muestra…»).',
  ],
});
add({
  diapositiva: 19,
  titulo: titulo(19),
  bloques: [
    c(19, 'Respuesta para revisión', 'subtitulo'),
    c(19, '**C. Género de opinión.**', 'destacado'),
    c(
      19,
      'El texto pertenece al género de opinión porque la expresión **un desastre** muestra una valoración negativa. Además, la expresión **deben analizar y actuar** indica que el autor considera necesaria una acción.',
      'cita',
    ),
  ],
  visual: V('categoria', 'Distintivo del género de opinión como conclusión justificada.', 'opinion'),
});

// ---------------------------------------------------------------------------
// QR: el guion no indica el momento; se ubica antes del cierre.
// ---------------------------------------------------------------------------
add({
  diapositiva: null,
  tipo: 'qr',
  titulo: null,
  bloques: [],
  visual: V('qr', 'Código QR proporcionado que abre la ficha de práctica independiente en Google Drive.'),
  revisar: [
    '[REVISAR] El guion no indica en qué momento se comparte la ficha de práctica independiente; la pantalla del QR se colocó antes del cierre y sin duración asignada.',
  ],
});

// ---------------------------------------------------------------------------
// Diapositiva 20
// ---------------------------------------------------------------------------
add({
  diapositiva: 20,
  titulo: titulo(20),
  diseno: 'tres-columnas',
  bloques: [
    c(20, 'Género informativo', 'subtitulo', { zona: 'a' }),
    c(20, 'Da a conocer hechos.', 'item', { zona: 'a' }),
    c(20, 'Presenta datos y fuentes.', 'item', { zona: 'a' }),
    c(20, 'Evita que la valoración personal sea el centro del texto.', 'item', { zona: 'a' }),
    c(20, 'Género interpretativo', 'subtitulo', { zona: 'b' }),
    c(20, 'Explica y analiza los hechos.', 'item', { zona: 'b' }),
    c(20, 'Relaciona causas, consecuencias, contrastes y contextos.', 'item', { zona: 'b' }),
    c(20, 'Ayuda a comprender el significado de la información.', 'item', { zona: 'b' }),
    c(20, 'Género de opinión', 'subtitulo', { zona: 'c' }),
    c(20, 'Expresa y defiende una postura.', 'item', { zona: 'c' }),
    c(20, 'Presenta valoraciones, razones y propuestas.', 'item', { zona: 'c' }),
    c(20, 'Busca convencer al lector o invitarlo a reflexionar.', 'item', { zona: 'c' }),
  ],
  visual: V('encabezados-categoria', 'Cada columna lleva el ícono, la forma y la etiqueta de su género.'),
});
add({
  diapositiva: 20,
  titulo: titulo(20),
  bloques: [
    c(20, 'Para analizar cualquier texto', 'subtitulo'),
    c(20, '1. Encuentra las pistas.', 'numerado'),
    c(20, '2. Explica qué función cumplen.', 'numerado'),
    c(20, '3. Reconoce la intención principal.', 'numerado'),
    c(20, '4. Justifica con dos evidencias.', 'numerado'),
    c(20, 'Una palabra es una pista. Varias pistas relacionadas forman una explicación.', 'cita'),
  ],
  visual: V('ruta', 'Ruta completa de cuatro pasos, todos activos.'),
});
add({
  diapositiva: 20,
  titulo: titulo(20),
  bloques: [
    c(20, 'Actividad final', 'subtitulo'),
    c(
      20,
      'Para distinguir un texto informativo de uno interpretativo debo observar ________________________________________________.',
      'cita',
    ),
    c(20, 'Para reconocer un texto de opinión debo buscar ________________________________________________.', 'cita'),
  ],
  visual: V('compara-info-interp', 'Comparación visual de los tres géneros para apoyar la actividad final.'),
});

// ---------------------------------------------------------------------------
// Dashboard
// ---------------------------------------------------------------------------
add({ diapositiva: null, tipo: 'dashboard', titulo: null, bloques: [], visual: null });

// ---------------------------------------------------------------------------
// Ensamblado: duraciones, fases, notas
// ---------------------------------------------------------------------------
const porDiapositiva = new Map<number, number>();
for (const b of borradores)
  if (b.diapositiva) porDiapositiva.set(b.diapositiva, (porDiapositiva.get(b.diapositiva) ?? 0) + 1);

const vistas = new Map<number, number>();
const pantallas: Pantalla[] = borradores.map((b, i) => {
  const n = b.diapositiva;
  let duracion = 0;
  if (n) {
    const total = porDiapositiva.get(n)!;
    const k = vistas.get(n) ?? 0;
    vistas.set(n, k + 1);
    // Reparto entero de 60 s entre las pantallas de la diapositiva (suma exacta).
    duracion = Math.floor(60 / total) + (k < 60 % total ? 1 : 0);
  }
  const tipo = b.tipo ?? 'contenido';
  const segmento =
    tipo === 'qr'
      ? 'Práctica independiente (ficha)'
      : tipo === 'dashboard'
        ? 'Resultados de la sesión'
        : `Diapositiva ${n}. ${tituloDiapositiva(n!)}`;
  const revisar = [...(b.revisar ?? [])];
  let notas = '';
  if (n) {
    notas = notasGuion(n);
    if (tipo === 'interactivo' || n >= 18) notas += '\n\n' + orientaciones;
  } else if (tipo === 'qr') {
    notas = 'El guion no incluye indicaciones para este momento.';
  } else {
    notas = orientaciones;
  }
  return {
    id: i + 1,
    segmento,
    diapositiva: n,
    fase_lgr: tipo === 'qr' ? 'tu' : tipo === 'dashboard' ? 'cierre' : fase(n!),
    duracion_s: duracion,
    tipo,
    titulo: b.titulo ?? null,
    bloques: b.bloques ?? [],
    visual: b.visual,
    interaccion: b.interaccion ?? null,
    notas,
    revisar,
    glosario: b.glosario ?? [],
    ...(b.diseno ? { diseno: b.diseno } : {}),
  };
});

// Marcas [REVISAR] por datos que el guion no trae para cada reactivo.
const NOMBRE_PASO = { encuentra: 'encuentra', explica: 'explica', reconoce: 'reconoce', justifica: 'justifica' };
for (const p of pantallas) {
  const it = p.interaccion;
  if (!it) continue;
  p.revisar.push(
    `[REVISAR] El guion no etiqueta nivel de lectura ni proceso PISA para el reactivo ${it.id_reactivo}; se registran como «Sin etiqueta».`,
    `[REVISAR] El paso del trayecto («${NOMBRE_PASO[it.paso_del_trayecto]}») se asignó a partir de la ruta de la Diapositiva 8; el guion no lo etiqueta.`,
  );
  if (it.tipo === 'seleccion') {
    if (it.tipo_predeterminado) {
      p.revisar.push('[REVISAR] El guion no indica el tipo de interacción; se usó selección única con botón Enviar.');
    }
    const sinFalla = Object.entries(it.fallas)
      .filter(([, f]) => !f.etiqueta)
      .map(([k]) => k);
    if (sinFalla.length) {
      p.revisar.push(
        `[REVISAR] El guion no nombra la falla que representa(n) la(s) opción(es) ${sinFalla.join(', ')}.`,
      );
    }
  }
}

// Diferencias entre el encabezado del guion y el título del contenido.
for (let n = 1; n <= 20; n++) {
  const tg = seccion(guion, n)
    .split('\n')[0]
    .replace(/^## Diapositiva \d+\. /, '');
  const tc = tituloDiapositiva(n);
  if (tg !== tc) {
    pantallas
      .find((p) => p.diapositiva === n)!
      .revisar.push(
        `[REVISAR] El guion titula esta diapositiva «${tg}» y el contenido «${tc}». En pantalla se usa el título del contenido.`,
      );
  }
}

const total = pantallas.reduce((s, p) => s + p.duracion_s, 0);
if (total !== 1200) throw new Error(`Las duraciones suman ${total} s, no 1200 s.`);
// Nota global en la primera pantalla de cada diapositiva.
const vistos = new Set<number>();
for (const p of pantallas) {
  if (p.diapositiva && !vistos.has(p.diapositiva)) {
    vistos.add(p.diapositiva);
    p.revisar.unshift(REVISAR_GLOBAL, REVISAR_FASE);
  }
}

const modelo: ModeloSlides = {
  titulo: 'Los géneros periodísticos',
  duracion_total_s: total,
  pantallas,
  glosario: [
    {
      termino: 'géneros periodísticos',
      definicion: c(
        2,
        'Los **géneros periodísticos** son distintas formas de presentar acontecimientos, ideas y asuntos de interés público en los medios de comunicación.',
      ),
    },
    {
      termino: 'marcadores discursivos',
      definicion: c(
        6,
        'Los **marcadores discursivos** son palabras o expresiones que conectan las partes de un texto y ayudan a comprender la relación entre sus ideas.',
      ),
    },
    {
      termino: 'atribución de información',
      definicion: c(
        7,
        'Permite saber quién proporciona el dato: **según**, **de acuerdo con**, **informó**, **señaló**, **explicó**.',
      ),
    },
    {
      termino: 'datos verificables',
      definicion: c(7, 'Pueden comprobarse: fechas, cifras, nombres, lugares, documentos y declaraciones.'),
    },
    {
      termino: 'valoración',
      definicion: c(
        7,
        'Expresa un juicio sobre una persona, hecho o situación: **grave**, **injusto**, **excelente**, **innecesario**, **un desastre**.',
      ),
    },
    {
      termino: 'presencia del autor',
      definicion: c(
        7,
        'Hace visible su experiencia o punto de vista: **creo**, **considero**, **lo que más valoro**, **me parece**, **en mi experiencia**.',
      ),
    },
  ],
  // Intervenciones del guion («Orientaciones para revisar las respuestas») asociadas a cada paso.
  intervenciones: {
    encuentra: {
      texto: guionLit(
        'Si solo menciona una palabra, preguntar: “¿Qué ideas conecta y qué muestra acerca de la intención?”',
      ),
      fuente: 'guion-docente.txt § Orientaciones para revisar las respuestas',
    },
    explica: {
      texto: guionLit(
        'Si solo menciona una palabra, preguntar: “¿Qué ideas conecta y qué muestra acerca de la intención?”',
      ),
      fuente: 'guion-docente.txt § Orientaciones para revisar las respuestas',
    },
    reconoce: {
      texto: guionLit('Si clasifica por una cifra, preguntar: “¿Qué otras pistas aparecen junto con ese dato?”'),
      fuente: 'guion-docente.txt § Orientaciones para revisar las respuestas',
    },
    justifica: {
      texto: guionLit('Si acierta sin justificar, pedir: “Demuestra tu respuesta con dos expresiones del texto.”'),
      fuente: 'guion-docente.txt § Orientaciones para revisar las respuestas',
    },
  },
};

writeFileSync(path.join(ROOT, 'src/content/slides.json'), JSON.stringify(modelo, null, 2) + '\n');

// El guion no trae banco de respuestas simuladas: la semilla queda vacía.
const seed = {
  origen: 'guion-docente.txt',
  nota: 'El guion docente no incluye un banco de respuestas simuladas; el dashboard arranca vacío.',
  respuestas: [] as unknown[],
};
writeFileSync(path.join(ROOT, 'src/content/seed.json'), JSON.stringify(seed, null, 2) + '\n');

console.log(`slides.json: ${pantallas.length} pantallas, ${total} s en total.`);
for (const p of pantallas) {
  console.log(
    `${String(p.id).padStart(2)} | ${p.tipo.padEnd(11)} | ${p.fase_lgr.padEnd(8)} | ${String(p.duracion_s).padStart(3)} s | ${p.segmento}${p.interaccion ? ` | ${p.interaccion.id_reactivo}` : ''}`,
  );
}
