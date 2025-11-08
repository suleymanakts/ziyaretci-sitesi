// /src/components/Agents.js
// v4 — inline <script> YOK. mountAgents(root) eventleri bağlar.

export default function Agents() {
  const users = read('publicUsers.v1');
  const roles = new Set(['agent','assistant','broker','director','admin']); // admin geçici görünür
  const items = users
    .filter(u => roles.has(String(u.role||'').toLowerCase()))
    .filter(u => toBool(u.published))
    .map(normalize);

  const total = users.length;
  const totalPub = users.filter(u => toBool(u.published)).length;

  return `
    <section class="container-narrow mx-auto" data-agents-root>
      <h1 class="text-2xl font-semibold mb-4">Danışmanlar</h1>

      <div class="mb-4 grid gap-3">
        <div class="p-3 rounded border bg-slate-50 text-slate-800 text-sm">
          <div><b>publicUsers.v1</b> toplam: <b>${total}</b> • yayınlanan: <b>${totalPub}</b></div>
          <div class="text-[11px] text-gray-500 mt-1">Agents v4 • inline script yok, mountAgents ile çalışıyor.</div>
        </div>

        <!-- Hızlı kullanıcı ekle (test) -->
        <form id="agents_quickAdd" class="p-3 rounded border bg-white grid gap-2">
          <div class="font-medium">Hızlı kullanıcı ekle (test)</div>
          <div class="grid sm:grid-cols-2 gap-2">
            <input required name="fullName" placeholder="Ad Soyad" class="border rounded px-3 py-2">
            <input required name="email" type="email" placeholder="E-posta" class="border rounded px-3 py-2">
            <input required name="password" type="text" placeholder="Parola (örn. 1234)" class="border rounded px-3 py-2">
            <select name="role" class="border rounded px-3 py-2">
              <option value="agent">agent</option>
              <option value="assistant">assistant</option>
              <option value="broker">broker</option>
              <option value="director">director</option>
              <option value="admin">admin</option>
            </select>
          </div>
          <label class="inline-flex items-center gap-2 text-sm">
            <input type="checkbox" name="published" checked>
            Danışmanlar sayfasında yayınla
          </label>
          <div class="flex flex-wrap gap-2">
            <button type="submit" class="px-3 py-2 rounded bg-green-600 text-white text-sm">Ekle (test)</button>
            <button type="button" id="agents_removeDemos" class="px-3 py-2 rounded border text-sm">Demo seedleri kaldır</button>
            <button type="button" id="agents_importEtUsers" class="px-3 py-2 rounded border text-sm">et_users’tan içe aktar</button>
          </div>
          <div id="agents_quickMsg" class="text-sm"></div>
        </form>
      </div>

      ${items.length ? `
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="agentsGrid">
          ${items.map(card).join('')}
        </div>
      ` : `<p class="text-gray-600">Yayınlanmış uygun kayıt yok.</p>`}
    </section>
  `;
}

// ——— MOUNT: eventleri bağla
export function mountAgents(root) {
  const host = root?.querySelector('[data-agents-root]') || root;

  const KEY = 'publicUsers.v1';
  const readLS  = () => { try { return JSON.parse(localStorage.getItem(KEY)||'[]'); } catch { return []; } };
  const writeLS = (arr) => localStorage.setItem(KEY, JSON.stringify(arr));

  const form = host.querySelector('#agents_quickAdd');
  const msg  = host.querySelector('#agents_quickMsg');
  const btnRemove = host.querySelector('#agents_removeDemos');
  const btnImport = host.querySelector('#agents_importEtUsers');

  // Hızlı ekle
  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    const fd = new FormData(form);
    const fullName  = String(fd.get('fullName')||'').trim();
    const email     = String(fd.get('email')||'').trim().toLowerCase();
    const password  = String(fd.get('password')||'');
    const role      = String(fd.get('role')||'agent').toLowerCase();
    const published = !!fd.get('published');

    if(!fullName || !email || !password){
      setMsg('Lütfen tüm alanları doldurun.', true); return;
    }
    const arr = readLS();
    if (arr.some(u => String(u.email||'').toLowerCase() === email)) {
      setMsg('Bu e-posta zaten kayıtlı.', true); return;
    }
    const nu = {
      id: 'u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6),
      fullName, email, pass: password, role, published,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
    };
    arr.push(nu); writeLS(arr);
    setMsg('✅ Kaydedildi. Liste yenileniyor...', false);
    setTimeout(()=>{ location.hash='#/agents'; location.reload(); }, 150);
  });

  // Demo seedleri kaldır
  btnRemove?.addEventListener('click', ()=>{
    const demos = new Set(['admin@local','broker@local','agent@local','admin@demo.tld','broker@demo.tld','agent@demo.tld']);
    const arr = readLS().filter(u => !demos.has(String(u.email||'').toLowerCase()));
    writeLS(arr); location.reload();
  });

  // et_users'tan içe aktar
  btnImport?.addEventListener('click', ()=>{
    try{
      const src = JSON.parse(localStorage.getItem('et_users')||'[]');
      if(!Array.isArray(src) || !src.length){ alert('et_users boş.'); return; }
      const dst = readLS();
      const emails = new Set(dst.map(u=>String(u.email||'').toLowerCase()));
      const okRoles = new Set(['agent','assistant','broker','director','admin']);
      const incoming = src.map(u=>({
        id: u.id || u.userId || ('u'+Date.now().toString(36)+Math.random().toString(36).slice(2,6)),
        fullName: String(u.fullName||u.name||u.displayName||'').trim(),
        email: String(u.email||'').toLowerCase().trim(),
        pass: u.pass ?? u.password ?? '',
        role: String(u.role||u.userRole||'agent').toLowerCase(),
        phone: String(u.phone||u.mobile||'').trim(),
        photo: u.photo || u.avatar || '',
        published: true,
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }))
      .filter(u => u.email && !emails.has(u.email))
      .map(u => okRoles.has(u.role) ? u : ({...u, role:'agent'}));

      if(!incoming.length){ alert('Aktarılacak yeni kayıt yok.'); return; }
      localStorage.setItem(KEY, JSON.stringify([...dst, ...incoming]));
      location.reload();
    }catch(e){ console.error(e); alert('İçe aktarma hatası.'); }
  });

  function setMsg(text, isErr){
    if (!msg) return;
    msg.textContent = text;
    msg.style.color = isErr ? '#b91c1c' : '#065f46';
  }
}

// ——— yardımcılar (render)
function read(key){ try { return JSON.parse(localStorage.getItem(key)||'[]'); } catch { return []; } }
function toBool(v){ if(v===true) return true; const s=String(v).toLowerCase().trim(); return (s==='true'||s==='1'||s==='on'||s==='yes'); }
function normalize(u){
  return {
    id: u.id || '',
    fullName: String(u.fullName||'').trim() || '(İsimsiz)',
    email: String(u.email||'').trim(),
    role: String(u.role||'').toLowerCase(),
    phone: String(u.phone||'').trim(),
    photo: u.photo || '',
  };
}
function esc(s=''){ return String(s).replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m])); }
function ph(w=56,h=56){ return `data:image/svg+xml;utf8,`+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}"><rect width="${w}" height="${h}" fill="#e5e7eb"/></svg>`); }
function card(u){
  return `
    <div class="border rounded-xl bg-white p-4">
      <div class="flex items-center gap-3 mb-3">
        <img src="${esc(u.photo)||ph()}" class="w-14 h-14 rounded-full object-cover border" alt="">
        <div>
          <div class="font-semibold">${esc(u.fullName)}</div>
          <div class="text-xs text-gray-600">${esc(u.role)}</div>
        </div>
      </div>
      <div class="text-sm text-gray-700 space-y-1">
        ${u.phone ? `<div>Tel: <a class="underline" href="tel:${esc(u.phone)}">${esc(u.phone)}</a></div>` : ''}
        ${u.email ? `<div>E-posta: <a class="underline" href="mailto:${esc(u.email)}">${esc(u.email)}</a></div>` : ''}
      </div>
    </div>
  `;
}
