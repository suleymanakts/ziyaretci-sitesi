// /src/components/Login.js
// Hibrit sürüm: Hem string render + sonradan mount, hem de root parametreli mount desteklenir.
import { login, currentUser } from '../auth.js';

// 1) HTML şablonunu tek yerde tutuyoruz
function template(redirect) {
  return `
    <section class="max-w-md mx-auto mt-10 p-6 border rounded-xl bg-white shadow">
      <h1 class="text-2xl font-semibold mb-4">Giriş Yap</h1>

      <form id="loginForm" class="space-y-4" data-redirect="${redirect}">
        <div>
          <label class="block text-sm mb-1">E-posta</label>
          <input id="email" name="email" type="email" required class="w-full border rounded px-3 py-2" placeholder="ornek@mail.com" autofocus>
        </div>
        <div>
          <label class="block text-sm mb-1">Şifre</label>
          <input id="password" name="password" type="password" required minlength="4" class="w-full border rounded px-3 py-2" placeholder="••••">
        </div>

        <button class="w-full py-2 rounded bg-black text-white" type="submit">Giriş</button>

        <p class="text-sm mt-2">
          Hesabın yok mu? <a class="underline" href="#/register?redirect=%23/admin">Kayıt ol</a>
        </p>

        <p id="loginError" class="text-sm text-red-600 mt-2 hidden"></p>
      </form>
    </section>
  `;
}

// 2) Default export (string döndürür) — bazı router’lar önce HTML’i basar
export default function Login({ redirect = '#/admin' } = {}) {
  try {
    if (currentUser()) {
      queueMicrotask(() => { location.hash = redirect || '#/admin'; });
      return ''; // girişliyse sayfa çizmeden yönlendir
    }
  } catch (_) {}
  return template(redirect);
}

// 3) Asıl davranışı bağlayan yardımcı (tek yerde)
function attachBehavior(root) {
  const form = root.querySelector('#loginForm');
  if (!form) return;

  const errEl = root.querySelector('#loginError');
  const emailInput = root.querySelector('#email');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (errEl) { errEl.classList.add('hidden'); errEl.textContent = ''; }

    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim().toLowerCase();
    const password = String(fd.get('password') || '');

    const btn = form.querySelector('button[type="submit"]');
    if (btn) btn.disabled = true;

    try {
      await login(email, password);
      const r = form.getAttribute('data-redirect') || '#/admin';
      location.hash = r;
    } catch (err) {
      if (errEl) {
        errEl.textContent = err?.message || 'Giriş başarısız. Bilgileri kontrol edin.';
        errEl.classList.remove('hidden');
      }
    } finally {
      if (btn) btn.disabled = false;
    }
  });

  requestAnimationFrame(() => emailInput?.focus({ preventScroll: true }));
}

// 4) Global mount — router __mountLogin(root, params) şeklini de destekler
window.__mountLogin = function mountLogin(root, params = {}) {
  try {
    const redirect = params.redirect || '#/admin';

    // girişliyse direkt yönlendir
    if (currentUser()) {
      queueMicrotask(() => { location.hash = redirect; });
      return;
    }

    // root verilmemişse #view’ü bul
    let container = root;
    if (!container || !(container instanceof Element)) {
      container = document.getElementById('view');
    }

    // Eğer container boşsa HTML’i içeri yaz, değilse sadece davranışı bağla
    if (!container) return; // son çare, sessiz çık
    if (!container.querySelector('#loginForm')) {
      container.innerHTML = template(redirect);
    }

    attachBehavior(container);
  } catch (e) {
    // Güvenli düşüş: sayfanın çökmesini engelle
    console.error('mountLogin error:', e);
  }
};

// 5) Eğer router HTML string basıp sonra mount etmiyorsa (bazı akışlarda),
//    bu çağrı gereksiz kalır; ama zarar vermez.
requestAnimationFrame(() => {
  const view = document.getElementById('view');
  if (view && view.querySelector('#loginForm')) {
    attachBehavior(view);
  }
});
