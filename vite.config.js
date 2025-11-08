// K5 - vite.config.js (değişmedi)
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  base: '/',
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
});
