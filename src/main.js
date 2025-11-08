// K5 - main.js
import './tw.css';
import { initRouter } from './router.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';

function safeRenderHeader() {
  try {
    const host = document.getElementById('header');
    if (!host) return;
    // Header kendi içinde host'a yazar (innerHTML set eder)
    Header();
  } catch (e) {
    console.warn('[main] header render failed:', e);
  }
}

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
  safeRenderHeader();
  safeRenderFooter();

  try {
    initRouter();
  } catch (e) {
    console.error('[main] router init failed:', e);
  }
}

// DOM hazır olunca başlat
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else {
  boot();
}

// Header/Footer, auth veya route değişince otomatik tazelensin
window.addEventListener('auth:changed', () => { safeRenderHeader(); safeRenderFooter(); });
window.addEventListener('hashchange',     () => { safeRenderHeader(); safeRenderFooter(); });
