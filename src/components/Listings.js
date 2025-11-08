// K5 - Listings.js (mountListings dolduruldu; async uyum)
import { getListings } from '@/api/data.js';

export default function Listings() {
  // Liste mount sırasında doldurulacak
  return `
    <section class="container-narrow mx-auto py-6">
      <h2 class="text-xl font-semibold mb-4">Tüm İlanlar</h2>
      <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        <div class="text-gray-500">Yükleniyor…</div>
      </div>
    </section>
  `;
}

export async function mountListings(root) {
  const host = (root && root.querySelector?.('section')) || document.querySelector('section.container-narrow');
  if (!host) return;
  const grid = host.querySelector('.grid');
  if (!grid) return;

  const render = (arr=[]) => {
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
  render(Array.isArray(all) ? all.filter(x => x.published !== false) : []);

  window.addEventListener('listings:changed', async () => {
    const a = await getListings();
    render(Array.isArray(a) ? a.filter(x => x.published !== false) : []);
  });
}
