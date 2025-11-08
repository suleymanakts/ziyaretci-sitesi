// /src/components/Agents.js
// Router bazı projelerde named export `mountAgents` bekliyor.
// Burada hem default render veriyoruz, hem de mountAgents sağlıyoruz.

import { getUsers } from '../api/data.js';

export default function Agents() {
  const html = `
  <section id="agents-wrap" class="max-w-7xl mx-auto p-4">
    <div class="mb-4">
      <h1 class="text-2xl font-semibold">Danışmanlar</h1>
      <p class="text-slate-600">Yayınlanmış kullanıcılar</p>
    </div>
    <div id="agents-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Yükleniyor…</div>
    </div>
  </section>`;
  // Router mount çağırmasa da güvene almak için:
  queueMicrotask(() => { try { mountAgents(); } catch {} });
  return html;
}

export async function mountAgents() {
  const grid = document.getElementById('agents-grid');
  if (!grid) return;

  let users = await Promise.resolve(getUsers());
  if (!Array.isArray(users)) users = [];
  users = users.filter(u => !!u.published).slice().reverse();

  if (!users.length) {
    grid.innerHTML = '<div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Henüz yayınlanmış danışman yok.</div>';
    return;
  }

  grid.innerHTML = users.map(u => {
    const name = u.fullName || u.email || 'Danışman';
    const tel  = (u.phone || '').replace(/\s+/g,'');
    return (
      '<article class="border rounded-xl bg-white p-3 flex items-center gap-3">' +
        '<div class="w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-400">' +
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none">' +
            '<circle cx="12" cy="8" r="4" stroke="currentColor" />' +
            '<path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor"/>' +
          '</svg>' +
        '</div>' +
        '<div class="min-w-0 flex-1">' +
          '<h3 class="font-medium truncate">'+name+'</h3>' +
          '<div class="mt-1 text-sm text-slate-600 break-words">' +
            (tel ? '<a class="hover:underline" href="tel:'+tel+'">'+tel+'</a>' : '') +
            (tel && u.email ? ' · ' : '') +
            (u.email ? '<a class="hover:underline" href="mailto:'+u.email+'">'+u.email+'</a>' : '') +
          '</div>' +
          '<div class="mt-1 text-xs text-slate-500">' +
            (u.role || 'agent') +
          '</div>' +
        '</div>' +
      '</article>'
    );
  }).join('');
}
