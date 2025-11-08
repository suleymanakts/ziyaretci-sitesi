// K5 - Header.js (değişmedi)
import { isAuthenticated, currentUser, logout } from '../auth.js';
import { canAny } from '../permissions.js';

export default function Header() {
  const host = document.getElementById('header');
  if (!host) return;

  const authed = isAuthenticated();
  const user = currentUser();

  const roleBadge = authed
    ? `<span class="inline-flex items-center text-xs px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">${user?.role || 'agent'}</span>`
    : '';

  const showAdmin = authed && (
    ['admin', 'broker', 'director'].includes(user?.role) ||
    canAny(user, ['users:read', 'reports:view:all', 'settings:write', 'listings:archive:view'])
  );

  host.innerHTML = `
    <div class="max-w-6xl mx-auto flex items-center justify-between p-4">
      <a href="#/" class="font-semibold text-lg">EmlakTürk</a>
      <nav class="flex items-center gap-4">
        <a href="#/" class="hover:underline">Ana Sayfa</a>
        <a href="#/listings" class="hover:underline">İlanlar</a>
        ${showAdmin ? `<a href="#/admin" class="hover:underline">Admin</a>` : ''}
        ${authed
          ? `<span class="hidden md:inline text-sm text-gray-500">${user?.email || ''}</span>${roleBadge}<button id="logoutBtn" class="text-red-600 hover:underline">Çıkış</button>`
          : `<a href="#/login" class="hover:underline">Giriş</a><a href="#/register" class="hover:underline">Kayıt</a>`}
      </nav>
    </div>
  `;

  host.querySelector('#logoutBtn')?.addEventListener('click', (e) => {
    e.preventDefault();
    logout();
    location.hash = '#/';
  });
}

window.addEventListener('auth:changed', Header);
window.addEventListener('hashchange', Header);
