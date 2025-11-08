export default function Footer() {
  const year = new Date().getFullYear();
  return `
    <footer class="mt-auto bg-white border-t border-slate-200">
      <div class="container mx-auto container-narrow px-4 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
        <div>
          <div class="font-semibold mb-2">Satılık</div>
          <a href="#/listings" class="block hover:underline">Konut</a>
          <a href="#/listings" class="block hover:underline">Ticari</a>
          <a href="#/listings" class="block hover:underline">Arsa</a>
          <a href="#/listings" class="block hover:underline">Villa</a>
        </div>
        <div>
          <div class="font-semibold mb-2">Kurumsal</div>
          <a href="#/about" class="block hover:underline">Hakkımızda</a>
          <a href="#/offices" class="block hover:underline">Ofisler</a>
          <a href="#/agents" class="block hover:underline">Danışmanlar</a>
        </div>
        <div>
          <div class="font-semibold mb-2">Destek</div>
          <a href="#/contact" class="block hover:underline">İletişim</a>
          <a href="#/contact" class="block hover:underline">Sık Sorulanlar</a>
        </div>
        <div>
          <div class="font-semibold mb-2">Yasal</div>
          <a href="#/about" class="block hover:underline">KVKK</a>
          <a href="#/about" class="block hover:underline">Çerez Politikası</a>
          <a href="#/about" class="block hover:underline">Kullanım Şartları</a>
        </div>
      </div>
      <div class="text-center text-xs text-slate-500 pb-6">© ${year} Ziyaretçi Sitesi · Tüm hakları saklıdır.</div>
    </footer>
  `;
}
