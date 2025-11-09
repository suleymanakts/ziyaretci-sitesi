// /src/main.js
import './style.css'; // veya ./tw.css
import { initRouter } from '@/router.js';
import Header from '@/components/Header.js';

function boot() {
  Header();           // ilk çizim
  initRouter();       // router

  // auth değişince header tazele
  window.addEventListener('auth:changed', () => {
    Header();
  });
}
document.addEventListener('DOMContentLoaded', boot);
