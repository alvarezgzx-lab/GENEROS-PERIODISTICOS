/**
 * Decodifica el QR sanitizado (renderizado en Chromium) con jsqr, guarda la URL
 * en content/qr-url.json y verifica su acceso público con `curl -sIL` sin cookies.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { chromium } from '@playwright/test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { QR_ASSET_PATH, QR_URL_PATH, ROOT } from './config.ts';

export const CHROMIUM = process.env.PW_CHROMIUM ?? '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';

export function decodificarPng(png: Buffer): string | null {
  const img = PNG.sync.read(png);
  const r = jsQR(new Uint8ClampedArray(img.data), img.width, img.height);
  return r?.data ?? null;
}

export function dominioPermitido(url: string): boolean {
  try {
    const h = new URL(url).hostname;
    return h === 'drive.google.com' || h === 'docs.google.com';
  } catch {
    return false;
  }
}

export function verificarAcceso(url: string) {
  try {
    const salida = execFileSync('curl', ['-sIL', '--max-time', '30', url], { encoding: 'utf8' });
    const codigos = [...salida.matchAll(/^HTTP\/[\d.]+ (\d{3})/gm)].map((m) => Number(m[1]));
    const ubicaciones = [...salida.matchAll(/^location:\s*(.+)$/gim)].map((m) => m[1].trim());
    const final = codigos.at(-1) ?? 0;
    const aLogin = ubicaciones.some((u) => u.includes('accounts.google.com'));
    return {
      ejecutada: true,
      codigo_final: final,
      redirecciones: ubicaciones,
      redirige_a_login: aLogin,
      aprobada: final === 200 && !aLogin,
      detalle:
        final === 200 && !aLogin
          ? 'Acceso público confirmado.'
          : `Código final ${final}${aLogin ? ', redirige a accounts.google.com' : ''}.`,
    };
  } catch (e) {
    return {
      ejecutada: false,
      codigo_final: 0,
      redirecciones: [],
      redirige_a_login: false,
      aprobada: false,
      detalle: `curl no pudo completar la solicitud desde este entorno: ${(e as Error).message.split('\n')[0]}`,
    };
  }
}

async function main() {
  const svg = readFileSync(QR_ASSET_PATH, 'utf8');
  const browser = await chromium.launch({ executablePath: CHROMIUM });
  const page = await browser.newPage({ viewport: { width: 900, height: 900 } });
  await page.setContent(
    `<body style="margin:0;background:#FDFFF1;display:grid;place-items:center;height:100vh">
       <img id="qr" style="width:640px;height:640px;padding:80px;background:#FDFFF1" src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">
     </body>`,
  );
  const png = await page.locator('#qr').screenshot();
  await browser.close();
  const url = decodificarPng(png);
  if (!url) {
    console.error('CONDICIÓN DE PARADA: el QR no pudo decodificarse.');
    process.exit(2);
  }
  const verificacion = verificarAcceso(url);
  // Conserva una verificación externa previa (curl -sIL ejecutado fuera de este entorno)
  // solo si corresponde a la misma URL.
  const previo = existsSync(QR_URL_PATH) ? JSON.parse(readFileSync(QR_URL_PATH, 'utf8')) : null;
  const externa = previo?.url === url ? (previo.verificacion_externa ?? null) : null;
  const datos = {
    url,
    decodificado_con: 'jsqr sobre captura PNG de Chromium',
    dominio_permitido: dominioPermitido(url),
    verificacion_local: { ...verificacion, fecha: new Date().toISOString(), comando: `curl -sIL "${url}"` },
    verificacion_externa: externa,
    acceso_publico_verificado: dominioPermitido(url) && (verificacion.aprobada || externa?.aprobada === true),
  };
  writeFileSync(QR_URL_PATH, JSON.stringify(datos, null, 2) + '\n');
  console.log(`URL decodificada: ${url}`);
  console.log(`Dominio permitido: ${datos.dominio_permitido}`);
  console.log(`Verificación local: ${verificacion.detalle}`);
  if (externa) console.log(`Verificación externa: ${externa.detalle}`);
  console.log(`Acceso público verificado: ${datos.acceso_publico_verificado}`);
  console.log(`Guardado en ${path.relative(ROOT, QR_URL_PATH)}`);
}

if (process.argv[1] && path.resolve(process.argv[1]).endsWith('decode-qr.ts')) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
