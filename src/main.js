// K5-Rescue main
import './tw.css';
import { initRouter } from './router.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';

function safeRenderFooter() {
  const host = document.getElementById('footer');
  if (!host) return;
  try { host.innerHTML = typeof Footer === 'function' ? (Footer() || '') : ''; }
  catch (e) { console.warn('[footer]', e); }
}

function boot() {
  try { Header(); } catch (e) { console.warn('[header]', e); }
  safeRenderFooter();
  try { initRouter(); } catch (e) { console.error('[router init]', e); }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', boot);
} else { boot(); }
