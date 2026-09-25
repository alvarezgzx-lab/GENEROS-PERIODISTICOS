# REPORT · A Learning Lab · Clase muestra «Los géneros periodísticos»

## 1. Resumen

| | |
|---|---|
| **Estado final** | **Producción** |
| **URL pública** | **https://learning-lab-clase-muestra.vercel.app** |
| Verificación pública | `curl -sI https://learning-lab-clase-muestra.vercel.app` → `HTTP/2 200`, sin redirección a inicio de sesión |
| Proyecto Vercel | `learning-lab-clase-muestra` (equipo `jesus-angel`) |
| Repositorio | https://github.com/alvarezgzx-lab/GENEROS-PERIODISTICOS, rama `claude/agents-md-complete-task-tff4jh` |
| Pantallas | 57 (20 diapositivas del guion en 54 pantallas + QR + dashboard), 10 reactivos interactivos |
| Pruebas | `npm run check` en verde: 416 pruebas Vitest y 32 pruebas Playwright |

La app es estática (Vite + React + TypeScript), funciona sin conexión tras la primera carga (PWA), no usa backend, analítica ni servicios de terceros, y aloja sus propias fuentes.

## 2. Inventario de insumos

INSUMOS_DIR: `clase muestra/` (AGENTS.md lo nombra `Cédula 1/clase muestra/`; ver decisión D1). La carpeta no se modificó (`git status` limpio; prueba 1).

| Archivo | Rol asignado | Motivo |
|---|---|---|
| `presentacion_los_generos_periodisticos - Copy.md` | **Contenido** | Nombre «presentación»: texto explícito de las 20 diapositivas |
| `guion_docente_los_generos_periodisticos - Copy.md` | **Guion docente** | Nombre y encabezado «Guion docente» |
| `QR practica.svg` | **QR** | SVG con código QR |
| `ficha_practica_independiente_generos_periodisticos - Copy.html` | Ignorado | Formato HTML; es la ficha de práctica a la que apunta el QR, no un rol de insumo |
| `AGENTS.md` | Ignorado | Instrucciones para el agente |

- **Descartados:** ninguno (un solo candidato por rol).
- **Extracción:** ambos insumos son Markdown y se leyeron directamente. Copias de trabajo en `content/extracted/contenido.txt` y `content/extracted/guion-docente.txt`; manifiesto con ruta, formato y SHA-256 en `content/extracted/manifest.json`. `npm run extract` falla si una fuente cambia sin volver a extraer (`npm run extract -- --actualizar`).
- **Normalizaciones registradas:** Unicode NFC; CRLF → LF; espacios finales eliminados (17 líneas con doble espacio de salto de línea de Markdown: líneas de fuente, metadatos del texto de Volaris y opciones A/B de las diapositivas 9 a 19); unión de guiones de corte (no hubo); reducción de líneas en blanco repetidas (no hubo). No se perdió texto, orden ni caracteres: la copia de contenido es idéntica al original salvo los espacios finales, y la del guion es byte a byte igual.

## 3. QR

| | |
|---|---|
| URL decodificada | https://drive.google.com/file/d/1OAT-2-PgS4uyroRNazrpImkWmyQwVXvy/view?usp=sharing |
| Decodificación | `jsqr` sobre una captura PNG de Chromium del SVG sanitizado; guardada en `content/qr-url.json` |
| Dominio | `drive.google.com` ✔ |
| Acceso público | ✔ `curl -sIL` sin cookies → `HTTP/2 200`, 0 redirecciones, sin paso por `accounts.google.com`; título de la página: «ficha_practica_independiente_generos_periodisticos.pdf - Google Drive» |
| SVG | Módulos oscuros sobre fondo blanco (no invertido). Sin scripts, eventos ni referencias externas; ya tenía `viewBox`. Copiado sin cambios a `src/assets/qr-ficha.svg` |
| Presentación | Panel `--color-5`, QR de 600 px de lado (≥ 560 px), zona de silencio ≈ 6 módulos (2 del SVG + 64 px de panel), URL de respaldo visible debajo del título |
| Prueba 9 | La captura del panel renderizado en 1920×1080 se decodifica y coincide con `content/qr-url.json` |

La política de red de este entorno de trabajo bloquea `drive.google.com` (403 del proxy), por lo que el `curl -sIL` se ejecutó desde un sandbox efímero de Vercel del mismo proyecto (ver D10). Ambos resultados, el local (no concluyente) y el externo (aprobado), quedan en `content/qr-url.json`.

## 4. Mapa de pantallas

Duración: 60 s por diapositiva repartidos entre sus pantallas (suma 1200 s = 20 min). Fuente: sección de `contenido.txt`; las notas de cada pantalla toman la sección homónima del guion.

| # | Segmento | Fase | Duración | Tipo | Fuente | Interacción |
|---|---|---|---|---|---|---|
| 1 | Diapositiva 1. Los géneros periodísticos | Yo hago | 30 s | contenido | Diapositiva 1 | — |
| 2 | Diapositiva 1. Los géneros periodísticos | Yo hago | 30 s | contenido | Diapositiva 1 | — |
| 3 | Diapositiva 2. ¿Qué son los géneros periodísticos? | Yo hago | 30 s | contenido | Diapositiva 2 | — |
| 4 | Diapositiva 2. ¿Qué son los géneros periodísticos? | Yo hago | 30 s | contenido | Diapositiva 2 | — |
| 5 | Diapositiva 3. Los géneros informativos | Yo hago | 20 s | contenido | Diapositiva 3 | — |
| 6 | Diapositiva 3. Los géneros informativos | Yo hago | 20 s | contenido | Diapositiva 3 | — |
| 7 | Diapositiva 3. Los géneros informativos | Yo hago | 20 s | contenido | Diapositiva 3 | — |
| 8 | Diapositiva 4. Los géneros interpretativos | Yo hago | 20 s | contenido | Diapositiva 4 | — |
| 9 | Diapositiva 4. Los géneros interpretativos | Yo hago | 20 s | contenido | Diapositiva 4 | — |
| 10 | Diapositiva 4. Los géneros interpretativos | Yo hago | 20 s | contenido | Diapositiva 4 | — |
| 11 | Diapositiva 5. Los géneros de opinión | Yo hago | 20 s | contenido | Diapositiva 5 | — |
| 12 | Diapositiva 5. Los géneros de opinión | Yo hago | 20 s | contenido | Diapositiva 5 | — |
| 13 | Diapositiva 5. Los géneros de opinión | Yo hago | 20 s | contenido | Diapositiva 5 | — |
| 14 | Diapositiva 6. Los marcadores discursivos | Yo hago | 20 s | contenido | Diapositiva 6 | — |
| 15 | Diapositiva 6. Los marcadores discursivos | Yo hago | 20 s | contenido | Diapositiva 6 | — |
| 16 | Diapositiva 6. Los marcadores discursivos | Yo hago | 20 s | contenido | Diapositiva 6 | — |
| 17 | Diapositiva 7. Otras pistas importantes | Yo hago | 30 s | contenido | Diapositiva 7 | — |
| 18 | Diapositiva 7. Otras pistas importantes | Yo hago | 30 s | contenido | Diapositiva 7 | — |
| 19 | Diapositiva 8. Una ruta para analizar los textos | Yo hago | 30 s | contenido | Diapositiva 8 | — |
| 20 | Diapositiva 8. Una ruta para analizar los textos | Yo hago | 30 s | contenido | Diapositiva 8 | — |
| 21 | Diapositiva 9. Ejemplo de texto informativo | Yo hago | 20 s | contenido | Diapositiva 9 | — |
| 22 | Diapositiva 9. Ejemplo de texto informativo | Yo hago | 20 s | contenido | Diapositiva 9 | — |
| 23 | Diapositiva 9. Ejemplo de texto informativo | Yo hago | 20 s | contenido | Diapositiva 9 | — |
| 24 | Diapositiva 10. Ejemplo de texto interpretativo | Yo hago | 20 s | contenido | Diapositiva 10 | — |
| 25 | Diapositiva 10. Ejemplo de texto interpretativo | Yo hago | 20 s | contenido | Diapositiva 10 | — |
| 26 | Diapositiva 10. Ejemplo de texto interpretativo | Yo hago | 20 s | contenido | Diapositiva 10 | — |
| 27 | Diapositiva 11. Informar no es lo mismo que interpretar | Nosotros hacemos | 20 s | contenido | Diapositiva 11 | — |
| 28 | Diapositiva 11. Informar no es lo mismo que interpretar | Nosotros hacemos | 20 s | interactivo | Diapositiva 11 | D11: selección única (predeterminada) |
| 29 | Diapositiva 11. Informar no es lo mismo que interpretar | Nosotros hacemos | 20 s | contenido | Diapositiva 11 | — |
| 30 | Diapositiva 12. Ejemplo de texto de opinión | Nosotros hacemos | 20 s | contenido | Diapositiva 12 | — |
| 31 | Diapositiva 12. Ejemplo de texto de opinión | Nosotros hacemos | 20 s | contenido | Diapositiva 12 | — |
| 32 | Diapositiva 12. Ejemplo de texto de opinión | Nosotros hacemos | 20 s | contenido | Diapositiva 12 | — |
| 33 | Diapositiva 13. Cuidado con las pistas aisladas | Nosotros hacemos | 30 s | interactivo | Diapositiva 13 | D13: selección única (predeterminada) |
| 34 | Diapositiva 13. Cuidado con las pistas aisladas | Nosotros hacemos | 30 s | contenido | Diapositiva 13 | — |
| 35 | Diapositiva 14. Completa los textos | Nosotros hacemos | 15 s | interactivo | Diapositiva 14 | D14-A: arrastrar y soltar (3 espacios) |
| 36 | Diapositiva 14. Completa los textos | Nosotros hacemos | 15 s | interactivo | Diapositiva 14 | D14-B: arrastrar y soltar (3 espacios) |
| 37 | Diapositiva 14. Completa los textos | Nosotros hacemos | 15 s | interactivo | Diapositiva 14 | D14-1: selección única (predeterminada) |
| 38 | Diapositiva 14. Completa los textos | Nosotros hacemos | 15 s | interactivo | Diapositiva 14 | D14-2: selección única (predeterminada) |
| 39 | Diapositiva 15. Revisamos las respuestas | Nosotros hacemos | 15 s | contenido | Diapositiva 15 | — |
| 40 | Diapositiva 15. Revisamos las respuestas | Nosotros hacemos | 15 s | contenido | Diapositiva 15 | — |
| 41 | Diapositiva 15. Revisamos las respuestas | Nosotros hacemos | 15 s | contenido | Diapositiva 15 | — |
| 42 | Diapositiva 15. Revisamos las respuestas | Nosotros hacemos | 15 s | contenido | Diapositiva 15 | — |
| 43 | Diapositiva 16. Leemos un texto de Daniel Rodríguez | Nosotros hacemos | 20 s | contenido | Diapositiva 16 | — |
| 44 | Diapositiva 16. Leemos un texto de Daniel Rodríguez | Nosotros hacemos | 20 s | interactivo | Diapositiva 16 | D16-1: arrastrar y soltar (3 espacios) |
| 45 | Diapositiva 16. Leemos un texto de Daniel Rodríguez | Nosotros hacemos | 20 s | interactivo | Diapositiva 16 | D16-2: arrastrar y soltar (3 espacios) |
| 46 | Diapositiva 17. Analizamos el texto sobre Volaris | Nosotros hacemos | 20 s | contenido | Diapositiva 17 | — |
| 47 | Diapositiva 17. Analizamos el texto sobre Volaris | Nosotros hacemos | 20 s | interactivo | Diapositiva 17 | D17: selección única (predeterminada) |
| 48 | Diapositiva 17. Analizamos el texto sobre Volaris | Nosotros hacemos | 20 s | contenido | Diapositiva 17 | — |
| 49 | Diapositiva 18. Identifica la intención | Ustedes hacen | 30 s | interactivo | Diapositiva 18 | D18: selección única + marcadores de justificación (predeterminada) |
| 50 | Diapositiva 18. Identifica la intención | Ustedes hacen | 30 s | contenido | Diapositiva 18 | — |
| 51 | Diapositiva 19. Justifica tu decisión | Ustedes hacen | 30 s | interactivo | Diapositiva 19 | D19: selección única + marcadores de justificación (predeterminada) |
| 52 | Diapositiva 19. Justifica tu decisión | Ustedes hacen | 30 s | contenido | Diapositiva 19 | — |
| 53 | Práctica independiente (ficha) | Tú haces | 0 s | qr | QR practica.svg · qr-url.json | — |
| 54 | Diapositiva 20. Lo que aprendimos | Cierre | 20 s | contenido | Diapositiva 20 | — |
| 55 | Diapositiva 20. Lo que aprendimos | Cierre | 20 s | contenido | Diapositiva 20 | — |
| 56 | Diapositiva 20. Lo que aprendimos | Cierre | 20 s | contenido | Diapositiva 20 | — |
| 57 | Resultados de la sesión | Cierre | 0 s | dashboard | Registro de respuestas | — |


Etiquetas de cada reactivo (en `slides.json`):

| Reactivo | Pantalla | Tipo | Respuesta correcta | Paso del trayecto | Nivel de lectura / PISA | Falla por distractor (guion) |
|---|---|---|---|---|---|---|
| D11 | 28 | Selección única | C | Reconoce | Sin etiqueta | B: «Clasifica por una cifra» |
| D13 | 33 | Selección única | B | Justifica | Sin etiqueta | — |
| D14 · A | 35 | Arrastrar y soltar (3) | De acuerdo con · Asimismo · Por último | Explica | Sin etiqueta | — |
| D14 · B | 36 | Arrastrar y soltar (3) | Por el contrario · Es decir · Sin embargo | Explica | Sin etiqueta | — |
| D14 · 1 | 37 | Selección única | Texto A | Reconoce | Sin etiqueta | — |
| D14 · 2 | 38 | Selección única | Texto B | Reconoce | Sin etiqueta | — |
| D16 · 1 | 44 | Arrastrar y soltar (3 de 6) | deben hacer · experiencia personal · un desastre | Encuentra | Sin etiqueta | — |
| D16 · 2 | 45 | Arrastrar y soltar (3 de 6) | debe poner · deben ser enviados · deben analizar y actuar | Encuentra | Sin etiqueta | — |
| D17 | 47 | Selección única | C | Reconoce | Sin etiqueta | A: «Clasifica por una cifra»; B: intervención del guion sin nombre de falla |
| D18 | 49 | Selección única + 2 evidencias del fragmento | B; evidencias: por el contrario, sin embargo, es decir | Reconoce | Sin etiqueta | — |
| D19 | 51 | Selección única + 2 evidencias | C; evidencias: experiencia personal, un desastre, debe, deben actuar | Justifica | Sin etiqueta | — |

## 5. Decisiones tomadas sin consultar

| # | Decisión | Justificación |
|---|---|---|
| D1 | INSUMOS_DIR = `clase muestra/` en la raíz del repositorio; configurado en `scripts/config.ts`. No se editó la línea de AGENTS.md. | AGENTS.md vive dentro de INSUMOS_DIR, que es de solo lectura; cambiar la configuración fuera de la carpeta es lo menos invasivo. |
| D2 | «Crear el repositorio en GitHub» se resolvió publicando el proyecto en el repositorio existente `alvarezgzx-lab/GENEROS-PERIODISTICOS`, rama `claude/agents-md-complete-task-tff4jh`. | El repositorio ya existía y contenía los insumos; la sesión tiene asignada esa rama. No se creó otro repositorio ni se tocó `main`. |
| D3 | El proyecto (package.json, src, scripts, tests) se ubicó en la raíz del repositorio. | La arquitectura de AGENTS.md es relativa a la raíz y la carpeta de insumos debe quedar intacta. |
| D4 | Duraciones: 60 s por diapositiva, repartidos en partes enteras entre sus pantallas (total 1200 s). QR y dashboard sin duración (0 s). | El guion no trae duraciones; es el reparto uniforme más neutral para 20 diapositivas en 20 min. Marcado `[REVISAR]`. |
| D5 | Fases de la liberación gradual inferidas: D1–D10 «Yo hago»; D11–D17 «Nosotros hacemos»; D18–D19 «Ustedes hacen»; QR «Tú haces»; D20 y dashboard «Cierre». | El guion no nombra fases; se infirieron de sus indicaciones («Voy a analizar», «Repitamos», «Completemos», «Ahora realiza el procedimiento sin una explicación previa»). Marcado `[REVISAR]`. |
| D6 | Pantalla de QR antes de la Diapositiva 20 (cierre). | El guion no indica el momento; AGENTS.md pide «antes del cierre» en ese caso. |
| D7 | Bloques largos divididos en varias pantallas (57 en total); nunca se redujo la tipografía (cuerpo 36 px, subtítulos 50 px, títulos 76–96 px). | Reglas de fidelidad 3 y de tipografía. |
| D8 | Reactivos sin tipo de interacción en el guion → selección única con Enviar (D11, D13, D14·1, D14·2, D17, D18, D19). Los textos con banco de palabras (D14 A/B, D16) → arrastrar y soltar. Las preguntas 1 y 2 de «Después de completar» (D14) se convirtieron en reactivos con opciones «Texto A»/«Texto B». | Regla de interacciones de AGENTS.md; los bancos de palabras implican completar huecos. |
| D9 | El fragmento de Volaris (D16) se dividió en dos reactivos (D16·1 con los huecos 1–3 y D16·2 con 4–6), cada uno con el banco completo de 6 expresiones. | Con 6 huecos y el banco no cabía en 1920×1080 a 36 px; dividir en pantallas es lo permitido. |
| D10 | Verificación de acceso público con `curl -sIL` ejecutado desde un sandbox efímero de Vercel (proyecto `learning-lab-clase-muestra`), porque el proxy de este entorno responde 403 a `drive.google.com` y a `*.vercel.app`. Los sandboxes se detuvieron al terminar. | Cumple el método exigido (curl sin cookies) desde una red neutral. |
| D11 | Despliegue con el conector de Vercel ya autorizado en la cuenta del usuario (API), desde la rama de GitHub. `npx vercel whoami` indicó «Logged out» y no se intentó iniciar sesión ni se manejaron tokens. | El conector no requiere credenciales en esta sesión; es la vía conservadora para entregar la URL pública pedida. |
| D12 | El primer despliegue desde la rama quedó asignado por Vercel directamente a producción (el proyecto no tiene rama de producción vinculada), por lo que no hubo una vista previa separada. | En ese momento ya se cumplían las tres condiciones de producción (pruebas en verde sobre ese mismo commit, URL del QR verificada, sin pendientes críticos). Se volvió a desplegar a producción tras el ajuste de notas. |
| D13 | Justificación suficiente = al menos 2 evidencias válidas distintas (D18: por el contrario, sin embargo, es decir; D19: experiencia personal, un desastre, debe, deben actuar). Se ofrecen distractores literales del texto («crece la instalación de centros de datos», «promete inversiones», «cifras sobre la empresa»). | El guion pide «dos pistas» / «dos expresiones distintas». |
| D14 | Paso del trayecto de cada reactivo asignado según la ruta de la Diapositiva 8 (tabla de la sección 4). | El guion no etiqueta pasos; `[REVISAR]`. |
| D15 | Nivel de lectura y proceso PISA quedan `null` («Sin etiqueta» en el dashboard). | El guion no los trae; no se inventan. `[REVISAR]`. |
| D16 | Banco de respuestas simuladas vacío: `seed.json` sin respuestas; el dashboard arranca vacío y lo indica. | El guion no incluye banco de respuestas simuladas. |
| D17 | Síntesis pedagógica: paso con mayor proporción de fallas (empate: más fallas; luego orden del trayecto); una respuesta correcta sin justificación suficiente cuenta como falla de «justifica». Intervención tomada literalmente de «Orientaciones para revisar las respuestas»: Encuentra/Explica → «Si solo menciona una palabra…»; Reconoce → «Si clasifica por una cifra…»; Justifica → «Si acierta sin justificar…». | Reglas fijas y trazables al guion. |
| D18 | Codificación de categorías: Informativo = `--color-2` + círculo + ícono periódico; Interpretativo = `--color-4` + cuadrado + ícono red; De opinión = `--color-5` + triángulo + ícono megáfono. `--color-3` solo en íconos y bordes de error. | Regla de color + ícono + forma + etiqueta, sin usar el rojo en texto. |
| D19 | Retroalimentación en pantalla con etiquetas de interfaz («Correcto», «Revisa tu respuesta», «Respuesta esperada: X»); la respuesta textual del contenido se muestra en la pantalla siguiente («Respuesta» / «Respuesta para revisión»). Las intervenciones del guion por distractor quedan en las notas y en el dashboard. | El texto del guion no se proyecta (regla 5) y así cada pantalla cabe sin scroll. |
| D20 | Segunda modalidad de respuesta en arrastrar y soltar: tocar una expresión y luego un espacio. Las evidencias de D18 se seleccionan sobre el propio fragmento. | DUA: acción y expresión. |
| D21 | Glosario emergente con definiciones literales del contenido para: géneros periodísticos, marcadores discursivos, atribución de información, datos verificables, valoración y presencia del autor. | DUA: representación. |
| D22 | Las notas del presentador se muestran en un panel fuera del lienzo (tecla N) a 18 px. | No son contenido proyectado; no restan espacio al lienzo. |
| D23 | Cromo de interfaz (barra de progreso, estado de envío, controles del dashboard) a 26–28 px; todo el contenido a ≥ 36 px. | La prueba de tipografía cubre todo el texto de contenido; el cromo es discreto por diseño. |
| D24 | Se agregó una prueba de la regla 60-30-10 medida en píxeles (máximo observado: 3.8 % de acentos). | Control adicional del sistema de diseño. |

## 6. Inconsistencias de los insumos (marcadas `[REVISAR]` en las notas)

1. **Sin duraciones** en el guion (se asignaron 60 s por diapositiva). Todas las diapositivas.
2. **Sin fases de la liberación gradual** en el guion (inferidas). Todas las diapositivas.
3. **Sin etiquetas** de paso del trayecto, nivel de lectura ni proceso PISA en ningún reactivo.
4. **Sin banco de respuestas simuladas** en el guion.
5. **Fallas no nombradas** para la mayoría de los distractores (solo D11-B y D17-A/B tienen indicación del guion).
6. **Tipo de interacción no indicado** para los reactivos de selección.
7. **Momento del QR no indicado** en el guion.
8. **Diapositiva 6:** «por último» aparece en dos grupos («Para ordenar y agregar información» y «Para cerrar o resumir»).
9. **Diapositiva 17:** la tabla cita «más de 33 millones de pasajeros», dato que no aparece en el fragmento de la Diapositiva 16.
10. **Diapositiva 19:** el contenido cita «deben actuar», pero el texto dice «deben analizar y actuar».
11. **Diapositivas 8 y 19:** las fórmulas de respuesta difieren («…indica… y la expresión… muestra…» frente a «…muestra… Además, la expresión… indica…»).
12. **Títulos distintos entre guion y contenido** en las diapositivas 8, 9, 10, 11, 12, 13, 15, 16 y 17 (p. ej., guion «Texto sobre Volaris» / contenido «Leemos un texto de Daniel Rodríguez»). En pantalla se usa el del contenido.

Todo se construyó tal como viene; no se corrigió nada. Todos los reactivos tienen respuesta correcta identificable.

## 7. Etiquetas de interfaz redactadas

Todas viven en `src/ui/labels.ts`. Listado completo (las funciones se muestran con valores de ejemplo):

- `app.titulo`: Los géneros periodísticos
- `app.marca`: “A Learning Lab” by Jesús Álvarez
- `app.lienzo`: Presentación
- `nav.anterior`: Pantalla anterior
- `nav.siguiente`: Pantalla siguiente
- `nav.pantalla`: 1 / 2
- `nav.pantallaLarga`: Pantalla 1 de 2
- `nav.ayuda`: →, Espacio o Av Pág: avanzar · ← o Re Pág: retroceder · Inicio/Fin: extremos · F: pantalla completa · N: notas · Esc: salir de un ejercicio
- `fases.yo`: Yo hago
- `fases.nosotros`: Nosotros hacemos
- `fases.ustedes`: Ustedes hacen
- `fases.tu`: Tú haces
- `fases.cierre`: Cierre
- `pasos.encuentra`: Encuentra las pistas
- `pasos.explica`: Explica su función
- `pasos.reconoce`: Reconoce la intención
- `pasos.justifica`: Justifica
- `pasosCortos.encuentra`: Encuentra
- `pasosCortos.explica`: Explica
- `pasosCortos.reconoce`: Reconoce
- `pasosCortos.justifica`: Justifica
- `categorias.informativo`: Informativo
- `categorias.interpretativo`: Interpretativo
- `categorias.opinion`: De opinión
- `formas.informativo`: círculo
- `formas.interpretativo`: cuadrado
- `formas.opinion`: triángulo
- `intenciones.informar`: Informar
- `intenciones.explicar`: Explicar
- `intenciones.opinar`: Opinar
- `intenciones.hecho`: Hecho
- `visuales.agregar`: Agregar
- `visuales.causa`: Causa
- `visuales.contraste`: Contraste
- `visuales.aclarar`: Aclarar
- `visuales.cerrar`: Cerrar
- `visuales.fuente`: Fuente
- `visuales.dato`: Dato
- `visuales.valoracion`: Valoración
- `visuales.autor`: Autor
- `visuales.accion`: Acción
- `visuales.ideaA`: Idea
- `visuales.ideaB`: Idea
- `visuales.antecedente`: Antes
- `visuales.consecuencia`: Efecto
- `visuales.contexto`: Contexto
- `visuales.postura`: Postura
- `visuales.razon`: Razón
- `visuales.introduccion`: Introducción
- `visuales.desarrollo`: Desarrollo
- `visuales.conclusion`: Conclusión
- `visuales.textoA`: Texto A
- `visuales.textoB`: Texto B
- `visuales.unaPista`: 1 pista
- `visuales.variasPistas`: Varias pistas
- `visuales.sinValoracion`: Sin valoración
- `visuales.datos`: Datos
- `visuales.perspectivas`: Perspectivas
- `visuales.nosotros`: Nosotros
- `notas.titulo`: Notas del presentador
- `notas.cerrar`: Cerrar notas (N)
- `notas.segmento`: Segmento
- `notas.fase`: Fase
- `notas.duracion`: Duración prevista
- `notas.sinDuracion`: Sin duración en el guion
- `notas.cronometro`: Cronómetro del segmento
- `notas.iniciar`: Iniciar
- `notas.pausar`: Pausar
- `notas.reiniciar`: Reiniciar
- `notas.guion`: Guion
- `notas.revisar`: Para revisar
- `notas.visual`: Apoyo visual
- `notas.segundos`: 1 s
- `glosario.boton`: Glosario
- `glosario.titulo`: Glosario
- `glosario.cerrar`: Cerrar glosario
- `interaccion.enviar`: Enviar
- `interaccion.otraRespuesta`: Registrar otra respuesta
- `interaccion.limpiar`: Limpiar
- `interaccion.seleccionaOpcion`: Selecciona una opción para enviar.
- `interaccion.completaHuecos`: Coloca una expresión en cada espacio para enviar.
- `interaccion.hueco`: Espacio 1
- `interaccion.huecoVacio`: vacío
- `interaccion.huecoCon`: Espacio 1: 2
- `interaccion.banco`: Banco
- `interaccion.instruccionArrastre`: Arrastra cada expresión a un espacio. Con teclado: enfoca una expresión, pulsa Espacio para tomarla, usa las flechas para elegir el espacio y Espacio para soltarla. También puedes pulsar una expresión y luego un espacio.
- `interaccion.arrastreInicio`: Tomaste «1». Usa las flechas para elegir un espacio y Espacio para soltar.
- `interaccion.arrastreSobre`: «1» sobre 2.
- `interaccion.arrastreFin`: «1» colocada en 2.
- `interaccion.arrastreCancelado`: Se canceló el movimiento de «1».
- `interaccion.arrastreFuera`: «1» regresó al banco.
- `interaccion.seleccionada`: seleccionada
- `interaccion.evidencia`: Evidencia seleccionada
- `interaccion.evidenciaInstruccion`: Selecciona dos expresiones del texto como evidencia.
- `interaccion.registrada`: Respuesta 1 registrada.
- `interaccion.participante`: Participante 1
- `interaccion.respuestasRegistradas`: 1 respuesta registrada
- `feedback.correcto`: Correcto
- `feedback.incorrecto`: Revisa tu respuesta
- `feedback.sinClave`: Respuesta registrada
- `feedback.sinClaveDetalle`: Este reactivo no tiene respuesta correcta identificable.
- `feedback.esperada`: Respuesta esperada: 1
- `feedback.aciertos`: 1 de 2 espacios correctos
- `feedback.justificacionSuficiente`: Justificación suficiente: dos evidencias válidas
- `feedback.justificacionInsuficiente`: Justificación insuficiente: faltan evidencias válidas
- `qr.titulo`: Práctica independiente
- `qr.instruccion`: Escanea el código para abrir la ficha de práctica.
- `qr.alt`: Código QR que abre la ficha de práctica independiente en Google Drive
- `qr.respaldo`: Enlace de respaldo
- `dashboard.titulo`: Resultados de la sesión
- `dashboard.pestañas.participacion`: Participación
- `dashboard.pestañas.acierto`: Acierto
- `dashboard.pestañas.confusion`: Confusión
- `dashboard.pestañas.distractores`: Distractores
- `dashboard.pestañas.sintesis`: Síntesis
- `dashboard.simulado`: Simulado
- `dashboard.enVivo`: En vivo
- `dashboard.mostrarSimulado`: Datos simulados
- `dashboard.mostrarEnVivo`: Datos en vivo
- `dashboard.sinDatos`: Aún no hay respuestas registradas.
- `dashboard.sinSemilla`: Sin datos simulados: el guion no incluye banco de respuestas simuladas. Nivel de lectura y proceso PISA: sin etiqueta en el guion.
- `dashboard.exportar`: Exportar CSV
- `dashboard.reiniciar`: Reiniciar
- `dashboard.confirmarReinicio`: ¿Borrar todas las respuestas en vivo de esta sesión?
- `dashboard.confirmar`: Sí, borrar
- `dashboard.cancelar`: Cancelar
- `dashboard.reiniciado`: Se borraron las respuestas en vivo.
- `dashboard.participacionPorReactivo`: Respuestas por reactivo
- `dashboard.aciertoPorReactivo`: Acierto por reactivo
- `dashboard.aciertoPorPaso`: Acierto por paso del trayecto
- `dashboard.aciertoPorNivel`: Acierto por nivel de lectura
- `dashboard.aciertoPorPisa`: Acierto por proceso PISA
- `dashboard.sinEtiqueta`: Sin etiqueta
- `dashboard.reactivo`: Reactivo
- `dashboard.distractorCorto`: Opción incorrecta más elegida (veces)
- `dashboard.soloCorrectas`: Respuestas correctas en reactivos que piden justificación
- `dashboard.suficiente`: Suficiente
- `dashboard.insuficiente`: Insuficiente
- `dashboard.matriz`: Categoría correcta (filas) frente a categoría elegida (columnas)
- `dashboard.correcta`: Correcta
- `dashboard.elegida`: Elegida
- `dashboard.distractor`: Distractor más elegido
- `dashboard.falla`: Falla
- `dashboard.sinFalla`: El guion no indica la falla
- `dashboard.ninguno`: Sin errores
- `dashboard.justificacion`: Calidad de la justificación
- `dashboard.tiempoMedio`: Tiempo medio de respuesta
- `dashboard.segundos`: 1.0 s
- `dashboard.sintesis`: Síntesis pedagógica
- `dashboard.pasoMayorFalla`: Paso del trayecto con mayor falla
- `dashboard.intervencion`: Intervención que propone el guion
- `dashboard.sinFallas`: No hay respuestas incorrectas registradas.
- `dashboard.porcentaje`: 1 %
- `dashboard.conteo`: 1
- `dashboard.respuestas`: 1 respuesta
- `dashboard.excluido`: Sin clave: excluido del acierto
- `sistema.almacenamientoNoDisponible`: El almacenamiento local no está disponible; las respuestas se conservan solo mientras la página esté abierta.

## 8. Resultado de las pruebas de control de calidad

`npm run check` (extract → lint → Vitest → build → Playwright) terminó con código 0 en el commit desplegado `1c91e9e`: **416 pruebas Vitest y 32 pruebas Playwright aprobadas**.

| # | Prueba | Estado | Detalle |
|---|---|---|---|
| 1 | Integridad de insumos | ✅ Cumplida | `git status` limpio en `clase muestra/`; los SHA-256 de las 3 fuentes y de las 2 copias de trabajo coinciden con el manifiesto (`tests/inputs-integrity.test.ts`). |
| 2 | Fidelidad | ✅ Cumplida | 380 textos (títulos, bloques, enunciados, opciones, huecos, fichas, expresiones, glosario, intervenciones) aparecen literalmente, normalizados, en las copias extraídas (`tests/content-fidelity.test.ts`). |
| 3 | Sin scroll | ✅ Cumplida | 57 pantallas × 4 vistas (1280×720, 1366×768, 1920×1080, 1024×768) sin desborde ni desplazamiento; también con retroalimentación visible en los 10 reactivos (acierto y error), con el glosario abierto y con las 5 pestañas del dashboard con datos. |
| 4 | Tipografía | ✅ Cumplida | Ningún texto de contenido < 36 px en las 57 pantallas; solo se cargan y usan Montserrat e Inter, servidas desde el propio sitio (sin solicitudes externas). |
| 5 | Contraste | ✅ Cumplida | `scripts/check-contrast.ts`: 14 pares de tokens cumplen WCAG 2.2 AA (mínimo 4.37:1 para `--color-3` en íconos/bordes, que requiere 3:1; texto ≥ 8.74:1). |
| 6 | Navegación | ✅ Cumplida | →/Espacio/Av Pág, ←/Re Pág, Inicio, Fin, F, N, clic en bordes, recarga por hash; con el foco en un reactivo las flechas no cambian de pantalla y Escape devuelve el control. |
| 7 | Interacciones | ✅ Cumplida | Arrastrar y soltar con puntero (1920×1080 y 1280×720), con teclado y por clic; nada se registra antes de enviar; el dashboard refleja las respuestas; justificación suficiente/insuficiente; CSV y reinicio con confirmación; la app funciona con `localStorage` bloqueado. |
| 8 | Accesibilidad | ✅ Cumplida | axe sin violaciones graves ni críticas en las 57 pantallas, con glosario y con notas abiertas; foco visible `--color-2` de 4 px; `prefers-reduced-motion` desactiva la transición. |
| 9 | QR | ✅ Cumplida | La captura del panel en 1920×1080 se decodifica con `jsqr` y coincide con `content/qr-url.json`; lado ≥ 560 px; URL verificada como pública. |
| 10 | Semilla | ✅ Cumplida (banco vacío) | El control «Simulado» existe, está etiquetado y oculta/muestra los datos simulados; los datos en vivo se filtran por separado. Como el guion no trae banco, el dashboard lo indica y arranca vacío; el filtrado por origen se probó además con datos de ejemplo en `tests/metrics.test.ts`. |
| + | Regla 60-30-10 | ✅ Cumplida | Acentos entre 0.2 % y 3.8 % de la superficie por pantalla. |

**Fallas encontradas y corregidas durante la fase 5**

| Falla | Intentos | Corrección |
|---|---|---|
| axe reportó contraste en un estado intermedio de la transición de hover al abrir las notas | 1 | La prueba espera a que terminen las transiciones antes de analizar. |
| (Durante la construcción, antes de la fase 5) desbordes en las pantallas de Volaris, D18/D19 con error y dashboard; carrera al pulsar teclas rápido; `ch` calculado a 16 px | — | Banco de expresiones en columna lateral, retroalimentación compacta, pestañas del dashboard reorganizadas, lectura del hash en cada tecla, medida de línea calculada a 36 px. |

No quedan pruebas pendientes.

## 9. Pendientes para el usuario (por prioridad)

1. **Revisar las marcas `[REVISAR]`** (sección 6) en las notas del presentador (tecla N), en especial duraciones, fases y etiquetas de los reactivos. Si se completan en el guion, regenerar el modelo:
   ```bash
   npm run extract -- --actualizar
   npx tsx scripts/build-slides.ts
   npm run check
   ```
2. **Integrar la rama** `claude/agents-md-complete-task-tff4jh` en `main` cuando la revises (no se abrió pull request; puedo abrirlo si lo pides).
3. **Despliegues automáticos (opcional):** el proyecto de Vercel no está vinculado al repositorio; los despliegues se hicieron por API. Para que cada push despliegue solo, vincula el repositorio en Vercel → Project Settings → Git, o despliega con la CLI:
   ```bash
   npx vercel login
   npx vercel link --yes --project learning-lab-clase-muestra
   npx vercel --prod --yes
   ```
4. **Protección de Vercel:** la URL de producción es pública; las URL únicas de cada despliegue (p. ej. `learning-lab-clase-muestra-24t9jv63d-jesus-angel.vercel.app`) piden inicio de sesión por la protección estándar, que no se modificó. Comparte siempre `https://learning-lab-clase-muestra.vercel.app`.
5. **Verificación en el aula:** probar el escaneo del QR con los celulares del grupo y la app en el proyector (tecla F para pantalla completa).
