// /src/components/ListingDetail.js
// Detay sayfası: galeri + paylaş + OG/Twitter meta injection (dev'de)

import { getListingById } from '../api/data.js';

// basit escape
const esc = (s='') => String(s).replace(/[&<>"']/g, m =>
  ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));

// paylaş linkleri
function buildShareLinks(listing) {
  const url  = location.href;
  const text = `${listing.title || 'Emlak ilanı'} - ${listing?.location?.province || ''} ${listing?.location?.district || ''}`;
  const enc = (v) => encodeURIComponent(v || '');

  return [
    { name:'WhatsApp', href:`https://wa.me/?text=${enc(text + ' ' + url)}` },
    { name:'Facebook', href:`https://www.facebook.com/sharer/sharer.php?u=${enc(url)}` },
    { name:'X', href:`https://twitter.com/intent/tweet?text=${enc(text)}&url=${enc(url)}` },
    { name:'LinkedIn', href:`https://www.linkedin.com/sharing/share-offsite/?url=${enc(url)}` },
    { name:'E-posta', href:`mailto:?subject=${enc(text)}&body=${enc(url)}` },
  ];
}

// dev modda head’e og/twitter meta bas
function injectMeta(listing) {
  try {
    // üretimde genelde SSR/edge tarafında yazılır; burada dev için DOM’a ekliyoruz
    const head = document.head;
    const removeOld = (sel) => head.querySelectorAll(sel).forEach(n=>n.remove());

    removeOld('meta[property^="og:"], meta[name^="twitter:"]');

    const cover = (listing.photos && listing.photos[listing.coverIndex || 0]) || '';
    const title = listing.title || 'EmlakTürk – İlan Detayı';
    const desc  = listing.description || `${listing?.location?.province || ''} ${listing?.location?.district || ''}`.trim();
    const metas = [
      ['property','og:type','article'],
      ['property','og:title', title],
      ['property','og:description', desc],
      ['property','og:url', location.href],
      ['property','og:image', cover],

      ['name','twitter:card', cover ? 'summary_large_image' : 'summary'],
      ['name','twitter:title', title],
      ['name','twitter:description', desc],
      ['name','twitter:image', cover],
    ];

    metas.forEach(([attr, name, content])=>{
      const m=document.createElement('meta');
      m.setAttribute(attr, name);
      if (content) m.setAttribute('content', content);
      head.appendChild(m);
    });
  } catch {}
}

// küçük fiyat formatı
function fmtPrice(n) {
  if (n == null || isNaN(n)) return '';
  return new Intl.NumberFormat('tr-TR').format(Number(n)) + ' ₺';
}

// basit galeri
function Gallery(listing) {
  const photos = Array.isArray(listing.photos) ? listing.photos : [];
  if (!photos.length) return `<div class="aspect-[16/9] bg-slate-100 grid place-items-center text-slate-400">Görsel yok</div>`;

  const coverIdx = Math.max(0, Math.min(Number(listing.coverIndex)||0, photos.length-1));
  const cover = photos[coverIdx];

  return `
    <div class="space-y-2" data-gallery>
      <div class="aspect-[16/9] bg-slate-100 overflow-hidden rounded-lg">
        <img id="galCover" src="${esc(cover)}" class="w-full h-full object-cover" alt="">
      </div>
      <div class="grid grid-cols-4 sm:grid-cols-6 gap-2">
        ${photos.map((p,i)=>`
          <button class="border rounded overflow-hidden ${i===coverIdx?'ring-2 ring-blue-500':''}" data-thumb="${i}" type="button" aria-label="Foto ${i+1}">
            <img src="${esc(p)}" class="w-full h-16 object-cover" alt="">
          </button>
        `).join('')}
      </div>
    </div>
  `;
}

export default function ListingDetail(id) {
  // HTML’i hemen döndür, mount’ta veriyi çekip dolduracağız
  queueMicrotask(()=>mountListingDetail(id)); // router çağırmasa bile garanti
  return `
    <section class="container-narrow mx-auto py-6" data-detail-root>
      <div id="detailBody" class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-2">
          ${Skeleton()}
        </div>
        <aside class="space-y-3">
          <div class="border rounded-lg p-3 bg-white">
            <div class="h-5 w-40 bg-slate-200 rounded mb-2"></div>
            <div class="h-4 w-24 bg-slate-200 rounded"></div>
          </div>
          <div class="border rounded-lg p-3 bg-white">
            <div class="h-5 w-32 bg-slate-200 rounded mb-2"></div>
            <div class="space-y-1">
              <div class="h-4 w-full bg-slate-200 rounded"></div>
              <div class="h-4 w-5/6 bg-slate-200 rounded"></div>
            </div>
          </div>
        </aside>
      </div>
    </section>
  `;
}

export async function mountListingDetail(id, root) {
  const host = root?.querySelector?.('[data-detail-root]') || document.querySelector('[data-detail-root]');
  if (!host) return;

  const rec = await getListingById(id);
  if (!rec) {
    host.innerHTML = `
      <section class="container-narrow mx-auto py-12 text-center">
        <h1 class="text-xl font-semibold mb-2">İlan bulunamadı</h1>
        <a class="text-blue-600 underline" href="#/listings">Tüm ilanlara dön</a>
      </section>`;
    return;
  }

  // meta (dev)
  injectMeta(rec);

  const loc = [rec?.location?.province, rec?.location?.district, rec?.location?.neighborhood].filter(Boolean).join(' / ');
  const share = buildShareLinks(rec);

  host.querySelector('#detailBody').outerHTML = `
    <div id="detailBody" class="grid md:grid-cols-3 gap-6">
      <div class="md:col-span-2 space-y-4">
        ${Gallery(rec)}
        <div class="border rounded-lg p-4 bg-white">
          <h1 class="text-2xl font-semibold mb-1">${esc(rec.title || '(Başlık yok)')}</h1>
          <div class="text-slate-600">${esc(loc)}</div>
          ${rec.price ? `<div class="mt-2 text-xl font-bold">${fmtPrice(rec.price)}</div>` : ''}
          <div class="mt-3 text-slate-700 whitespace-pre-wrap">${esc(rec.description || '')}</div>
          ${rec.videoUrl ? `
            <div class="mt-4">
              <a class="inline-flex items-center px-3 py-1.5 rounded border" href="${esc(rec.videoUrl)}" target="_blank" rel="noopener">Videoyu Aç</a>
            </div>` : ''
          }
        </div>
      </div>

      <aside class="space-y-3">
        <div class="border rounded-lg p-3 bg-white">
          <div class="font-semibold mb-2">Paylaş</div>
          <div class="flex flex-wrap gap-2">
            ${share.map(s=>`<a class="px-2.5 py-1 rounded border text-sm hover:bg-slate-50" target="_blank" rel="noopener" href="${esc(s.href)}">${esc(s.name)}</a>`).join('')}
          </div>
        </div>

        <div class="border rounded-lg p-3 bg-white">
          <div class="font-semibold mb-2">Özellikler</div>
          <ul class="text-sm text-slate-700 space-y-1">
            <li><span class="text-slate-500">Durum:</span> ${esc(rec.transactionType || '-')}</li>
            <li><span class="text-slate-500">Sınıf:</span> ${esc(rec.propertyClass || '-')}</li>
            ${rec.subcategory ? `<li><span class="text-slate-500">Alt Tür:</span> ${esc(rec.subcategory)}</li>` : ''}
            ${rec.area ? `<li><span class="text-slate-500">Alan:</span> ${esc(rec.area)} m²</li>` : ''}
          </ul>
        </div>

        <div class="border rounded-lg p-3 bg-white">
          <a class="inline-flex items-center px-3 py-1.5 rounded bg-blue-600 text-white" href="tel:">Arayın</a>
        </div>
      </aside>
    </div>
  `;

  // küçük galeri davranışı (thumb → kapak)
  const gal = host.querySelector('[data-gallery]');
  if (gal) {
    gal.addEventListener('click', (e)=>{
      const btn = e.target.closest('[data-thumb]');
      if (!btn) return;
      const i = Number(btn.getAttribute('data-thumb')||0);
      const src = (Array.isArray(rec.photos) ? rec.photos[i] : '') || '';
      const img = host.querySelector('#galCover');
      if (img && src) img.src = src;
      gal.querySelectorAll('[data-thumb]').forEach(x=>x.classList.remove('ring-2','ring-blue-500'));
      btn.classList.add('ring-2','ring-blue-500');
    });
  }
}

// iskelet
function Skeleton() {
  return `
    <div class="space-y-2">
      <div class="aspect-[16/9] bg-slate-100 rounded-lg"></div>
      <div class="bg-white border rounded-lg p-4 space-y-2">
        <div class="h-6 w-56 bg-slate-200 rounded"></div>
        <div class="h-4 w-40 bg-slate-200 rounded"></div>
        <div class="h-4 w-5/6 bg-slate-200 rounded"></div>
      </div>
    </div>`;
}
