// /src/components/Home.js
import { getListings } from '../api/data.js';

export default function Home(){
  const html = `
  <section id="home-wrap" class="max-w-7xl mx-auto p-4 space-y-8">
    <!-- Arama Çubuğu -->
    <div class="bg-white border rounded-xl p-4">
      <h1 class="text-xl font-semibold mb-3">Emlak arayın</h1>
      <div class="grid md:grid-cols-[1fr_1fr_140px] gap-2">
        <input id="q-loc" class="px-3 py-2 rounded border" placeholder="İl / İlçe / Mahalle">
        <select id="q-class" class="px-3 py-2 rounded border">
          <option value="">Sınıf (hepsi)</option>
          <option value="Konut">Konut</option>
          <option value="Ticari">Ticari</option>
          <option value="Arsa">Arsa</option>
        </select>
        <a id="q-btn" class="px-3 py-2 rounded bg-blue-600 text-white text-center" href="#/listings">Ara</a>
      </div>
    </div>

    <!-- Son İlanlar -->
    <div>
      <div class="mb-3 flex items-center justify-between">
        <h2 class="text-xl font-semibold">Son İlanlar</h2>
        <a class="text-sm text-blue-600 hover:underline" href="#/listings">Tümünü gör</a>
      </div>
      <div id="home-grid" class="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        <div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Yükleniyor…</div>
      </div>
    </div>
  </section>`;
  queueMicrotask(mountHome);
  return html;
}

async function mountHome(){
  const grid = document.getElementById('home-grid');
  if (!grid) return;

  let list = await Promise.resolve(getListings());
  list = Array.isArray(list) ? list : (Array.isArray(list?.items) ? list.items : (list && typeof list==='object' ? Object.values(list) : []));
  const items = list.filter(x=>!!x.published).slice(-6).reverse();

  if (!items.length){
    grid.innerHTML = '<div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Henüz yayınlanmış ilan yok.</div>';
    return;
  }

  grid.innerHTML = items.map(rec=>{
    const cover=(Array.isArray(rec.photos)&&rec.photos.length&&rec.coverIndex>=0)?rec.photos[rec.coverIndex]:'';
    const loc=[rec?.location?.province,rec?.location?.district,rec?.location?.neighborhood].filter(Boolean).join(' / ');
    return (
      '<article class="border rounded-lg bg-white overflow-hidden hover:shadow-sm transition">'+
        (cover
          ? '<div class="aspect-[16/9] bg-slate-100"><img class="w-full h-full object-cover" src="'+cover+'" alt=""></div>'
          : '<div class="aspect-[16/9] bg-slate-50 grid place-items-center text-slate-400 text-sm">Kapak yok</div>'
        )+
        '<div class="p-3">'+
          '<h3 class="font-medium line-clamp-2">'+(rec.title||'')+'</h3>'+
          '<div class="text-xs text-slate-500 mt-1">'+(loc||'-')+'</div>'+
          '<div class="mt-3">'+
            '<a class="px-2.5 py-1 text-sm rounded border" href="#/listing/'+rec.id+'">Detay</a>'+
          '</div>'+
        '</div>'+
      '</article>'
    );
  }).join('');
}
