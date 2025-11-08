export default function Offices() {
  setTimeout(()=>{ window.__mountOffices = () => {}; }, 0);
  const data = [
    { name:'EmlakTürk – İstanbul', address:'Levent, Beşiktaş', phone:'+90 212 000 00 00' },
    { name:'EmlakTürk – İzmir',    address:'Alsancak, Konak',  phone:'+90 232 000 00 00' },
    { name:'EmlakTürk – Ankara',   address:'Çankaya',          phone:'+90 312 000 00 00' },
  ];
  return `
    <div class="bg-white border border-slate-200 rounded-2xl p-4 md:p-6">
      <h1 class="text-xl font-semibold mb-4">Ofisler</h1>
      <div class="space-y-3">
        ${data.map(o => `
          <div class="border border-slate-200 rounded-xl p-4 flex items-center justify-between">
            <div>
              <div class="font-semibold">${o.name}</div>
              <div class="text-sm text-slate-600">${o.address}</div>
            </div>
            <a href="tel:${o.phone}" class="px-3 py-2 rounded-lg bg-slate-900 text-white">Ara</a>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}
