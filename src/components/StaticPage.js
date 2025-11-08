// /src/components/StaticPage.js
// Basit statik sayfa bileşeni: 'about' ve 'contact' şablonları.
// Router: StaticPage('about') / StaticPage('contact')

export default function StaticPage(slug = 'about') {
  // Global fallback (router'ın eski global mount akışıyla uyum için)
  setTimeout(() => { window.__mountStatic = () => {}; }, 0);

  if (slug === 'contact') {
    return `
      <section class="bg-white border border-slate-200 rounded-2xl p-4 md:p-6">
        <h1 class="text-xl font-semibold mb-4">İletişim</h1>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Basit iletişim formu (mailto) -->
          <form id="contactForm" class="space-y-3">
            <input name="name" placeholder="Ad Soyad" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            <input name="email" placeholder="E-posta" type="email" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            <input name="phone" placeholder="Telefon" class="w-full px-3 py-2 rounded-lg border border-slate-300" />
            <textarea name="message" rows="5" placeholder="Mesajınız" class="w-full px-3 py-2 rounded-lg border border-slate-300"></textarea>

            <div class="flex gap-2">
              <button type="submit" class="inline-flex px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand/90">Gönder</button>
              <a href="mailto:info@emlakturk.com" class="inline-flex px-4 py-2 rounded-lg border border-slate-300 hover:bg-slate-50">E-posta ile</a>
            </div>
          </form>

          <!-- Ofis bilgileri -->
          <div class="text-sm text-slate-700">
            <div class="font-semibold mb-2">Merkez Ofis</div>
            <div>Levent, İstanbul</div>

            <div class="mt-4">
              <div class="font-semibold mb-1">Telefon</div>
              <a href="tel:+902120000000" class="text-slate-800">+90 212 000 00 00</a>
            </div>

            <div class="mt-4">
              <div class="font-semibold mb-1">E-posta</div>
              <a href="mailto:info@emlakturk.com" class="text-slate-800">info@emlakturk.com</a>
            </div>
          </div>
        </div>
      </section>

      <script>
        // mailto ile hızlı içerik doldurma (SPA içinde basit çözüm)
        (function(){
          const form = document.getElementById('contactForm');
          if (!form) return;
          form.addEventListener('submit', function(e){
            e.preventDefault();
            const fd = new FormData(form);
            const name  = (fd.get('name')    || '').toString().trim();
            const email = (fd.get('email')   || '').toString().trim();
            const phone = (fd.get('phone')   || '').toString().trim();
            const msg   = (fd.get('message') || '').toString().trim();

            const subject = encodeURIComponent('EmlakTürk İletişim Formu');
            const body = encodeURIComponent(
              ['Ad Soyad: ' + name, 'E-posta: ' + email, 'Telefon: ' + phone, '', msg].join('\\n')
            );
            location.href = 'mailto:info@emlakturk.com?subject=' + subject + '&body=' + body;
          });
        })();
      </script>
    `;
  }

  // default: about
  return `
    <section class="bg-white border border-slate-200 rounded-2xl p-4 md:p-6">
      <h1 class="text-xl font-semibold mb-4">Hakkımızda</h1>
      <div class="space-y-3 text-slate-700 leading-relaxed">
        <p>
          <b>EmlakTürk</b>, yatırım odaklı portföylerde uzmanlaşmış, şeffaf ve teknoloji destekli bir emlak ağıdır.
          Ziyaretçi sitemiz, ilanlara hızlı erişim ve kolay filtreleme sunarken; arka plandaki CRM/ERP yapısı,
          danışman verimliliği ve çok şubeli kurumsal yönetim için tasarlanmıştır.
        </p>
        <p>
          Hedefimiz; veri odaklı karar destek sistemleri ile portföy ve müşteri yönetimini kolaylaştırmak, 
          güvenilir ve hızlı işlem süreçleri oluşturmaktır.
        </p>
      </div>
    </section>
  `;
}
