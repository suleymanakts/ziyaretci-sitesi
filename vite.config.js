// vite.config.js
import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  // Yerel geliştirme sunucusu
  server: {
    host: true,          // ağdaki cihazlardan erişim için
    port: 5173,
    open: true,
    strictPort: true,    // port doluysa değiştirme
  },

  // Production önizleme (npm run preview)
  preview: {
    port: 5174,
    strictPort: true,
  },

  // Derleme ayarları
  build: {
    outDir: 'dist',
    sourcemap: true,     // prod hataları debug için kaynak haritası
    assetsInlineLimit: 0 // görselleri dosya olarak yaz (CDN/Cache için iyi)
  },

  // Alias ve uzantılar
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
    },
    extensions: ['.js', '.json']
  },

  // CSS/Tailwind (postcss.config.cjs kullanır)
  css: {
    postcss: './postcss.config.cjs',
    devSourcemap: true
  },

  // Bağımlılık optimizasyonu (Vite önbelleği için)
  optimizeDeps: {
    include: [],
    exclude: []
  },

  // Statik varlıklar (gerekirse genişlet)
  assetsInclude: ['**/*.svg', '**/*.webp', '**/*.avif']
})
