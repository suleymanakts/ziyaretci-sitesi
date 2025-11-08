// /src/components/Card.js
// Eski ve yeni şemayla uyumlu kart bileşeni:
// - Görsel: photos[0] || images[0]
// - Konum: city || location.province (/district)
// - Tür:   type || mainType
// - Fiyat: formatPrice (utils/format.js)
// - Alan/oda bilgisi varsa alt satıra ekler
import { formatPrice, esc } from '../utils/format.js';

export default function Card(item = {}) {
  const cover =
    (Array.isArray(item.photos) && item.photos[0]) ||
    (Array.isArray(item.images) && item.images[0]) ||
    '';

  const city     = item.city || item.location?.province || '';
  const district = item.location?.district || '';
  const whereStr = city && district ? `${city}/${district}` : (city || district || '');

  const type   = item.type || item.mainType || '';
  const rooms  = item.rooms || item.room || '';
  const area   = item.area_m2 || item.area || item.m2 || '';
  const areaStr = area ? `${area} m²` : '';

  const sub = [whereStr, type, rooms || areaStr].filter(Boolean).join(' · ');

  // Fiyat: utils/format.js -> formatPrice(number) bekler; yoksa boş string
  const priceStr = isFinite(Number(item.price)) ? formatPrice(Number(item.price)) : '';

  // Etiket: opsiyonel; varsa göster (kiralık/satılık vb.)
  const badge = item.offerType
    ? (item.offerType === 'kiralik' ? 'Kiralık' : 'Satılık')
    : (item.status === 'published' ? 'Yayında' : '');

  return `
    <a href="#/listing/${item.id}" class="block bg-white rounded-xl border border-slate-200 overflow-hidden hover:shadow-sm transition">
      <div class="aspect-[4/3] bg-slate-100 relative">
        ${cover ? `<img src="${cover}" alt="${esc(item.title || '')}" class="w-full h-full object-cover">` : ''}
        ${badge ? `<span class="absolute top-2 left-2 text-xs bg-white/90 border border-slate-200 px-2 py-1 rounded-full">${esc(badge)}</span>` : ''}
      </div>

      <div class="p-4">
        <div class="flex items-center justify-between gap-2">
          <h3 class="font-semibold line-clamp-1">${esc(item.title || '(Başlıksız)')}</h3>
          ${priceStr ? `<span class="text-brand font-bold text-sm whitespace-nowrap">${priceStr}</span>` : ''}
        </div>
        ${sub ? `<div class="mt-1 text-xs text-slate-600 line-clamp-1">${esc(sub)}</div>` : ''}
      </div>
    </a>
  `;
}
