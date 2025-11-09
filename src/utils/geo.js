// /src/utils/geo.js
let cache = null;

export async function loadTRLocations() {
  if (cache) return cache;
  cache = {
    'İstanbul': { 'Kadıköy': ['Acıbadem','Koşuyolu','Moda'], 'Ataşehir': ['Atatürk','İçerenköy'] },
    'İzmir':    { 'Konak':   ['Alsancak','Güzelyalı'],       'Karşıyaka': ['Bostanlı','Mavişehir'] },
  };
  return cache;
}

export function provinces() { return Object.keys(cache||{}); }
export function districts(p) { return Object.keys((cache||{})[p]||{}); }
export function neighborhoods(p,d) { return ((cache||{})[p]||{})[d]||[]; }
