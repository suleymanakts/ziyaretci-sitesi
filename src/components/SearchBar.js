import { navigateTo } from '../router.js';

export default function SearchBar() {
  setTimeout(() => mount(), 0);
  return `
    <form id="homeSearch" class="grid grid-cols-1 md:grid-cols-7 gap-2 bg-white/90 glass rounded-xl p-3 border border-slate-200">
      <select id="s-offer" class="px-3 py-2 rounded-lg border border-slate-300">
        <option value="">Hepsi</option>
        <option value="satilik">Satılık</option>
        <option value="kiralik">Kiralık</option>
      </select>
      <input id="s-city" placeholder="Şehir" class="px-3 py-2 rounded-lg border border-slate-300">
      <select id="s-type" class="px-3 py-2 rounded-lg border border-slate-300">
        <option value="">Tür</option>
        <option value="konut">konut</option>
        <option value="ticari">ticari</option>
        <option value="arsa">arsa</option>
        <option value="villa">villa</option>
      </select>
      <input id="s-q" placeholder="Anahtar kelime" class="px-3 py-2 rounded-lg border border-slate-300">
      <input id="s-min" type="number" placeholder="Min ₺" class="px-3 py-2 rounded-lg border border-slate-300">
      <input id="s-max" type="number" placeholder="Max ₺" class="px-3 py-2 rounded-lg border border-slate-300">
      <button class="px-4 py-2 rounded-lg bg-brand text-white hover:bg-brand-dark">Ara</button>
    </form>
  `;
}

function mount() {
  const f = document.getElementById('homeSearch');
  if (!f) return;
  f.addEventListener('submit', (e) => {
    e.preventDefault();
    const tmp = {
      offerType: f.querySelector('#s-offer').value,
      city: f.querySelector('#s-city').value.trim(),
      type: f.querySelector('#s-type').value,
      q: f.querySelector('#s-q').value.trim(),
      priceMin: Number(f.querySelector('#s-min').value || 0),
      priceMax: Number(f.querySelector('#s-max').value || 0),
    };
    localStorage.setItem('listingFilters.temp', JSON.stringify(tmp));
    navigateTo('#/listings');
  });
}
