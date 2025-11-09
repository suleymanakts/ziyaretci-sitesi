// /src/components/ListingDetail.js
import { findListing } from '@/api/data.js';
import { formatPrice } from '@/utils/format.js';

export default function ListingDetail(id) {
  const x = findListing(id);
  if (!x) {
    return `<section class="container-narrow mx-auto py-6"><h1 class="text-xl font-semibold">İlan bulunamadı</h1></section>`;
  }

  const price = x.price != null ? formatPrice(x.price) : '';
  const cover = (x.photos && x.photos[x.coverIndex || 0]) || '';
  const loc = [x?.location?.province, x?.location?.district, x?.location?.neighborhood].filter(Boolean).join(' / ');

  return `
    <section class="container-narrow mx-auto py-6" data-detail-root>
      <div class="grid md:grid-cols-2 gap-6">
        <div>
          ${cover ? `<img class="w-full rounded-lg mb-3 object-cover" style="max-height:360px" src="${esc(cover)}" alt="">` : ''}
          ${renderGallery(x.photos || [], x.coverIndex||0)}
        </div>
        <div>
          <h1 class="text-2xl font-semibold mb-2">${esc(x.title||'(Başlık yok)')}</h1>
          ${price ? `<div class="text-xl font-medium mb-1">${price}</div>` : ''}
          <div class="text-gray-600 mb-3">${esc(loc)}</div>
          <p class="mb-4 whitespace-pre-wrap">${esc(x.desc||'')}</p>

          ${renderShare(x)}
        </div>
      </div>
    </section>
  `;
}

function renderGallery(photos, coverIndex) {
  if (!photos?.length) return '';
  const thumbs = photos.map((p,i)=>`
    <img src="${esc(p)}" data-idx="${i}" class="w-20 h-16 object-cover rounded border cursor-pointer ${i===coverIndex?'ring-2 ring-brand':''}" />
  `).join('');
  return `<div class="flex flex-wrap gap-2">${thumbs}</div>`;
}

function renderShare(x) {
  const url = location.href;
  const text = encodeURIComponent(`${x.title || 'İlan'} • ${x?.location?.province||''} ${x?.location?.district||''} • ${x.price?formatPrice(x.price):''} ${url}`);
  const encUrl = encodeURIComponent(url);

  return `
    <div class="mt-4">
      <div class="text-sm text-gray-600 mb-2">Paylaş:</div>
      <div class="flex gap-2">
        <a class="px-2 py-1 border rounded" target="_blank" href="https://wa.me/?text=${text}">WhatsApp</a>
        <a class="px-2 py-1 border rounded" target="_blank" href="https://www.facebook.com/sharer/sharer.php?u=${encUrl}">Facebook</a>
        <a class="px-2 py-1 border rounded" target="_blank" href="https://twitter.com/intent/tweet?url=${encUrl}&text=${text}">X</a>
        <a class="px-2 py-1 border rounded" target="_blank" href="https://www.linkedin.com/sharing/share-offsite/?url=${encUrl}">LinkedIn</a>
        <a class="px-2 py-1 border rounded" href="mailto:?subject=${encodeURIComponent(x.title||'İlan')}&body=${text}">E-posta</a>
      </div>
    </div>
  `;
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
