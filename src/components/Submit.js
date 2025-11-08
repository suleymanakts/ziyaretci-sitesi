import { upsertListing, newId, nowISO } from '../storage.js';

let photoBuffer = [];

export default function Submit() {
  setTimeout(() => { window.__mountSubmit = mount; }, 0);
  return `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-4">
        <h1 class="text-xl font-semibold mb-3">İlan Ver (Halka Açık)</h1>
        <p class="text-sm text-slate-600 mb-4">Gönderdiğiniz ilan <b>onaya</b> düşer. Uygun görülürse yayımlanır.</p>
        <form id="pubForm" class="space-y-3">
          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-sm font-medium">Teklif</label>
              <select id="offer" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300">
                <option value="satilik">Satılık</option>
                <option value="kiralik">Kiralık</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium">Tür</label>
              <select id="mainType" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300">
                <option value="konut">konut</option>
                <option value="ticari">ticari</option>
                <option value="arsa">arsa</option>
                <option value="villa">villa</option>
              </select>
            </div>
            <div>
              <label class="text-sm font-medium">Alt Tür</label>
              <input id="subType" placeholder="daire / sanayi / imarlı ..." class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
          </div>

          <div>
            <label class="text-sm font-medium">Başlık *</label>
            <input id="title" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" required>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-sm font-medium">Fiyat (₺) *</label>
              <input id="price" type="number" min="1" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" required>
            </div>
            <div>
              <label class="text-sm font-medium">m² *</label>
              <input id="area" type="number" min="1" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" required>
            </div>
            <div>
              <label class="text-sm font-medium">Oda (konut)</label>
              <input id="rooms" placeholder="3+1" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
          </div>

          <div class="grid grid-cols-3 gap-3">
            <div>
              <label class="text-sm font-medium">Şehir *</label>
              <input id="province" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300" required>
            </div>
            <div>
              <label class="text-sm font-medium">İlçe</label>
              <input id="district" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
            <div>
              <label class="text-sm font-medium">Mahalle/Köy</label>
              <input id="neighborhood" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300">
            </div>
          </div>

          <div>
            <label class="text-sm font-medium">Açıklama</label>
            <textarea id="description" rows="5" class="mt-1 w-full px-3 py-2 rounded-lg border border-slate-300"></textarea>
          </div>

          <div>
            <label class="text-sm font-medium">Fotoğraflar</label>
            <input id="images" type="file" accept="image/*" multiple class="mt-1 block w-full text-sm">
            <div id="preview" class="mt-2 flex flex-wrap gap-2"></div>
          </div>

          <button class="px-4 py-2 rounded-lg bg-brand text-white">Gönder (Onaya)</button>
        </form>
      </div>

      <div class="bg-white border border-slate-200 rounded-2xl p-4">
        <h2 class="text-lg font-semibold mb-2">Kurallar</h2>
        <ul class="text-sm list-disc pl-5 space-y-1 text-slate-700">
          <li>Uygunsuz/eksik içerikler reddedilir.</li>
          <li>Görseller otomatik sıkıştırılır (WebP, max 1600px).</li>
          <li>İlanınız incelendikten sonra yayına alınır.</li>
        </ul>
      </div>
    </div>
  `;
}

function mount() {
  const f = document.getElementById('pubForm');
  const inputImages = document.getElementById('images');
  const preview = document.getElementById('preview');

  inputImages.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files || []);
    for (const file of files) {
      const b64 = await toWebpCompressed(file, 1600, 0.82);
      photoBuffer.push(b64);
    }
    renderPreview();
    inputImages.value = '';
  });

  function renderPreview() {
    preview.innerHTML = photoBuffer.map((src,i)=>`
      <div class="relative group">
        <img src="${src}" class="w-28 h-24 object-cover rounded-lg border border-slate-200">
        <div class="absolute inset-x-0 -bottom-2 flex gap-1 justify-center opacity-0 group-hover:opacity-100 transition">
          <button type="button" class="cover px-2 py-1 rounded bg-slate-900 text-white text-[10px]" data-i="${i}">${i===0?'Kapak ✓':'Kapak yap'}</button>
          <button type="button" class="remove px-2 py-1 rounded bg-white border border-slate-300 text-[10px]" data-i="${i}">Sil</button>
        </div>
      </div>
    `).join('');

    preview.querySelectorAll('button.remove').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        photoBuffer.splice(i,1);
        renderPreview();
      });
    });
    preview.querySelectorAll('button.cover').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = Number(btn.dataset.i);
        if (i>0) { const [img] = photoBuffer.splice(i,1); photoBuffer.unshift(img); renderPreview(); }
      });
    });
  }

  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const payload = {
      id: newId(),
      status: 'pending',                   // ONAYA DÜŞER
      offerType: f.offer.value,
      mainType: f.mainType.value,
      subType: f.subType.value.trim(),
      title: f.title.value.trim(),
      price: Number(f.price.value || 0),
      area_m2: Number(f.area.value || 0),
      rooms: f.rooms.value.trim(),
      description: f.description.value.trim(),
      images: photoBuffer.slice(0),
      location: {
        province: f.province.value.trim(),
        district: f.district.value.trim(),
        neighborhood: f.neighborhood.value.trim(),
      },
      creator: { role:'external', name:'Ziyaretçi' },
      createdAt: nowISO(),
    };

    if (!payload.title || !payload.price || !payload.area_m2 || !payload.location.province) {
      return alert('Başlık, fiyat, m² ve şehir zorunludur.');
    }

    upsertListing(payload);
    alert('İlanınız onaya gönderildi.');
    location.hash = '#/listings';
  });
}

// Görselleri WebP/JPEG olarak sıkıştır
async function toWebpCompressed(file, maxW = 1600, quality = 0.82) {
  const img = await readAsImage(file);
  const scale = Math.min(1, maxW / img.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(img.width * scale));
  canvas.height = Math.max(1, Math.round(img.height * scale));
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
  // WebP destekliyse webp, değilse jpeg
  const m = 'image/webp';
  const data = canvas.toDataURL(m, quality);
  if (data && data.startsWith('data:image/webp')) return data;
  return canvas.toDataURL('image/jpeg', quality);
}

function readAsImage(file) {
  return new Promise((res, rej) => {
    const fr = new FileReader();
    fr.onload = () => { const img = new Image(); img.onload = () => res(img); img.onerror = rej; img.src = fr.result; };
    fr.onerror = rej;
    fr.readAsDataURL(file);
  });
}
