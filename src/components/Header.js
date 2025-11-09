// /src/components/Header.js
import { isAuthenticated, currentUser, logout } from '@/auth.js';

export default function Header() {
  const host = document.getElementById('header');
  if (!host) return;

  const authed = isAuthenticated();
  const user = currentUser();

  host.innerHTML = `
    <div class="max-w-6xl mx-auto flex items-center justify-between p-4">
      <a href="#/" class="font-semibold text-lg">EmlakTürk</a>

      <nav class="flex items-center gap-4 text-sm">
        <a href="#/" class="hover:underline">Ana Sayfa</a>
        <a href="#/listings" class="hover:underline">İlanlar</a>
        <a href="#/agents" class="hover:underline">Danışmanlar</a>

        ${authed ? `
          <a href="#/admin" class="hover:underline">Admin</a>
          <span class="text-xs text-gray-500 hidden md:inline">(${user?.email || ''})</span>
          <button id="logoutBtn" class="text-red-600 hover:underline">Çıkış</button>
        ` : `
          <a href="#/login" class="hover:underline">Giriş</a>
          <a href="#/register" class="hover:underline">Kayıt</a>
        `}
      </nav>
    </div>
  `;

  host.querySelector('#logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    location.hash = '#/';
  });
}

window.addEventListener('auth:changed', () => Header());
window.addEventListener('hashchange', () => Header());
