// /src/components/Register.js
import { register } from '@/auth.js'; // varsa, yoksa localStorage ile örnek bırak

export default function Register({ redirect = '#/' } = {}) {
  return `
    <section class="max-w-md mx-auto mt-10 p-6 border rounded-xl bg-white">
      <h1 class="text-2xl font-semibold mb-4">Kayıt Ol</h1>

      <form id="registerForm" class="space-y-4" data-redirect="${redirect}">
        <div>
          <label class="block text-sm mb-1">Ad Soyad</label>
          <input id="name" name="name" type="text" required class="w-full border rounded px-3 py-2" placeholder="Ad Soyad">
        </div>
        <div>
          <label class="block text-sm mb-1">E-posta</label>
          <input id="email" name="email" type="email" required class="w-full border rounded px-3 py-2" placeholder="ornek@mail.com">
        </div>
        <div>
          <label class="block text-sm mb-1">Şifre</label>
          <input id="password" name="password" type="password" required minlength="4" class="w-full border rounded px-3 py-2" placeholder="••••">
        </div>

        <button class="w-full py-2 rounded bg-brand text-white hover:bg-brand-dark" type="submit">
          Kayıt Ol
        </button>

        <p class="text-sm mt-2">
          Zaten hesabın var mı? <a class="underline" href="#/login?redirect=%23/admin">Giriş yap</a>
        </p>

        <p id="registerError" class="text-sm text-red-600 mt-2 hidden"></p>
      </form>
    </section>
  `;
}

// Mount: form davranışları
window.__mountRegister = function () {
  const form = document.getElementById('registerForm');
  if (!form) return;

  const errEl = document.getElementById('registerError');
  const email = form.querySelector('#email');
  requestAnimationFrame(() => email?.focus({ preventScroll: true }));

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errEl?.classList.add('hidden'); if (errEl) errEl.textContent = '';

    const fd = new FormData(form);
    const name = String(fd.get('name') || '').trim();
    const em = String(fd.get('email') || '').trim().toLowerCase();
    const pw = String(fd.get('password') || '');

    const btn = form.querySelector('button[type="submit"]'); btn && (btn.disabled = true);
    try {
      // örnek: register fonksiyonu yoksa localStorage fallback
      if (typeof register === 'function') {
        await register(name, em, pw);
      } else {
        localStorage.setItem('user:' + em, JSON.stringify({ name, email: em, pw }));
      }

      window.dispatchEvent(new Event('auth:changed'));
      const redirect = form.dataset.redirect || '#/';
      location.hash = redirect;
    } catch (err) {
      if (errEl) { errEl.textContent = err?.message || 'Kayıt başarısız.'; errEl.classList.remove('hidden'); }
    } finally {
      btn && (btn.disabled = false);
    }
  });
};
