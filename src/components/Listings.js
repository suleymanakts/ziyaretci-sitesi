// /src/components/Listings.js
import { getListings } from '../api/data.js';

export default function Listings() {
  const html = `
  <section id="list-wrap" class="max-w-7xl mx-auto p-4">
    <div class="mb-3">
      <h1 class="text-2xl font-semibold">İlanlar</h1>
      <div class="mt-2 flex flex-wrap gap-2 text-sm">
        <select id="flt-class" class="px-2 py-1 rounded border">
          <option value="">Sınıf (hepsi)</option>
          <option value="Konut">Konut</option>
          <option value="Ticari">Ticari</option>
          <option value="Arsa">Arsa</option>
        </select>
        <select id="flt-intent" class="px-2 py-1 rounded border">
          <option value="">Durum (hepsi)</option>
          <option value="satilik">Satılık</option>
          <option value="kiralik">Kiralık</option>
        </select>
      </div>
    </div>
    <div id="list-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Yükleniyor…</div>
    </div>
  </section>`;
  queueMicrotask(() => { try { mountListings(); } catch {} });
  return html;
}

export async function mountListings() {
  const grid = document.getElementById('list-grid');
  if (!grid) return;

  let all = await Promise.resolve(getListings());
  if (!Array.isArray(all)) all = [];
  let data = all.filter(x => !!x.published).slice().reverse();

  const classSel  = document.getElementById('flt-class');
  const intentSel = document.getElementById('flt-intent');

  function draw() {
    let items = data;
    const cls    = classSel?.value || '';
    const intent = intentSel?.value || '';
    if (cls)    items = items.filter(x => (x.propertyClass||'') === cls);
    if (intent) items = items.filter(x => (x.intent||'') === intent);

    if (!items.length) {
      grid.innerHTML = '<div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Sonuç yok.</div>';
      return;
    }

    grid.innerHTML = items.map(rec => {
      const cover = (Array.isArray(rec.photos) && rec.photos.length && rec.coverIndex >= 0)
        ? rec.photos[rec.coverIndex] : '';
      const loc = [rec?.location?.province, rec?.location?.district, rec?.location?.neighborhood]
        .filter(Boolean).join(' / ');
      return (
        '<article class="border rounded-lg bg-white overflow-hidden hover:shadow-sm transition">' +
          (cover
            ? '<div class="aspect-[16/9] bg-slate-100"><img class="w-full h-full object-cover" src="'+cover+'" alt=""></div>'
            : '<div class="aspect-[16/9] bg-slate-50 grid place-items-center text-slate-400 text-sm">Kapak yok</div>'
          ) +
          '<div class="p-3">' +
            '<h3 class="font-medium line-clamp-2">'+(rec.title||'')+'</h3>' +
            '<div class="text-xs text-slate-500 mt-1">'+(loc||'-')+'</div>' +
            '<div class="text-sm mt-2 flex items-center gap-1 flex-wrap">' +
              '<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">'+(rec.transactionType||'Satılık')+'</span>' +
              '<span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">'+(rec.propertyClass||'KONUT')+'</span>' +
              (rec.subcategory?'<span class="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">'+rec.subcategory+'</span>':'') +
            '</div>' +
            '<div class="mt-3">' +
              '<a class="px-2.5 py-1 text-sm rounded border" href="#/listing/'+rec.id+'">Detay</a>' +
            '</div>' +
          '</div>' +
        '</article>'
      );
    }).join('');
  }

  classSel?.addEventListener('change', draw);
  intentSel?.addEventListener('change', draw);
  draw();
}
