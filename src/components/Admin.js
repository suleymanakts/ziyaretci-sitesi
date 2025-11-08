// /src/components/Admin.js
import {
  getListings, upsertListing, publishListing,
  getUsers, saveUsers, publishUser,
} from '@/api/data.js';

const $ = (sel, root = document) => root.querySelector(sel);

function toast(msg){
  const t=document.createElement('div');
  t.textContent=msg||'';
  t.className='fixed bottom-4 right-4 z-50 px-3 py-2 rounded bg-black/80 text-white text-sm shadow';
  document.body.appendChild(t);
  setTimeout(()=>t.remove(),1400);
}
function fileToDataURL(file){
  return new Promise((res,rej)=>{
    const fr=new FileReader();
    fr.onload=()=>res(String(fr.result||'')); fr.onerror=rej; fr.readAsDataURL(file);
  });
}
function isValidVideoUrl(u){
  const s=String(u||'').trim();
  if(!s) return false;
  if(/^https?:\/\/(www\.)?(youtube\.com|youtu\.be|vimeo\.com)\//i.test(s)) return true;
  if(/^https?:\/\/.+\.mp4(\?.*)?$/i.test(s)) return true;
  return false;
}
function toArray(any){
  if (Array.isArray(any)) return any;
  if (any && typeof any === 'object') {
    if (Array.isArray(any.items)) return any.items;
    try { return Object.values(any); } catch {}
  }
  return [];
}

let photoBuffer=[]; let coverIndex=-1; let videoUrlTmp='';
function resetMediaState(){ photoBuffer=[]; coverIndex=-1; videoUrlTmp=''; }

export default function Admin(){
  const html =
`<section id="admin-wrap" class="max-w-7xl mx-auto p-4">
  <div class="grid grid-cols-[220px_1fr] gap-4">
    <aside class="bg-white border rounded-xl p-3 sticky top-4 h-fit">
      <h1 class="text-lg font-semibold mb-2">Admin</h1>
      <nav id="admin-nav" class="flex flex-col gap-1">
        <button class="nav-btn w-full text-left px-3 py-2 rounded hover:bg-slate-100" data-tab="dashboard">Gösterge Paneli</button>
        <button class="nav-btn w-full text-left px-3 py-2 rounded hover:bg-slate-100" data-tab="ilanlar">İlanlar</button>
        <button class="nav-btn w-full text-left px-3 py-2 rounded hover:bg-slate-100" data-tab="kullanicilar">Kullanıcılar</button>
      </nav>
    </aside>

    <main id="admin-content" class="space-y-4">
      <section class="tab-panel bg-white border rounded-xl p-4" data-tab="dashboard">
        <h2 class="text-xl font-semibold mb-2">Gösterge Paneli</h2>
        <p class="text-slate-600 text-sm">Özet metrikler sonraki adımda eklenecek.</p>
      </section>

      <section class="tab-panel bg-white border rounded-xl p-4 hidden" data-tab="ilanlar">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold">İlanlar</h2>
          <button id="act-new-listing" class="px-3 py-1.5 rounded bg-blue-600 text-white" type="button">+ Yeni İlan</button>
        </div>

        <form id="newListingForm" class="grid gap-3 mb-4 border rounded p-3 bg-white hidden">
          <div class="grid md:grid-cols-2 gap-2">
            <div>
              <label class="text-xs text-slate-600">Başlık</label>
              <input name="title" class="px-3 py-2 rounded border w-full" placeholder="Başlık *" required>
            </div>
            <div>
              <label class="text-xs text-slate-600">Fiyat (TL)</label>
              <input name="price" type="number" class="px-3 py-2 rounded border w-full" placeholder="Fiyat">
            </div>
          </div>

          <div class="grid md:grid-cols-3 gap-2">
            <div><label class="text-xs text-slate-600">İl</label><input name="location.province" class="px-3 py-2 rounded border w-full" placeholder="İl"></div>
            <div><label class="text-xs text-slate-600">İlçe</label><input name="location.district" class="px-3 py-2 rounded border w-full" placeholder="İlçe"></div>
            <div><label class="text-xs text-slate-600">Mahalle</label><input name="location.neighborhood" class="px-3 py-2 rounded border w-full" placeholder="Mahalle"></div>
          </div>

          <div>
            <label class="text-xs text-slate-600">Açıklama</label>
            <textarea name="description" rows="2" class="px-3 py-2 rounded border w-full" placeholder="Kısa açıklama"></textarea>
          </div>

          <div class="grid md:grid-cols-3 gap-3">
            <div class="md:col-span-2">
              <label class="block text-xs text-slate-600 mb-1">Fotoğraflar</label>
              <div class="flex items-center gap-2 mb-2">
                <input id="filePhotos" type="file" accept="image/*" multiple class="block text-sm">
                <button type="button" id="btnClearPhotos" class="px-2 py-1 text-sm rounded border">Temizle</button>
              </div>
              <div id="photosGrid" class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2"></div>
              <p class="text-[11px] text-slate-500 mt-1">Sıralamak için oklar; kapak için yıldız.</p>
            </div>
            <div>
              <label class="block text-xs text-slate-600 mb-1">Video URL</label>
              <input id="inpVideoUrl" class="px-3 py-2 rounded border w-full" placeholder="YouTube/Vimeo/.mp4">
              <p class="text-[11px] text-slate-500 mt-1">Örnek: https://youtu.be/XXXX veya https://site.com/file.mp4</p>
            </div>
          </div>

          <div class="flex gap-2">
            <button class="px-3 py-1.5 rounded bg-blue-600 text-white" type="submit">Kaydet</button>
            <button class="px-3 py-1.5 rounded border" type="reset">Temizle</button>
          </div>
        </form>

        <div id="listingsBox" class="grid md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
      </section>

      <section class="tab-panel bg-white border rounded-xl p-4 hidden" data-tab="kullanicilar">
        <div class="flex items-center justify-between mb-3">
          <h2 class="text-xl font-semibold">Kullanıcılar</h2>
          <button id="act-new-user" class="px-3 py-1.5 rounded border" type="button">+ Hızlı Ekle</button>
        </div>

        <form id="newUserForm" class="grid gap-3 mb-4 border rounded p-3 bg-white hidden">
          <div class="grid md:grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-slate-600">Ad Soyad</label>
              <input name="fullName" class="px-3 py-2 rounded border w-full" placeholder="Ad Soyad">
            </div>
            <div>
              <label class="text-xs text-slate-600">E-posta</label>
              <input name="email" type="email" class="px-3 py-2 rounded border w-full" placeholder="email@site.com">
            </div>
            <div>
              <label class="text-xs text-slate-600">Telefon</label>
              <input name="phone" class="px-3 py-2 rounded border w-full" placeholder="05xx...">
            </div>
          </div>
          <div class="grid md:grid-cols-3 gap-2">
            <div>
              <label class="text-xs text-slate-600">Rol</label>
              <select name="role" class="px-3 py-2 rounded border w-full">
                <option value="agent">agent</option>
                <option value="assistant">assistant</option>
                <option value="broker">broker</option>
                <option value="director">director</option>
                <option value="admin">admin</option>
              </select>
            </div>
            <div>
              <label class="text-xs text-slate-600">Parola</label>
              <input name="pass" type="password" class="px-3 py-2 rounded border w-full" placeholder="******">
            </div>
            <label class="inline-flex items-center gap-2 text-sm self-end">
              <input type="checkbox" name="published"> Yayınla
            </label>
          </div>
          <div class="flex gap-2">
            <button class="px-3 py-1.5 rounded bg-blue-600 text-white" type="submit">Kaydet</button>
            <button class="px-3 py-1.5 rounded border" type="reset">Temizle</button>
          </div>
        </form>

        <div id="usersBox" class="grid md:grid-cols-2 lg:grid-cols-3 gap-3"></div>
      </section>
    </main>
  </div>
</section>`;

  const tryMount = () => {
    const wrap = document.getElementById('admin-wrap');
    if (!wrap) return false;
    if (wrap.dataset.bound === '1') return true;
    wrap.dataset.bound = '1';
    requestAnimationFrame(()=>bindAdmin(wrap));
    return true;
  };
  queueMicrotask(()=>{
    if (!tryMount()){
      const mo=new MutationObserver(()=>{ if(tryMount()) mo.disconnect(); });
      mo.observe(document.body,{childList:true,subtree:true});
    }
  });
  return html;
}

function bindAdmin(wrap){
  const panels=[...wrap.querySelectorAll('.tab-panel')];
  const navBtns=[...wrap.querySelectorAll('.nav-btn')];
  const activate = (tab)=>{
    navBtns.forEach(b=>b.dataset.active=(b.dataset.tab===tab?'true':'false'));
    panels.forEach(p=>p.classList.toggle('hidden', p.dataset.tab!==tab));
  };
  navBtns.forEach(b=>b.addEventListener('click',()=>activate(b.dataset.tab)));
  activate('ilanlar');

  const ilanPanel = wrap.querySelector('[data-tab="ilanlar"]');
  if (ilanPanel){
    ilanPanel.addEventListener('click', (e)=>{
      const btn = e.target.closest('#act-new-listing');
      if (!btn) return;
      const form = wrap.querySelector('#newListingForm');
      if (!form) return;
      form.classList.toggle('hidden');
      if (!form.classList.contains('hidden')){
        resetMediaState();
        renderPhotoList(wrap.querySelector('#photosGrid'));
        const v=wrap.querySelector('#inpVideoUrl'); if(v) v.value='';
        form.querySelector('[name="title"]')?.focus();
      }
    });

    const fileInput=wrap.querySelector('#filePhotos');
    if (fileInput){
      fileInput.addEventListener('change', async (e)=>{
        const files=[...e.target.files||[]];
        for (const f of files){
          const url=await fileToDataURL(f);
          photoBuffer.push(url);
          if (coverIndex===-1) coverIndex=0;
        }
        renderPhotoList(wrap.querySelector('#photosGrid'));
        fileInput.value='';
      });
    }
    const btnClear=wrap.querySelector('#btnClearPhotos');
    btnClear?.addEventListener('click', ()=>{
      resetMediaState();
      renderPhotoList(wrap.querySelector('#photosGrid'));
      const v=wrap.querySelector('#inpVideoUrl'); if(v) v.value='';
    });

    const inpVideo=wrap.querySelector('#inpVideoUrl');
    inpVideo?.addEventListener('input', (e)=>{ videoUrlTmp=(e.target.value||'').trim(); });

    wrap.querySelector('#newListingForm')?.addEventListener('submit', onSubmitNewListing);

    ilanPanel.addEventListener('click', async (e)=>{
      const pubBtn=e.target.closest('[data-act="toggle-publish"]');
      if (!pubBtn) return;
      const id   = pubBtn.getAttribute('data-id');
      const next = pubBtn.getAttribute('data-next') === '1';
      await publishListing(id,next);
      toast(next?'Yayınlandı':'Yayından alındı');
      renderListings(wrap.querySelector('#listingsBox'));
    });

    renderListings(wrap.querySelector('#listingsBox'));
  }

  const usrPanel = wrap.querySelector('[data-tab="kullanicilar"]');
  if (usrPanel){
    usrPanel.addEventListener('click', (e)=>{
      const btn=e.target.closest('#act-new-user');
      if (!btn) return;
      const form=wrap.querySelector('#newUserForm');
      form?.classList.toggle('hidden');
      form?.querySelector('[name="fullName"]')?.focus();
    });

    wrap.querySelector('#newUserForm')?.addEventListener('submit', async (e)=>{
      e.preventDefault();
      const fd=new FormData(e.currentTarget);
      const rec={
        id:'usr_'+Math.random().toString(36).slice(2,8),
        fullName:(fd.get('fullName')||'').toString().trim(),
        email:(fd.get('email')||'').toString().trim(),
        phone:(fd.get('phone')||'').toString().trim(),
        role:(fd.get('role')||'agent').toString(),
        pass:(fd.get('pass')||'').toString(),
        published:!!fd.get('published'),
        createdAt:new Date().toISOString()
      };
      let list=toArray(await getUsers());
      list.push(rec);
      await saveUsers(list);
      toast('Kullanıcı eklendi');
      e.currentTarget.reset();
      e.currentTarget.classList.add('hidden');
      renderUsers(wrap.querySelector('#usersBox'));
    });

    usrPanel.addEventListener('click', async (e)=>{
      const pbtn=e.target.closest('[data-act="user-publish"]');
      if (!pbtn) return;
      const email=pbtn.getAttribute('data-email')||'';
      const next =pbtn.getAttribute('data-next')==='1';
      await publishUser(email,next);
      toast(next?'Yayınlandı':'Yayından alındı');
      renderUsers(wrap.querySelector('#usersBox'));
    });

    renderUsers(wrap.querySelector('#usersBox'));
  }
}

async function onSubmitNewListing(e){
  e.preventDefault();
  const form=e.currentTarget;
  const fd=new FormData(form);

  const vUrl=(videoUrlTmp||'').trim();
  if (vUrl && !isValidVideoUrl(vUrl)){ alert('Video URL geçersiz.'); return; }

  const rec={
    title:(fd.get('title')||'').toString().trim(),
    description:(fd.get('description')||'').toString().trim(),
    price:Number(fd.get('price')||0)||0,
    location:{
      province:(fd.get('location.province')||'').toString().trim(),
      district:(fd.get('location.district')||'').toString().trim(),
      neighborhood:(fd.get('location.neighborhood')||'').toString().trim()
    },
    transactionType:'Satılık',
    propertyClass:'Konut',
    subcategory:'Daire',
    intent:'satilik',
    category:'konut',
    subType:'Daire',
    photos:photoBuffer.slice(),
    coverIndex:(photoBuffer.length?Math.max(0,Math.min(coverIndex,photoBuffer.length-1)):-1),
    videoUrl:vUrl,
    published:false,
    status:'draft',
    createdAt:new Date().toISOString()
  };
  if (!rec.title){ alert('Başlık zorunlu.'); return; }

  await upsertListing(rec);
  toast('İlan oluşturuldu.');
  form.reset();
  resetMediaState();
  const panel=form.closest('[data-tab="ilanlar"]');
  renderPhotoList(panel.querySelector('#photosGrid'));
  renderListings(panel.querySelector('#listingsBox'));
}

async function renderListings(box){
  if (!box) return;
  let items = toArray(await getListings()).slice().reverse();

  if (!items.length){
    box.innerHTML='<div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Henüz ilan yok. Sağ üstte "+ Yeni İlan" ile başlayın.</div>';
    return;
  }
  box.innerHTML = items.map(rec=>{
    const cover=(Array.isArray(rec.photos)&&rec.photos.length&&rec.coverIndex>=0)?rec.photos[rec.coverIndex]:''; 
    const loc=[rec?.location?.province,rec?.location?.district,rec?.location?.neighborhood].filter(Boolean).join(' / ');
    const isPub=!!rec.published;
    return (
      '<article class="border rounded-lg bg-white overflow-hidden hover:shadow-sm transition">'+
        (cover
          ? '<div class="aspect-[16/9] bg-slate-100"><img class="w-full h-full object-cover" src="'+cover+'" alt=""></div>'
          : '<div class="aspect-[16/9] bg-slate-50 grid place-items-center text-slate-400 text-sm">Kapak yok</div>'
        )+
        '<div class="p-3">'+
          '<h3 class="font-medium line-clamp-2">'+(rec.title||'')+'</h3>'+
          '<div class="text-xs text-slate-500 mt-1">'+(loc||'-')+'</div>'+
          '<div class="text-sm mt-2 flex items-center gap-1 flex-wrap">'+
            '<span class="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">'+(rec.transactionType||'Satılık')+'</span>'+
            '<span class="px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">'+(rec.propertyClass||'KONUT')+'</span>'+
            (rec.subcategory?'<span class="px-1.5 py-0.5 rounded bg-violet-50 text-violet-700 border border-violet-200">'+rec.subcategory+'</span>':'')+
            (isPub
              ? '<span class="px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200">YAYINDA</span>'
              : '<span class="px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border-orange-200">TASLAK</span>'
            )+
          '</div>'+
          '<div class="mt-3 flex items-center gap-2">'+
            (isPub
              ? '<button class="px-2.5 py-1 text-sm rounded border" data-act="toggle-publish" data-id="'+rec.id+'" data-next="0">Yayından Al</button>'
              : '<button class="px-2.5 py-1 text-sm rounded border" data-act="toggle-publish" data-id="'+rec.id+'" data-next="1">Yayınla</button>'
            )+
            '<a class="px-2.5 py-1 text-sm rounded border" href="#/listing/'+rec.id+'" target="_blank" rel="noopener">Detay</a>'+
          '</div>'+
        '</div>'+
      '</article>'
    );
  }).join('');
}

async function renderUsers(box){
  if (!box) return;
  let users = toArray(await getUsers()).slice().reverse();
  if (!users.length){
    box.innerHTML='<div class="col-span-full p-6 text-center border rounded bg-white text-slate-600">Henüz kullanıcı yok. Yukarıdan "Hızlı Ekle" ile başlayın.</div>';
    return;
  }
  box.innerHTML = users.map(u=>{
    const name=u.fullName||u.email||'Kullanıcı';
    const tel=(u.phone||'').replace(/\s+/g,'');
    const isPub=!!u.published;
    return (
      '<article class="border rounded-xl bg-white p-3 flex items-center gap-3">'+
        '<div class="w-12 h-12 rounded-full bg-slate-100 grid place-items-center text-slate-400">'+
          '<svg width="22" height="22" viewBox="0 0 24 24" fill="none">'+
            '<circle cx="12" cy="8" r="4" stroke="currentColor" />'+
            '<path d="M4 20c0-4 4-6 8-6s8 2 8 6" stroke="currentColor"/>'+
          '</svg>'+
        '</div>'+
        '<div class="min-w-0 flex-1">'+
          '<div class="flex items-center gap-2">'+
            '<h3 class="font-medium truncate">'+name+'</h3>'+
            '<span class="px-1.5 py-0.5 text-xs rounded border bg-slate-50 text-slate-700 border-slate-200">'+(u.role||'agent')+'</span>'+
            (isPub
              ? '<span class="px-1.5 py-0.5 text-xs rounded border bg-teal-50 text-teal-700 border-teal-200">YAYINDA</span>'
              : '<span class="px-1.5 py-0.5 text-xs rounded border bg-orange-50 text-orange-700 border-orange-200">PASİF</span>'
            )+
          '</div>'+
          '<div class="mt-1 text-sm text-slate-600 break-words">'+
            (tel?'<a class="hover:underline" href="tel:'+tel+'">'+tel+'</a>':'')+
            (tel && u.email ? ' · ' : '')+
            (u.email?'<a class="hover:underline" href="mailto:'+u.email+'">'+u.email+'</a>':'')+
          '</div>'+
          '<div class="mt-2">'+
            (isPub
              ? '<button class="px-2.5 py-1 text-sm rounded border" data-act="user-publish" data-email="'+(u.email||'')+'" data-next="0">Yayından Al</button>'
              : '<button class="px-2.5 py-1 text-sm rounded border" data-act="user-publish" data-email="'+(u.email||'')+'" data-next="1">Yayınla</button>'
            )+
          '</div>'+
        '</div>'+
      '</article>'
    );
  }).join('');
}

function renderPhotoList(gridEl){
  if (!gridEl) return;
  if (!photoBuffer.length){
    gridEl.innerHTML='<div class="col-span-full text-sm text-slate-500 border rounded p-3">Foto yok. Yukarıdan seçin.</div>';
    return;
  }
  gridEl.innerHTML = photoBuffer.map((src,i)=>(
    '<div class="border rounded overflow-hidden bg-white">'+
      '<div class="aspect-[4/3] bg-slate-100"><img src="'+src+'" class="w-full h-full object-cover" alt=""></div>'+
      '<div class="flex items-center justify-between px-2 py-1 text-sm">'+
        '<div class="flex items-center gap-1">'+
          '<button type="button" class="btn-up px-2 py-0.5 rounded border" data-i="'+i+'">↑</button>'+
// … diğer butonlar aynı (down/del/cover)
          '<button type="button" class="btn-down px-2 py-0.5 rounded border" data-i="'+i+'">↓</button>'+
          '<button type="button" class="btn-del px-2 py-0.5 rounded border" data-i="'+i+'">×</button>'+
        '</div>'+
        '<button type="button" class="btn-cover px-2 py-0.5 rounded border '+(i===coverIndex?'bg-yellow-400':'')+'" data-i="'+i+'">★</button>'+
      '</div>'+
    '</div>'
  )).join('');

  gridEl.querySelectorAll('.btn-up').forEach(b=>b.addEventListener('click',()=>{
    const i=Number(b.dataset.i); if(i<=0) return;
    const t=photoBuffer[i-1]; photoBuffer[i-1]=photoBuffer[i]; photoBuffer[i]=t;
    if (coverIndex===i) coverIndex=i-1; else if (coverIndex===i-1) coverIndex=i;
    renderPhotoList(gridEl);
  }));
  gridEl.querySelectorAll('.btn-down').forEach(b=>b.addEventListener('click',()=>{
    const i=Number(b.dataset.i); if(i>=photoBuffer.length-1) return;
    const t=photoBuffer[i+1]; photoBuffer[i+1]=photoBuffer[i]; photoBuffer[i]=t;
    if (coverIndex===i) coverIndex=i+1; else if (coverIndex===i+1) coverIndex=i;
    renderPhotoList(gridEl);
  }));
  gridEl.querySelectorAll('.btn-del').forEach(b=>b.addEventListener('click',()=>{
    const i=Number(b.dataset.i);
    photoBuffer.splice(i,1);
    if (coverIndex===i) coverIndex = photoBuffer.length ? 0 : -1;
    else if (coverIndex>i) coverIndex--;
    renderPhotoList(gridEl);
  }));
  gridEl.querySelectorAll('.btn-cover').forEach(b=>b.addEventListener('click',()=>{
    coverIndex = Number(b.dataset.i);
    renderPhotoList(gridEl);
  }));
}
