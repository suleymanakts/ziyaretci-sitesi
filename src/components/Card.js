// /src/components/Card.js
import { formatPrice } from '@/utils/format.js';

export default function Card(x) {
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
