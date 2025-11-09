// /src/components/Listings.js
import { getListings } from '@/api/data.js';
import { formatPrice } from '@/utils/format.js';

export default function Listings() {
  const state = { q: sessionStorage.getItem('publicSearch.q') || '' };
  const { rows } = compute(state.q);

  return `
    <section class="container-narrow mx-auto" data-listings-root>
      <h1 class="text-2xl font-semibold mb-4">İlanlar</h1>

      <form id="listSearch" class="flex gap-2 mb-4">
        <input id="listQ" placeholder="Ara…" value="${esc(state.q)}" class="flex-1 border rounded px-3 py-2" />
        <button class="px-4 py-2 rounded bg-brand text-white">Ara</button>
      </form>

      ${rows.length ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          ${rows.map(card).join('')}
        </div>
      ` : `<p class="text-gray-600">Sonuç bulunamadı.</p>`}
    </section>
  `;
}

export function mountListings(root) {
  const host = root?.querySelector('[data-listings-root]') || root;
  const form = host.querySelector('#listSearch');
  const input = host.querySelector('#listQ');

  const rerender = () => {
    const q = String(input.value || '').trim().toLowerCase();
    sessionStorage.setItem('publicSearch.q', q);
    const { rows } = compute(q);
    const html = rows.length
      ? `<div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">${rows.map(card).join('')}</div>`
      : `<p class="text-gray-600">Sonuç bulunamadı.</p>`;
    const container = host.querySelector('[data-listings-root]');
    if (container) container.innerHTML = `
      <h1 class="text-2xl font-semibold mb-4">İlanlar</h1>
      <form id="listSearch" class="flex gap-2 mb-4">
        <input id="listQ" placeholder="Ara…" value="${esc(q)}" class="flex-1 border rounded px-3 py-2" />
        <button class="px-4 py-2 rounded bg-brand text-white">Ara</button>
      </form>
      ${html}
    `;
  };

  form.addEventListener('submit', (e) => { e.preventDefault(); rerender(); });
  input.addEventListener('input', () => { rerender(); });

  window.addEventListener('listings:changed', () => {
    input.value = sessionStorage.getItem('publicSearch.q') || '';
    rerender();
  });
}

function compute(q) {
  const all = getListings();
  const filtered = (q ? filter(all, q) : all) || [];
  return { rows: filtered };
}
function filter(arr, q) {
  const s = String(q).toLowerCase();
  return arr.filter(x => {
    const hay = [
      x.title, x.desc, x.type, x.price,
      x?.location?.province, x?.location?.district, x?.location?.neighborhood
    ].map(v => String(v || '').toLowerCase()).join(' ');
    return hay.includes(s);
  });
}
function card(x) {
  const price = x.price != null ? formatPrice(x.price) : '';
  const cover = (x.photos && x.photos[x.coverIndex || 0]) || '';
  const loc = [x?.location?.province, x?.location?.district].filter(Boolean).join(' / ');
  return `
    <a href="#/listing/${esc(x.id)}" class="block border rounded-xl overflow-hidden bg-white hover:shadow">
      ${cover ? `<img class="w-full h-40 object-cover" src="${esc(cover)}" alt="">` : ''}
      <div class="p-3">
        <div class="font-semibold truncate">${esc(x.title||'(Başlık yok)')}</div>
        <div class="text-sm text-gray-600 truncate">${esc(loc)}</div>
        ${price ? `<div class="mt-1 font-medium">${price}</div>` : ''}
      </div>
    </a>
  `;
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
