/**
 * Extracción de insumos.
 *
 * 1. Inventaría INSUMOS_DIR y asigna un rol a cada archivo (contenido, guion, qr).
 * 2. Lee contenido y guion según su formato (.md/.txt directo, .docx con mammoth, .pdf con pdfjs-dist).
 * 3. Escribe copias de trabajo normalizadas en content/extracted/.
 * 4. Genera manifest.json con ruta original, formato y SHA-256 de cada fuente.
 * 5. Falla si una fuente cambió respecto al manifiesto y no se pidió actualizarlo
 *    (npm run extract -- --actualizar).
 *
 * Nunca escribe dentro de INSUMOS_DIR.
 */
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { EXTRACTED_DIR, INSUMOS_DIR, MANIFEST_PATH, ROOT } from './config.ts';

type Rol = 'contenido' | 'guion' | 'qr';

interface Candidato {
  archivo: string;
  rol: Rol | null;
  motivo: string;
  tamano: number;
  modificado: number;
}

export interface Manifiesto {
  generado: string;
  insumos_dir: string;
  fuentes: Array<{
    rol: Rol;
    ruta_original: string;
    formato: string;
    sha256: string;
    copia_de_trabajo: string | null;
    sha256_copia: string | null;
  }>;
  descartados: Array<{ archivo: string; motivo: string }>;
  ignorados: Array<{ archivo: string; motivo: string }>;
  normalizaciones: string[];
}

const FORMATOS_TEXTO = ['.md', '.txt', '.docx', '.pdf'];

export const sha256 = (buf: Buffer | string) => createHash('sha256').update(buf).digest('hex');

function asignarRol(archivo: string, contenido: string): { rol: Rol | null; motivo: string } {
  const nombre = archivo.toLowerCase();
  const ext = path.extname(nombre);
  if (nombre === 'agents.md') {
    return { rol: null, motivo: 'Instrucciones para el agente; no es un insumo de la clase.' };
  }
  if (ext === '.svg') {
    return { rol: 'qr', motivo: 'Archivo SVG con código QR.' };
  }
  if (!FORMATOS_TEXTO.includes(ext)) {
    return {
      rol: null,
      motivo: `Formato ${ext} no corresponde a contenido, guion ni QR (es la ficha de práctica a la que apunta el QR).`,
    };
  }
  if (/guion|gui[oó]n|docente/.test(nombre) || /^#\s*gui[oó]n docente/im.test(contenido)) {
    return { rol: 'guion', motivo: 'Nombre y encabezado "Guion docente".' };
  }
  if (/presentacion|presentación|contenido/.test(nombre)) {
    return { rol: 'contenido', motivo: 'Nombre "presentación": texto explícito de las diapositivas.' };
  }
  return { rol: null, motivo: 'No encaja en ningún rol.' };
}

async function leerTexto(ruta: string): Promise<string> {
  const ext = path.extname(ruta).toLowerCase();
  if (ext === '.md' || ext === '.txt') return readFileSync(ruta, 'utf8');
  if (ext === '.docx') {
    const mammoth = await import('mammoth');
    const r = await mammoth.extractRawText({ path: ruta });
    return r.value;
  }
  if (ext === '.pdf') {
    const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');
    const doc = await pdfjs.getDocument({ data: new Uint8Array(readFileSync(ruta)) }).promise;
    const paginas: string[] = [];
    for (let i = 1; i <= doc.numPages; i++) {
      const p = await doc.getPage(i);
      const tc = await p.getTextContent();
      paginas.push(tc.items.map((it) => ('str' in it ? it.str : '')).join(' '));
    }
    return paginas.join('\n\n');
  }
  throw new Error(`Formato no soportado: ${ext}`);
}

/** Normalización menor: finales de línea, NFC, espacios finales y líneas en blanco repetidas. */
export function normalizar(texto: string): string {
  return (
    texto
      .normalize('NFC')
      .replace(/\r\n?/g, '\n')
      .replace(/[ \t]+$/gm, '')
      .replace(/(\p{L})-\n(\p{Ll})/gu, '$1$2')
      .replace(/\n{3,}/g, '\n\n')
      .trim() + '\n'
  );
}

export function inventariar(): Candidato[] {
  if (!existsSync(INSUMOS_DIR)) throw new Error(`No existe INSUMOS_DIR: ${INSUMOS_DIR}`);
  return readdirSync(INSUMOS_DIR)
    .filter((f) => statSync(path.join(INSUMOS_DIR, f)).isFile())
    .map((archivo) => {
      const ruta = path.join(INSUMOS_DIR, archivo);
      const ext = path.extname(archivo).toLowerCase();
      const muestra = ext === '.md' || ext === '.txt' ? readFileSync(ruta, 'utf8').slice(0, 400) : '';
      const st = statSync(ruta);
      return { archivo, ...asignarRol(archivo, muestra), tamano: st.size, modificado: st.mtimeMs };
    });
}

async function main() {
  const actualizar = process.argv.includes('--actualizar');
  const candidatos = inventariar();
  const descartados: Manifiesto['descartados'] = [];
  const ignorados = candidatos
    .filter((c) => c.rol === null)
    .map((c) => ({ archivo: c.archivo, motivo: c.motivo }));

  const elegidos = new Map<Rol, Candidato>();
  for (const rol of ['contenido', 'guion', 'qr'] as Rol[]) {
    const lista = candidatos
      .filter((c) => c.rol === rol)
      .sort((a, b) => b.tamano - a.tamano || b.modificado - a.modificado);
    if (lista.length === 0) {
      console.error(`CONDICIÓN DE PARADA: falta el insumo con rol "${rol}" en ${INSUMOS_DIR}`);
      process.exit(2);
    }
    elegidos.set(rol, lista[0]);
    for (const d of lista.slice(1)) {
      descartados.push({ archivo: d.archivo, motivo: `Otro candidato a ${rol}, menos completo o reciente.` });
    }
  }

  const salidas: Record<'contenido' | 'guion', string> = {
    contenido: 'contenido.txt',
    guion: 'guion-docente.txt',
  };
  const fuentes: Manifiesto['fuentes'] = [];
  const textos = new Map<string, string>();

  for (const [rol, c] of elegidos) {
    const ruta = path.join(INSUMOS_DIR, c.archivo);
    const buf = readFileSync(ruta);
    let copia: string | null = null;
    let shaCopia: string | null = null;
    if (rol !== 'qr') {
      const texto = normalizar(await leerTexto(ruta));
      if (texto.trim().length < 200) {
        console.error(`CONDICIÓN DE PARADA: la extracción de ${c.archivo} es ilegible o está vacía.`);
        process.exit(2);
      }
      copia = path.posix.join('content/extracted', salidas[rol]);
      textos.set(copia, texto);
      shaCopia = sha256(texto);
    }
    fuentes.push({
      rol,
      ruta_original: path.relative(ROOT, ruta).split(path.sep).join('/'),
      formato: path.extname(c.archivo).slice(1).toLowerCase(),
      sha256: sha256(buf),
      copia_de_trabajo: copia,
      sha256_copia: shaCopia,
    });
  }

  // Verificación contra el manifiesto existente.
  if (existsSync(MANIFEST_PATH) && !actualizar) {
    const previo = JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifiesto;
    const cambios: string[] = [];
    for (const f of fuentes) {
      const p = previo.fuentes.find((x) => x.rol === f.rol);
      if (!p) cambios.push(`${f.rol}: no estaba en el manifiesto`);
      else if (p.ruta_original !== f.ruta_original) cambios.push(`${f.rol}: cambió de archivo`);
      else if (p.sha256 !== f.sha256) cambios.push(`${f.rol}: ${f.ruta_original} cambió (SHA-256 distinto)`);
    }
    if (cambios.length) {
      console.error('Las fuentes cambiaron respecto al manifiesto:\n- ' + cambios.join('\n- '));
      console.error('Revisa los cambios y vuelve a extraer con: npm run extract -- --actualizar');
      process.exit(1);
    }
  }

  mkdirSync(EXTRACTED_DIR, { recursive: true });
  for (const [rel, texto] of textos) writeFileSync(path.join(ROOT, rel), texto);

  const manifiesto: Manifiesto = {
    generado: existsSync(MANIFEST_PATH) && !actualizar
      ? (JSON.parse(readFileSync(MANIFEST_PATH, 'utf8')) as Manifiesto).generado
      : new Date().toISOString(),
    insumos_dir: path.relative(ROOT, INSUMOS_DIR),
    fuentes,
    descartados,
    ignorados,
    normalizaciones: [
      'Unicode NFC',
      'Saltos de línea CRLF → LF',
      'Espacios finales de línea eliminados (incluye los dobles espacios de salto de línea de Markdown)',
      'Guiones de corte de palabra al final de línea unidos',
      'Tres o más saltos de línea consecutivos reducidos a dos',
    ],
  };
  writeFileSync(MANIFEST_PATH, JSON.stringify(manifiesto, null, 2) + '\n');

  console.log('Inventario de insumos:');
  for (const c of candidatos) console.log(`  - ${c.archivo} → ${c.rol ?? 'ignorado'} (${c.motivo})`);
  console.log(`Extracción correcta. Manifiesto: ${path.relative(ROOT, MANIFEST_PATH)}`);
}

const esPrincipal = process.argv[1] && path.resolve(process.argv[1]).endsWith('extract-content.ts');
if (esPrincipal) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
