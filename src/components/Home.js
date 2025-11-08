// K5 - Home.js (mountHome dolduruldu; async uyum)
import { getListings } from '@/api/data.js';

export default function Home() {
  // Grid içerik mount sırasında doldurulacak
  return `
    <section class="container-narrow mx-auto py-6">
      <h1 class="text-2xl font-semibold mb-2">EmlakTürk</h1>
      <p class="text-gray-600 mb-4">Yeni eklenen ilanları keşfet.</p>
      <div id="homeGrid" class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div class="text-gray-500">Yükleniyor…</div>
      </div>
    </section>
  `;
}

export async function mountHome(root) {
  const host = (root && root.querySelector?.('section')) || document.querySelector('section.container-narrow');
  if (!host) return;
  const grid = host.querySelector('#homeGrid');
  if (!grid) return;

  const fill = (arr=[]) => {
    grid.innerHTML = arr.length
      ? arr.map(i => `
          <a href="#/listing/${i.id}" class="block border rounded-lg p-3 bg-white hover:shadow">
            <div class="font-semibold">${i.title || '(Başlık yok)'}</div>
            <div class="text-sm text-gray-600">${i?.location?.province || ''}</div>
            <div class="text-sm text-gray-700">${i.price ? new Intl.NumberFormat('tr-TR').format(i.price) + ' ₺' : ''}</div>
          </a>`).join('')
      : `<div class="text-gray-500">Henüz ilan yok.</div>`;
  };

  const all = await getListings();
  const items = (Array.isArray(all) ? all : []).filter(x => x.published !== false).slice(0, 6);
  fill(items);

  const rerender = async () => {
    const a = await getListings();
    const items = (Array.isArray(a) ? a : []).filter(x => x.published !== false).slice(0, 6);
    fill(items);
  };
  window.addEventListener('listings:changed', rerender);
}
