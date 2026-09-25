import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

// App estática: sin backend ni servicios externos. La PWA guarda la app en caché
// tras la primera carga para funcionar sin conexión durante la clase.
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'script-defer',
      manifest: {
        name: 'A Learning Lab · Los géneros periodísticos',
        short_name: 'Clase muestra',
        lang: 'es-MX',
        display: 'fullscreen',
        background_color: '#000000',
        theme_color: '#000000',
        icons: [{ src: 'icon.svg', sizes: 'any', type: 'image/svg+xml' }],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,svg,woff2}'],
        navigateFallback: 'index.html',
      },
    }),
  ],
  build: { outDir: 'dist', assetsInlineLimit: 0 },
});
