// /src/main.js
import './tw.css';                  // Tailwind çıkış dosyan (adı farklıysa düzelt)
import { initRouter } from './router.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';

function safeRenderFooter() {
  try {
    const host = document.getElementById('footer');
    if (!host) return;
    // Footer string döndürüyorsa yaz; yoksa boş bırak
    const html = (typeof Footer === 'function') ? Footer() : '';
    if (typeof html === 'string') host.innerHTML = html;
  } catch (e) {
    console.warn('[main] footer render failed:', e);
  }
}

function boot() {
  // HEADER: Header() kendi içinde #header’a yazar (innerHTML atama yok!)
  try { Header(); } catch (e) { console.warn('[main] header render failed:', e); }

  // FOOTER: string döndürüyorsa yerleştir
  safeRenderFooter();

  // Router’ı başlat
  try { initRouter(); } catch (e) { console.error('[main] router init failed:', e); }
}

// DOM hazır olunca başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
