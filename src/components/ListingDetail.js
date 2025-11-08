// /src/components/ListingDetail.js
import { getListings } from '../api/data.js';

// Basit kaçış
function esc(s) {
  return String(s || '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// OG/Twitter meta injection (dev sırasında)
function injectMeta(listing) {
  try {
    const head = document.head;
    const cleanupName = 'meta-injected';
    // eskiyi temizle
    [...head.querySelectorAll('meta[data-origin="'+cleanupName+'"]')].forEach(n => n.remove());

    const url = location.href;
    const title = listing?.title || 'EmlakTürk İlanı';
    const desc = (listing?.description || '').slice(0, 160);
    const img = (Array.isArray(listing?.photos) && listing.photos.length && listing.coverIndex >= 0)
      ? listing.photos[listing.coverIndex] : '';

    const pairs = [
      ['property','og:type','website'],
      ['property','og:url', url],
      ['property','og:title', title],
      ['property','og:description', desc],
      ['property','og:image', img],

      ['name','twitter:card','summary_large_image'],
      ['name','twitter:title', title],
      ['name','twitter:description', desc],
      ['name','twitter:image', img]
    ];

    pairs.forEach(([attrKey, name, content]) => {
      const m = document.createElement('meta');
      m.setAttribute(attrKey, name);
      if (content) m.setAttribute('content', content);
      m.setAttribute('data-origin', cleanupName);
      head.appendChild(m);
    });
  } catch (_) {}
}

function buildShare(listing) {
  const url = encodeURIComponent(location.href);
  const text = encodeURIComponent(listing?.title || 'EmlakTürk ilanı');
  const img = (Array.isArray(listing?.photos) && listing.photos.length && listing.coverIndex >= 0)
    ? listing.photos[listing.coverIndex] : '';
  const imgUrl = encodeURIComponent(img);

  const items = [
    { label: 'WhatsApp', href: `https://wa.me/?text=${text}%20${url}`, icon: '💬' },
    { label: 'Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${url}`, icon: '📘' },
    { label: 'X',        href: `https://twitter.com/intent/tweet?url=${url}&text=${text}`, icon: '𝕏' },
    { label: 'LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`, icon: 'in' },
    { label: 'E-posta',  href: `mailto:?subject=${text}&body=${text}%0A${url}%0A${imgUrl}`, icon: '✉️' },
  ];

  return `
    <div class="flex flex-wrap gap-2 mt-3">
      ${items.map(i => `
        <a class="px-3 py-1.5 rounded border hover:bg-slate-50 text-sm"
           target="_blank" rel="noopener" href="${i.href}">
           <span class="mr-1">${i.icon}</span>${i.label}
        </a>
      `).join('')}
    </div>
  `;
}

export default function ListingDetail(id) {
  return `
    <section id="detail-wrap" class="max-w-5xl mx-auto p-4">
      <div id="detail-box" class="bg-white border rounded-xl overflow-hidden">
        <div class="p-4 text-sm text-slate-500">Yükleniyor…</div>
      </div>
    </section>
  `;
}

window.__mountDetail = async function(root, id) {
  const box = root.querySelector('#detail-box');
  const all = await getListings();
  const rec = all.find(x => x.id === id);
  if (!rec) {
    box.innerHTML = `
      <div class="p-8 text-center text-slate-600">
        İlan bulunamadı.
      </div>`;
    return;
  }

  // Meta
  injectMeta(rec);

  const cover = (Array.isArray(rec.photos) && rec.photos.length && rec.coverIndex >= 0)
    ? rec.photos[rec.coverIndex] : '';
  const loc = [rec?.location?.province, rec?.location?.district, rec?.location?.neighborhood]
    .filter(Boolean).join(' / ');

  box.innerHTML = `
    ${cover
      ? `<div class="aspect-[16/9] bg-black">
           <img class="w-full h-full object-cover" src="${esc(cover)}" alt="${esc(rec.title)}">
         </div>`
      : `<div class="aspect-[16/9] bg-slate-100 grid place-items-center text-slate-400">Kapak yok</div>`}

    <div class="p-4">
      <h1 class="text-2xl font-semibold">${esc(rec.title)}</h1>
      <div class="text-sm text-slate-500 mt-1">${esc(loc || '-')}</div>
      ${rec.price ? `<div class="text-lg font-semibold mt-2">${Number(rec.price).toLocaleString('tr-TR')} ₺</div>` : ''}

      <p class="mt-3 text-slate-700 whitespace-pre-line">${esc(rec.description || '')}</p>

      ${buildShare(rec)}
    </div>
  `;
};
