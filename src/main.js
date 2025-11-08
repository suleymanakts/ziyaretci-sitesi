// /src/main.js
import './tw.css';                  // Tailwind çıkışı (adı farklıysa düzelt)
import { initRouter } from '@/router.js';
import Header from '@/components/Header.js';
import Footer from '@/components/Footer.js';

function safeRenderFooter() {
  try {
    const host = document.getElementById('footer');
    if (!host) return;
    const html = (typeof Footer === 'function') ? Footer() : '';
    if (typeof html === 'string') host.innerHTML = html;
  } catch (e) {
    console.warn('[main] footer render failed:', e);
  }
}

function boot() {
  try { Header(); } catch (e) { console.warn('[main] header render failed:', e); }
  safeRenderFooter();
  try { initRouter(); } catch (e) { console.error('[main] router init failed:', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}
