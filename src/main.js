// K5 - main.js (değişmedi)
import './tw.css';
import { initRouter } from './router.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';

function boot() {
  const headerHost = document.getElementById('header');
  const footerHost = document.getElementById('footer');

  if (headerHost) Header();
  if (footerHost) footerHost.innerHTML = Footer?.() || '';

  initRouter();
}

document.addEventListener('DOMContentLoaded', boot);
