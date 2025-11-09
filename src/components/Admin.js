// /src/components/Admin.js
import { getListings, upsertListing, deleteListing, newId } from '@/api/data.js';
import { formatPrice } from '@/utils/format.js';
import { currentUser } from '@/auth.js';

let photoBuffer = []; // base64/url list
let editingId = null;

export default function Admin() {
  const me = currentUser();
  return `
    <section class="container-narrow mx-auto" data-admin-root>
      <h1 class="text-2xl font-semibold mb-4">Admin Paneli</h1>
      <div class="text-sm text-gray-600 mb-4">Giriş: ${me?.email||'-'}</div>

      <div class="grid md:grid-cols-3 gap-6">
        <div class="md:col-span-1">
          ${renderForm()}
        </div>
        <div class="md:col-span-2">
          <h2 class="font-medium mb-2">İlanlar</h2>
          <div id="adminList" class="grid grid-cols-1 sm:grid-cols-2 gap-3">${renderList()}</div>
        </div>
      </div>
    </section>
  `;
}

function renderForm() {
  return `
    <form id="adForm" class="grid gap-2 border p-3 rounded bg-white">
      <input type="hidden" name="id" />
      <input name="title" placeholder="Başlık" class="border rounded px-3 py-2" required />
      <textarea name="desc" placeholder="Açıklama" class="border rounded px-3 py-2"></textarea>

      <div class="grid grid-cols-2 gap-2">
        <input name="price" type="number" placeholder="Fiyat" class="border rounded px-3 py-2" />
        <input name="type" placeholder="Tür (konut/arsa/...)" class="border rounded px-3 py-2" />
      </div>

      <div class="grid grid-cols-3 gap-2">
        <input name="province" placeholder="İl" class="border rounded px-3 py-2" />
        <input name="district" placeholder="İlçe" class="border rounded px-3 py-2" />
        <input name="neighborhood" placeholder="Mahalle" class="border rounded px-3 py-2" />
      </div>

      <div class="grid gap-1">
        <label class="text-sm text-gray-600">Fotoğraflar</label>
        <input type="file" id="adPhotos" accept="image/*" multiple class="border rounded px-3 py-2" />
        <div id="adPhotoRow" class="flex flex-wrap gap-2"></div>
      </div>

      <input name="videoUrl" placeholder="Video URL (YouTube/Vimeo/.mp4)" class="border rounded px-3 py-2" />

      <div class="flex gap-2">
        <button class="px-3 py-2 rounded bg-brand text-white" type="submit">Kaydet</button>
        <button class="px-3 py-2 rounded border" type="button" id="adReset">Temizle</button>
      </div>
      <div id="adMsg" class="text-sm"></div>
    </form>
  `;
}

function renderList() {
  const arr = getListings() || [];
  if (!arr.length) return `<div class="text-gray-600">Henüz ilan yok.</div>`;
  return arr.map(x => `
    <div class="border rounded p-3 bg-white">
      <div class="font-medium truncate">${esc(x.title||'(Başlık yok)')}</div>
      <div class="text-sm text-gray-600">${x.price?formatPrice(x.price):''}</div>
      <div class="flex gap-2 mt-2">
        <button data-edit="${x.id}" class="px-2 py-1 border rounded text-sm">Düzenle</button>
        <button data-del="${x.id}" class="px-2 py-1 border rounded text-sm">Sil</button>
      </div>
    </div>
  `).join('');
}

function mountHandlers(root) {
  const host = root?.querySelector('[data-admin-root]') || root;
  const form = host.querySelector('#adForm');
  const msg  = host.querySelector('#adMsg');
  const file = host.querySelector('#adPhotos');
  const row  = host.querySelector('#adPhotoRow');

  // dosya ekleme
  file?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files||[]);
    for (const f of files) {
      const url = await readAsDataURL(f);
      photoBuffer.push(url);
    }
    renderThumbs(row);
  });

  // kaydet
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const obj = {
      id: fd.get('id') || newId('l'),
      title: String(fd.get('title')||'').trim(),
      desc: String(fd.get('desc')||'').trim(),
      price: Number(fd.get('price')||''),
      type: String(fd.get('type')||'').trim(),
      location: {
        province: String(fd.get('province')||'').trim(),
        district: String(fd.get('district')||'').trim(),
        neighborhood: String(fd.get('neighborhood')||'').trim(),
      },
      photos: [...photoBuffer],
      coverIndex: 0,
      videoUrl: String(fd.get('videoUrl')||'').trim(),
      published: true
    };
    upsertListing(obj);
    msg.textContent = '✅ Kaydedildi';
    setTimeout(()=>{ msg.textContent=''; }, 1200);
    photoBuffer = [];
    form.reset();
    const list = host.querySelector('#adminList');
    list.innerHTML = renderList();
    window.dispatchEvent(new Event('listings:changed'));
  });

  // reset
  host.querySelector('#adReset')?.addEventListener('click', () => {
    photoBuffer = [];
    form.reset();
    renderThumbs(row);
    editingId = null;
  });

  // düzenle / sil
  host.addEventListener('click', (e) => {
    const editId = e.target.getAttribute?.('data-edit');
    const delId  = e.target.getAttribute?.('data-del');
    if (editId) {
      const x = (getListings()||[]).find(l => l.id===editId);
      if (!x) return;
      editingId = x.id;
      form.elements.id.value = x.id;
      form.elements.title.value = x.title||'';
      form.elements.desc.value = x.desc||'';
      form.elements.price.value = x.price||'';
      form.elements.type.value = x.type||'';
      form.elements.province.value = x?.location?.province||'';
      form.elements.district.value = x?.location?.district||'';
      form.elements.neighborhood.value = x?.location?.neighborhood||'';
      form.elements.videoUrl.value = x.videoUrl||'';
      photoBuffer = [...(x.photos||[])];
      renderThumbs(row);
    }
    if (delId) {
      if (confirm('Silinsin mi?')) {
        deleteListing(delId);
        const list = host.querySelector('#adminList');
        list.innerHTML = renderList();
        window.dispatchEvent(new Event('listings:changed'));
      }
    }
  });
}

function renderThumbs(row) {
  if (!row) return;
  row.innerHTML = photoBuffer.map((u,i)=>`
    <div class="relative">
      <img src="${esc(u)}" class="w-24 h-20 object-cover rounded border"/>
      <button data-rm="${i}" class="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-white border">✕</button>
    </div>
  `).join('');

  row.addEventListener('click', (e) => {
    const rm = e.target.getAttribute?.('data-rm');
    if (rm!=null) {
      photoBuffer.splice(Number(rm),1);
      renderThumbs(row);
    }
  }, { once: true });
}

export function mountAdmin(root) { mountHandlers(root); }

// helpers
function readAsDataURL(file) {
  return new Promise(res => { const r=new FileReader(); r.onload=()=>res(r.result); r.readAsDataURL(file); });
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
