// vite.config.js (ESM) — Node 18+ için uygundur
import { defineConfig } from 'vite';
import path from 'path';
export default defineConfig({
  base: '/',
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
