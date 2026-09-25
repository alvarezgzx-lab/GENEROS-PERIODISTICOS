/**
 * Configuración compartida de los scripts de compilación.
 * INSUMOS_DIR es la carpeta de insumos del usuario (solo lectura).
 * AGENTS.md la nombra "Cédula 1/clase muestra/"; en este repositorio la carpeta
 * está en la raíz con el nombre "clase muestra/".
 */
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const INSUMOS_DIR = path.join(ROOT, 'clase muestra');
export const EXTRACTED_DIR = path.join(ROOT, 'content', 'extracted');
export const MANIFEST_PATH = path.join(EXTRACTED_DIR, 'manifest.json');
export const QR_URL_PATH = path.join(ROOT, 'content', 'qr-url.json');
export const QR_ASSET_PATH = path.join(ROOT, 'src', 'assets', 'qr-ficha.svg');
