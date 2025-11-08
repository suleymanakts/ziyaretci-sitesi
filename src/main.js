// /src/main.js
import './tw.css'; // Tailwind çıktı dosyan (adı sende farklıysa onu yaz)
import { initRouter } from './router.js';
import Header from './components/Header.js';
import Footer from './components/Footer.js';

function boot() {
  // header & footer yerleşimi (senin HTML yapına uyacak şekilde)
  const headerHost = document.getElementById('header');
  const footerHost = document.getElementById('footer');
  if (headerHost) headerHost.innerHTML = Header();
  if (footerHost) footerHost.innerHTML = Footer?.() || '';

  initRouter();
}
document.addEventListener('DOMContentLoaded', boot);
