import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import { viteSingleFile } from 'vite-plugin-singlefile';
import { fileURLToPath, URL } from 'node:url';

const stub = fileURLToPath(new URL('./src/pdf/optional-deps-stub.js', import.meta.url));

export default defineConfig({
  // Hasil build berupa SATU file HTML (CSS + JS ter-inline) sehingga bisa dibuka
  // langsung dari Windows Explorer (file://) tanpa server dan tanpa internet.
  plugins: [vue(), viteSingleFile()],
  base: './',
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // jsPDF memuat pustaka ini secara opsional untuk fitur doc.html().
      // Fitur itu tidak dipakai, jadi diganti modul kosong agar file hasil build tetap ringan.
      html2canvas: stub,
      dompurify: stub,
      canvg: stub
    }
  },
  build: {
    outDir: 'dist',
    target: 'es2019',
    cssCodeSplit: false,
    assetsInlineLimit: 100000000,
    chunkSizeWarningLimit: 2000
  },
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js']
  }
});
