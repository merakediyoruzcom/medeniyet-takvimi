import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({ mode }) => {
  if (mode === 'portable') {
    return {
      base: './',
      plugins: [
        react(),
        tailwindcss(),
        viteSingleFile(),
        {
          name: 'stub-pwa-register-portable',
          resolveId(id) {
            if (id === 'virtual:pwa-register') return '\0stub-pwa-register';
            return undefined;
          },
          load(id) {
            if (id === '\0stub-pwa-register') {
              return 'export function registerSW() { return async () => {}; }';
            }
            return undefined;
          },
        },
      ],
      build: {
        outDir: 'portable',
        emptyOutDir: true,
        assetsInlineLimit: 100_000_000,
      },
    };
  }

  return {
    base: './',
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        injectRegister: null,
        includeAssets: ['icons/icon.svg', 'icons/apple-touch-icon.png'],
        manifest: {
          name: 'Medeniyet Takvimi',
          short_name: 'Medeniyet',
          description:
            'Kış Gündönümü ve M.Ö. 3200 Yazının İcadı milatlı 13 aylık astronomik takvim almanağı.',
          lang: 'tr',
          dir: 'ltr',
          start_url: './',
          scope: './',
          display: 'standalone',
          orientation: 'portrait-primary',
          background_color: '#111317',
          theme_color: '#111317',
          icons: [
            {
              src: './icons/icon-192.png',
              sizes: '192x192',
              type: 'image/png',
            },
            {
              src: './icons/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
            },
            {
              src: './icons/icon-maskable-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'maskable',
            },
          ],
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}'],
          runtimeCaching: [
            {
              urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
              handler: 'StaleWhileRevalidate',
              options: {
                cacheName: 'google-fonts-stylesheets',
                expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 24 * 30 },
              },
            },
            {
              urlPattern: /^https:\/\/fonts\.gstatic\.com\/.*/i,
              handler: 'CacheFirst',
              options: {
                cacheName: 'google-fonts-webfonts',
                expiration: { maxEntries: 30, maxAgeSeconds: 60 * 60 * 24 * 365 },
                cacheableResponse: { statuses: [0, 200] },
              },
            },
          ],
        },
      }),
    ],
    build: {
      outDir: 'dist',
      emptyOutDir: true,
    },
  };
});
