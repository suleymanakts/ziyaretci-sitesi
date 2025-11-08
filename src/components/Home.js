// K5-Rescue Home (kırmızı arama + son ilanlar)
import { getListings } from '@/api/data.js';
import Card from '@/components/Card.js';

export default function Home() {
  const { items } = latest('');
  return `
    <section data-home-root>
      <form id="homeSearch" class="search-bar">
        <input id="homeQ" name="q" placeholder="Şehir, ilçe, mahalle, başlık…" />
        <button>Ara</button>
      </form>

      <div class="flex items-center justify-between mb-3">
        <h2 class="text-xl font-semibold">Son ilanlar</h2>
        <a class="text-sm text-brand underline" href="#/listings">Tüm ilanlar</a>
      </div>

      <div id="homeGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        ${items.length ? items.map(renderCard).join('') : `<div class="col-span-full text-gray-600">Gösterilecek ilan yok.</div>`}
      </div>
    </section>
  `;
}

export function mountHome(root) {
  const host = root?.querySelector?.('[data-home-root]') || root;
  const form = host.querySelector('#homeSearch');
  const input = host.querySelector('#homeQ');
  const grid  = host.querySelector('#homeGrid');

  input.value = sessionStorage.getItem('publicSearch.q') || '';

  const rerender = () => {
    const q = String(input.value || '').trim();
    const { items } = latest(q);
    grid.innerHTML = items.length ? items.map(renderCard).join('') : `<div class="col-span-full text-gray-600">Gösterilecek ilan yok.</div>`;
  };

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const q = String(input.value || '').trim();
    sessionStorage.setItem('publicSearch.q', q);
    location.hash = '#/listings';
  });
  input.addEventListener('input', rerender);
  window.addEventListener('listings:changed', rerender);
}

function latest(q='') {
  const all = Array.isArray(getListings()) ? getListings() : [];
  const norm = all
    .map(x => ({ ...x, _ts: toTs(x.updatedAt) || toTs(x.createdAt) || 0 }))
    .sort((a,b)=> b._ts - a._ts);
  const filtered = filter(norm, q).slice(0, 6);
  return { items: filtered };
}
function filter(arr, q) {
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
function toTs(v){ try { return v ? new Date(v).getTime() : 0; } catch { return 0; } }
function renderCard(item){ try { return Card(item); } catch { return ''; } }
