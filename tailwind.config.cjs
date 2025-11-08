/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./index.html', './src/**/*.{js,html}'], // ÖNEMLİ: taranacak dosyalar
  theme: {
    extend: {
      fontFamily: { inter: ['Inter','system-ui','sans-serif'] },
      colors: {
        brand: { DEFAULT:'#e11d48', dark:'#be123c' },   // kırmızı
        brandBlue: { DEFAULT:'#1d4ed8', dark:'#1e40af' }
      },
      boxShadow: {
        soft: '0 6px 24px -8px rgba(0,0,0,.12)'
      }
    }
  },
  plugins: [],
  // Eğer class isimlerini string birleştirerek üretiyorsan (dinamik),
  // purge'a yakalanmaması için güvenlik ağı:
  safelist: [
    'bg-brand','bg-brand-dark','text-brand','text-brand-dark',
    'bg-brandBlue','bg-brandBlue-dark','text-brandBlue','text-brandBlue-dark',
    'shadow-soft','font-inter'
  ]
}
