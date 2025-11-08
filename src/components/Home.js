// /src/components/Home.js
// Ana sayfa: son ilanlar + arama (async data uyumlu)

import { getListings } from '@/api/data.js';

export default function Home() {
  // HTML’i bas; veri mount’ta çekilecek
  queueMicrotask(() => mountHome(document));
  return `
    <section class="container-narrow mx-auto py-6" data-home-root>
      <div class="mb-6">
        <h1 class="text-2xl font-semibold mb-2">EmlakTürk</h1>
        <p class="text-gray-600">Yeni eklenen ve güncellenen ilanları keşfet.</p>
      </div>

      <form id="homeSearch" class="flex gap-2 mb-6">
        <input id="homeQ" name="q" placeholder="Şehir, ilçe, mahalle, başlık…" class="flex-1 border rounded-lg px-3 py-2" autocomplete="off" />
        <button class="px-4 py-2 rounded-lg bg-brand text-white">Ara</button>
      </form>

      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-semibold">Son ilanlar</h2>
        <a class="text-sm text-brand underline" href="#/listings">Tüm ilanlar</a>
      </div>

      <div id="homeGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${skeletonCards(6)}
      </div>
    </section>
  `;
}

export async function mountHome(root) {
  const host = root?.querySelector?.('[data-home-root]') || document.querySelector('[data-home-root]');
  if (!host) return;
  const form = host.querySelector('#homeSearch');
  const input = host.querySelector('#homeQ');
  const grid  = host.querySelector('#homeGrid');

  input.value = sessionStorage.getItem('publicSearch.q') || '';

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = String(input.value || '').trim();
    sessionStorage.setItem('publicSearch.q', q);
    location.hash = '#/listings';
  });

  const rerender = async () => {
    const q = String(input.value || '').trim();
    const items = await readLatest(q);
    grid.innerHTML = items.length ? items.map(renderCard).join('') : emptyState();
  };

  input.addEventListener('input', rerender);
  window.addEventListener('listings:changed', rerender);

  await rerender();
}

// ---- helpers ----
async function readLatest(q = '') {
  const all = await getListings();
  const norm = (Array.isArray(all) ? all : []).map(x => ({
    ...x,
    _ts: toTs(x.updatedAt) || toTs(x.createdAt) || 0
  })).sort((a, b) => b._ts - a._ts);
  return filterByQuery(norm, q).slice(0, 6);
}
function filterByQuery(arr, q) {
  if (!q) return arr;
  const needle = q.toLowerCase();
  return arr.filter(x => {
    const txt = [
      x.title, x.description, x.type, x.price,
      x?.location?.province, x?.location?.district, x?.location?.neighborhood
    ].map(s => String(s || '').toLowerCase()).join(' ');
    return txt.includes(needle);
  });
}
function toTs(v) { try { return v ? new Date(v).getTime() : 0; } catch { return 0; } }
function esc(s='') { return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function fmt(n){ return n==null?'':new Intl.NumberFormat('tr-TR').format(Number(n))+' ₺'; }
function renderCard(item) {
  const cover = (item.photos && item.photos[item.coverIndex || 0]) || '';
  const loc = [item?.location?.province, item?.location?.district].filter(Boolean).join(' / ');
  return `
    <a href="#/listing/${esc(item.id)}" class="block border rounded-xl overflow-hidden bg-white hover:shadow">
      ${cover ? `<img class="w-full h-40 object-cover" src="${esc(cover)}" alt="">` : ''}
      <div class="p-3">
        <div class="font-semibold truncate">${esc(item.title||'(Başlık yok)')}</div>
        <div class="text-sm text-gray-600 truncate">${esc(loc)}</div>
        ${item.price!=null ? `<div class="mt-1 font-medium">${fmt(item.price)}</div>` : ''}
      </div>
    </a>
  `;
}
function emptyState(){ return `<div class="col-span-full text-gray-600">Gösterilecek ilan yok.</div>`; }
function skeletonCards(n){ return Array.from({length:n}).map(()=>`
  <div class="border rounded-xl p-3 bg-white">
    <div class="w-full h-40 bg-slate-100 rounded mb-2"></div>
    <div class="h-4 bg-slate-100 rounded w-3/4 mb-1"></div>
    <div class="h-3 bg-slate-100 rounded w-1/2"></div>
  </div>`).join(''); }
