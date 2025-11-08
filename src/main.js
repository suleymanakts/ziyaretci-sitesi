// /src/main.js
import Header from './components/Header.js';
import Footer from './components/Footer.js';
import { initRouter, renderRoute } from './router.js';
import { logout } from './auth.js';
import '@/tw.css';

function mountShell() {
  const app = document.getElementById('app');
  app.innerHTML = `
    <div class="min-h-screen flex flex-col">
      <header id="site-header"></header>
      <main id="view" class="flex-1"></main>
      <footer id="site-footer"></footer>
    </div>`;
  document.getElementById('site-header').innerHTML = Header();
  document.getElementById('site-footer').innerHTML = Footer();
}

// ÇIKIŞ köprüsü: logout + login’e yönlendir (redirect=admin)
window.__doLogout = () => {
  logout();
  const loginHash = '#/login?redirect=%23/admin';
  const same = location.hash === loginHash;
  location.hash = loginHash;
  if (same) window.dispatchEvent(new HashChangeEvent('hashchange'));
};

// OTURUM değişince: header’ı yenile + o anki route’u tekrar çiz
window.addEventListener('auth:changed', () => {
  const h = document.getElementById('site-header');
  if (h) h.innerHTML = Header();
  // hash değişmediyse bile form mount’larının tekrar bağlanması için
  if (typeof renderRoute === 'function') renderRoute();
});

function boot() {
  mountShell();
  initRouter();
  renderRoute(); // ilk çizim (güvenli)
}
document.addEventListener('DOMContentLoaded', () => {
Header();
 initRouter();    
});