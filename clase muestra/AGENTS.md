# A Learning Lab · Clase muestra — Instrucciones para el agente

> **Carpeta de insumos:** `Cédula 1/clase muestra/`
> Si la carpeta tiene otro nombre en el repositorio, esta es la única línea que debe cambiarse. En todo el documento se le llama INSUMOS_DIR. Cita siempre la ruta entre comillas en la terminal, porque contiene espacios y acentos.

## Modo de ejecución

Esta tarea se ejecuta **de corrido, sin pausas ni preguntas al usuario**. Reglas del modo:

1. No esperes aprobaciones. Cuando un paso requiera una decisión, elige la opción más conservadora (la que menos altera los insumos y menos riesgo introduce), regístrala en `REPORT.md` con su justificación y continúa.
2. Detente únicamente ante las **condiciones de parada** listadas abajo. Aun entonces, termina todo lo que no dependa del bloqueo y documenta el estado.
3. Si una prueba falla, corrige y vuelve a ejecutar hasta tres veces por falla. Si persiste, regístrala como pendiente en `REPORT.md` y continúa con lo demás; esa falla bloquea solo el despliegue a producción.
4. Haz commits de git al terminar cada fase, con mensajes descriptivos, para que el usuario pueda revisar o revertir cada fase por separado.

### Condiciones de parada

- Falta alguno de los tres insumos (contenido, guion o QR) en INSUMOS_DIR.
- La extracción de un insumo es ilegible o pierde contenido de forma que impide construir las pantallas.
- El QR no puede decodificarse.

En estos casos, deja en `REPORT.md` el diagnóstico, lo completado y qué necesita el usuario para continuar.

## Misión

Construir de principio a fin, probar y desplegar en Vercel una app web estática de presentación a pantalla completa para una clase muestra de 20 minutos. La app presenta todos los momentos de la sesión, incluye prácticas interactivas (arrastrar y soltar, selección con envío), muestra el código QR proporcionado hacia una ficha de práctica independiente alojada en Google Drive y cierra con un dashboard de resultados de la sesión. La URL de producción debe ser pública, sin inicio de sesión.

## Insumos: fuente de verdad

INSUMOS_DIR contiene tres tipos de archivo proporcionados por el usuario:

| Rol | Descripción |
|---|---|
| Contenido | Texto explícito que aparece en pantalla. Única fuente de contenido disciplinar. |
| Guion docente | Cronología de la sesión, segmentos, duraciones, fases de la liberación gradual, preguntas, reactivos, distractores con la falla que representan, etiquetas (paso del trayecto, nivel de lectura, proceso PISA) y banco de respuestas simuladas. |
| QR | Archivo SVG con el código QR que apunta a la ficha de práctica independiente. |

**Reglas sobre la carpeta:**

1. INSUMOS_DIR es de solo lectura. No modifiques, renombres, muevas ni borres ningún archivo dentro de ella.
2. Inventaría la carpeta y asigna un rol a cada archivo por su nombre y contenido. Si hay más de un candidato para un rol, elige el más completo y reciente, y registra en `REPORT.md` los descartados y por qué. Los archivos que no encajan en ningún rol se ignoran y se registran.
3. Nunca generes contenido de reemplazo para un insumo faltante: es condición de parada.

## Extracción del contenido

Crea `scripts/extract-content.ts`, que:

1. Lee los archivos de contenido y guion según su formato: `.md` y `.txt` directamente; `.docx` con `mammoth` (texto sin formato); `.pdf` con `pdfjs-dist`.
2. Escribe copias de trabajo en `content/extracted/contenido.txt` y `content/extracted/guion-docente.txt`.
3. Genera `content/extracted/manifest.json` con la ruta original, el formato y el hash SHA-256 de cada archivo fuente.
4. Falla si un archivo fuente cambió respecto al manifiesto sin que se haya vuelto a ejecutar la extracción.

Revisa la extracción. Los defectos menores (espacios, saltos de línea, guiones de corte de palabra) se normalizan y se registran. Si se pierden texto, orden o caracteres de forma que cambie el contenido, es condición de parada.

## Reglas de fidelidad del contenido

1. Todo texto de contenido en pantalla debe aparecer literalmente en las copias extraídas. Solo se permite dividir un texto en varias pantallas, cambiar saltos de línea y aplicar énfasis tipográfico. No se permite parafrasear, resumir, corregir ni completar.
2. Conserva autorías, medios, fechas y enlaces tal como vienen.
3. Si un bloque no cabe en el lienzo con los tamaños mínimos, divídelo en más pantallas. Nunca reduzcas la tipografía por debajo del mínimo.
4. Las únicas cadenas que puedes redactar son etiquetas de interfaz (botones, instrucciones de navegación, estados del sistema). Todas viven en `src/ui/labels.ts` y se listan en `REPORT.md`.
5. El texto del guion que no se proyecta va en la vista de notas del presentador.
6. Si detectas errores o inconsistencias en los insumos (erratas, duraciones que no suman 20 minutos, reactivos sin respuesta correcta), no los corrijas: constrúyelos tal como están, márcalos en las notas del presentador con la etiqueta `[REVISAR]` y regístralos en `REPORT.md`. Si un reactivo no tiene respuesta correcta identificable, muéstralo sin retroalimentación de acierto y exclúyelo de las métricas de acierto.

## El QR proporcionado

1. Usa el SVG de INSUMOS_DIR tal cual. No lo regeneres ni alteres sus módulos, proporciones o colores.
2. Cópialo a `src/assets/qr-ficha.svg` durante la compilación (script `scripts/copy-qr.ts`) y sanitízalo: elimina scripts, manejadores de eventos y referencias externas; conserva o agrega `viewBox` para que escale sin pérdida.
3. Muéstralo dentro de un panel `--color-5` con zona de silencio de al menos 4 módulos, con un lado mínimo de 560 px en el lienzo. Si el SVG tiene fondo transparente, el panel crema actúa como fondo.
4. Si el SVG está invertido (módulos claros sobre fondo oscuro), no lo alteres: muéstralo sobre un panel `--color-1` con la zona de silencio requerida, verifica que se decodifique y regístralo en `REPORT.md` como riesgo de lectura en algunos celulares.
5. **Verificación automática de la URL:** decodifica el QR (ver "Pruebas"), guarda la URL en `content/qr-url.json` y comprueba que pertenezca a `drive.google.com` o `docs.google.com` y que `curl -sIL` sin cookies termine en un código 200 sin redirigir a `accounts.google.com`. Si no se cumple, construye todo igualmente, registra el problema como pendiente crítico en `REPORT.md` y no despliegues a producción.
6. Muestra la URL decodificada como texto de respaldo debajo del QR, o en las notas si no cabe con el tamaño mínimo.

## Stack

- **Build:** Vite + React + TypeScript, salida estática en `dist/`. Node 20 o superior, declarado en `engines`.
- **Tipografía autoalojada:** `@fontsource/montserrat` (700 y 900) y `@fontsource/inter` (400 y 500). No cargar fuentes desde servicios externos.
- **Íconos:** `lucide-react` (SVG, solo los íconos usados).
- **Arrastrar y soltar:** `@dnd-kit/core` con sensores de puntero y de teclado.
- **Extracción:** `mammoth` y `pdfjs-dist` (solo en scripts de compilación, no en el paquete final).
- **Decodificación del QR en pruebas:** `jsqr` y `pngjs`.
- **Gráficas del dashboard:** componentes SVG propios; la matriz de confusión como tabla o mapa de calor propio.
- **Funcionamiento sin conexión:** `vite-plugin-pwa` para almacenar la app en caché tras la primera carga.
- **Calidad:** ESLint, Prettier, Vitest, Playwright y `@axe-core/playwright`.
- No agregar backend, base de datos, analítica ni servicios de terceros.

## Arquitectura

```
scripts/
├── extract-content.ts
└── copy-qr.ts
content/
├── extracted/               ← generado: contenido.txt, guion-docente.txt, manifest.json
└── qr-url.json              ← generado: URL decodificada del QR
src/
├── content/slides.json      ← generado por ti a partir de las copias extraídas
├── content/seed.json        ← respuestas simuladas tomadas del guion
├── assets/qr-ficha.svg      ← copia sanitizada del QR
├── components/              ← Stage, Slide, Notes, ProgressBar, Brand, QrPanel
├── interactions/            ← DragDropItem, ChoiceItem, Feedback
├── dashboard/               ← métricas y gráficas
├── state/                   ← registro de respuestas y persistencia
├── theme/tokens.css         ← paleta, tipografía y espaciado
└── ui/labels.ts             ← única ubicación de texto de interfaz
tests/
REPORT.md
```

**Modelo de cada pantalla en `slides.json`:** `id`, `segmento`, `fase_lgr`, `duracion_s`, `tipo` (contenido, interactivo, qr o dashboard), `bloques` (cada uno con `texto` y `fuente`, que indica archivo y sección de origen), `visual` (descripción del apoyo SVG), `interaccion` (si aplica) y `notas`.

**Navegación por hash** (`#/12`), para que una recarga conserve la pantalla y no se necesiten reglas de reescritura en Vercel.

## Requisitos funcionales

### Presentación

- Lienzo fijo de 1920×1080 escalado proporcionalmente a la ventana, con franjas si la proporción no coincide. `overflow: hidden`. Ninguna pantalla produce scroll.
- **Teclas:** → / Espacio / Av Pág avanzan; ← / Re Pág retroceden; Inicio y Fin van a los extremos; F activa pantalla completa; N abre las notas del presentador. Un clic en los bordes laterales también navega.
- Mientras el foco está en un componente interactivo, las flechas controlan ese componente. Escape devuelve el control a la navegación.
- Barra de progreso discreta con la fase de la liberación gradual y el número de pantalla.
- La vista de notas muestra el guion del segmento, la duración prevista y un cronómetro del segmento.
- Transiciones de 300 ms o menos, desactivadas si el usuario prefiere movimiento reducido.

### Pantallas

Una o más por cada segmento del guion, en orden cronológico. Además, una pantalla de QR (en el momento que indique el guion o, si no lo indica, antes del cierre) y una pantalla final de dashboard.

### Interacciones

- Arrastrar y soltar funcional con ratón, pantalla táctil y teclado.
- Selección única o múltiple según el reactivo, con botón Enviar. Nada se registra antes de enviar.
- Cuando el guion lo pida, solicitar la selección de los marcadores que justifican la respuesta.
- Retroalimentación inmediata con ícono, texto y color, anunciada con `aria-live`. Nunca solo color.
- Si el guion no indica el tipo de interacción de un reactivo, usa selección única con envío y regístralo.
- Las respuestas se ingresan en el dispositivo del presentador. Se permiten varias respuestas por reactivo para representar al grupo.

### Registro

- **Campos:** `id_sesion`, `alias`, `origen` (en vivo o semilla), `id_reactivo`, `opcion_elegida`, `respuesta_correcta`, `es_correcta`, `marcadores_de_justificacion`, `paso_del_trayecto`, `nivel_de_lectura`, `proceso_pisa`, `falla_diagnosticada`, `timestamp`, `tiempo_de_respuesta_s`.
- Estado en memoria con respaldo en `localStorage`, dentro de try/catch. La app funciona aunque el almacenamiento falle.

### Dashboard

- Participación por reactivo, separada por origen.
- Porcentaje de acierto por reactivo, nivel de lectura, paso del trayecto y proceso PISA.
- Matriz de confusión: categoría correcta frente a categoría elegida.
- Distractor más elegido por reactivo, con la falla que representa.
- Calidad de la justificación: respuestas correctas con justificación suficiente frente a correctas sin justificación.
- Tiempo medio de respuesta.
- Síntesis pedagógica generada con reglas fijas: el paso del trayecto con mayor falla y la intervención que propone el guion.
- Los datos semilla se precargan desde `seed.json`, siempre etiquetados como "Simulado", con un control para mostrar u ocultar datos simulados y en vivo por separado. Si el guion no trae banco de respuestas simuladas, el dashboard arranca vacío y se registra.
- Exportación a CSV y botón de reinicio con confirmación.
- Etiquetas directas en los tamaños mínimos; nunca depender de leyendas de color.

## Sistema de diseño

### Paleta (`theme/tokens.css`)

```css
--color-1: #000000;  /* fondo, 60 % */
--color-5: #FDFFF1;  /* texto y superficies claras, 30 % */
--color-4: #FADB20;  /* acento principal: palabras clave */
--color-2: #86CCFD;  /* interactivos, foco y enlaces */
--color-3: #E6000A;  /* solo alertas y elementos gruesos */
```

- Regla 60-30-10: los tres acentos juntos no deben rebasar el 10 % de la superficie.
- `--color-3` sobre `--color-1` se usa solo en texto de 48 px o más en negritas, en íconos o en bordes; nunca en texto de cuerpo.
- Toda combinación de texto y fondo cumple WCAG 2.2 AA.
- Si asignas colores a categorías del contenido, cada categoría lleva además su propio ícono, forma y etiqueta escrita, de manera consistente en toda la app.

### Tipografía

Dos familias como máximo: Montserrat para títulos (700 o 900) e Inter para el cuerpo (400 o 500).

| Elemento | En el lienzo de 1920 px | Equivalente |
|---|---|---|
| Títulos | 72–96 px | 36–48 pt |
| Subtítulos | 48–64 px | 24–32 pt |
| Cuerpo | 36–48 px, nunca menos de 36 | 18–24 pt |

Interlineado de 1.2 a 1.3 y líneas de 60 caracteres como máximo.

### Marca

"A Learning Lab" by Jesús Álvarez: firma editorial discreta en una esquina inferior, en `--color-5` con opacidad de 60 a 70 %, a 24–28 px. Es la única excepción documentada al tamaño mínimo, porque no es contenido.

### Visuales

- Solo SVG: íconos de Lucide e ilustraciones geométricas propias con la paleta.
- Sin imágenes rasterizadas remotas ni de bancos de imágenes.
- Sin logotipos de medios ni marcas de terceros; se nombran solo en texto.
- Cada pantalla de contenido lleva al menos un apoyo visual con función explicativa, no decorativa.

## DUA y accesibilidad

- **Representación:** cada concepto clave con texto, ícono y apoyo visual; glosario emergente para términos técnicos presentes en los insumos.
- **Acción y expresión:** dos modalidades de respuesta cuando el guion lo permita y operación completa por teclado.
- **Implicación:** propósito visible en cada pantalla, retroalimentación inmediata y progreso a la vista.
- **Técnica:** WCAG 2.2 AA, foco visible con `--color-2` de al menos 3 px, estructura semántica, roles ARIA en componentes interactivos, texto alternativo para el QR y respeto de `prefers-reduced-motion`.

## Pruebas y control de calidad

Scripts en `package.json`: `extract` (extracción y verificación del manifiesto), `dev`, `build` (ejecuta `extract` y `copy-qr` antes de compilar), `preview`, `lint`, `test` (Vitest), `test:e2e` (Playwright) y `check` (ejecuta todo lo anterior en orden).

1. **Integridad de insumos:** INSUMOS_DIR no tiene cambios respecto a lo entregado (`git status` limpio en esa ruta) y el manifiesto coincide.
2. **Fidelidad** (`tests/content-fidelity.test.ts`): cada `bloques[].texto` de `slides.json`, normalizado (espacios, comillas, saltos de línea), aparece literalmente en las copias extraídas. Falla si no.
3. **Sin scroll** (Playwright): en 1280×720, 1366×768, 1920×1080 y 1024×768, ninguna pantalla tiene contenido desbordado ni permite desplazarse.
4. **Tipografía:** ningún texto de contenido se renderiza por debajo de 36 px en el lienzo; solo se cargan dos familias.
5. **Contraste:** un script verifica el contraste de cada par de tokens usado.
6. **Navegación:** todas las teclas funcionan, y las flechas no cambian de pantalla con el foco en un componente interactivo.
7. **Interacciones:** arrastrar y soltar funciona con puntero y con teclado; enviar registra la respuesta y el dashboard la refleja.
8. **Accesibilidad:** axe sin violaciones graves ni críticas.
9. **QR:** una captura del panel del QR renderizado en 1920×1080 se decodifica con `jsqr` y coincide con `content/qr-url.json`; la URL pasa la verificación automática de acceso público.
10. **Semilla:** los datos simulados aparecen etiquetados y pueden ocultarse.

## Despliegue en Vercel

**`vercel.json` en la raíz:**

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "framework": "vite",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }]
    }
  ]
}
```

Agrega a `.vercelignore` los archivos que no deben subirse, salvo INSUMOS_DIR y `content/`, que son necesarios para la compilación.

**Procedimiento automático:**

1. Verifica la autenticación con `npx vercel whoami`. Si no hay sesión, no intentes iniciarla: registra en `REPORT.md` los comandos exactos que el usuario debe ejecutar para desplegar y termina. Nunca solicites, escribas ni guardes tokens o credenciales.
2. Vincula o crea el proyecto con el nombre `learning-lab-clase-muestra` (`npx vercel link --yes --project learning-lab-clase-muestra`). Si el nombre no está disponible, usa `learning-lab-clase-muestra-cedula1` y regístralo.
3. Despliega una vista previa (`npx vercel --yes`) y registra la URL.
4. **Pasa a producción** (`npx vercel --prod --yes`) solo si se cumplen las tres condiciones: todas las pruebas pasan, la URL del QR pasó la verificación automática y no hay pendientes críticos. Si alguna falla, quédate en la vista previa y documenta el motivo.
5. **Acceso público:** con la protección estándar de Vercel, el dominio de producción (`<proyecto>.vercel.app`) es público, pero las URL únicas de cada despliegue y las vistas previas pueden pedir inicio de sesión. Comparte siempre el dominio de producción. No cambies la configuración de protección del proyecto.
6. **Verificación final:** `curl -sI https://<proyecto>.vercel.app` debe devolver 200, sin redirección a una página de inicio de sesión. Si pide inicio de sesión, registra en `REPORT.md` que el usuario debe desactivar "Vercel Authentication" en Settings → Deployment Protection.

## Secuencia de ejecución

Ejecuta estas fases en orden, sin pausas, con un commit al final de cada una:

1. **Inventario y extracción:** asignación de roles, extracción, manifiesto, copia y decodificación del QR, verificación de su URL.
2. **Modelo de contenido:** `slides.json` y `seed.json` a partir de las copias extraídas, con el mapa de pantallas registrado en `REPORT.md`.
3. **Sistema de diseño:** tokens, tipografía, lienzo, navegación, marca y componentes base.
4. **Construcción completa:** todas las pantallas, interacciones, registro y dashboard.
5. **Calidad:** `npm run check`, correcciones (hasta tres intentos por falla) y resultado de cada prueba.
6. **Despliegue:** procedimiento automático de Vercel.
7. **Cierre:** `REPORT.md` final.

## Contenido de `REPORT.md`

1. Resumen: estado final (producción, vista previa o sin desplegar) y URL pública.
2. Inventario de insumos con el rol asignado a cada archivo, los descartados y los ignorados.
3. URL decodificada del QR y resultado de su verificación.
4. Mapa de pantallas: pantalla, segmento, fase, duración, fuente e interacción.
5. Decisiones tomadas sin consultar, cada una con su justificación.
6. Inconsistencias de los insumos marcadas con `[REVISAR]`.
7. Etiquetas de interfaz redactadas.
8. Resultado de cada prueba de control de calidad (cumplida o pendiente, con detalle).
9. Pendientes para el usuario, ordenados por prioridad, con los comandos exactos cuando aplique.

## Qué no hacer

- No modificar nada dentro de INSUMOS_DIR.
- No inventar, parafrasear ni corregir contenido.
- No regenerar ni alterar el QR.
- No agregar backend, analítica, rastreadores ni servicios externos.
- No usar imágenes remotas ni fuentes externas.
- No reducir tipografía para evitar el scroll.
- No desplegar a producción si falla alguna condición de la regla de producción.
- No cambiar la configuración de protección del proyecto en Vercel.
- No manejar credenciales.

## Idioma

Español de México en la interfaz, los comentarios del código y los reportes.