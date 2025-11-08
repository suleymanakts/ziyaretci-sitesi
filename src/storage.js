// storage.js
// LocalStorage tabanlı ilan CRUD + marka adı + seed.
// v2 şeması: moderasyon, satılık/kiralık, ana/alt tür, konum alanları.

const LS_LIST = 'publicListings.v2';
const LS_BRAND = 'publicBrand.v1';

export const DEFAULT_BRAND = 'EmlakTürk';

/* ------------------ Marka ------------------ */
export function getBrand() {
  return localStorage.getItem(LS_BRAND) || DEFAULT_BRAND;
}
export function setBrand(v) {
  localStorage.setItem(LS_BRAND, v || DEFAULT_BRAND);
}

/* ------------------ Yardımcılar ------------------ */
export function newId() {
  return 'L-' + Math.random().toString(36).slice(2, 8);
}
export function nowISO() {
  return new Date().toISOString();
}

/* ------------------ Normalize (Şema) ------------------ */
/*
status: 'draft' | 'pending' | 'published' | 'rejected'
offerType: 'satilik' | 'kiralik'
mainType: 'konut' | 'arsa' | 'ticari' | 'villa' | string
subType: alt kategori (örn: konut→daire/rezidans; arsa→imarlı/sanayi ...)
location: { province, district, neighborhood }
*/
function normalize(x = {}) {
  return {
    id: x.id || newId(),
    status: x.status || 'published',
    offerType: x.offerType || 'satilik',
    mainType: x.mainType || (x.type || 'konut'),
    subType: x.subType || '',
    title: x.title || '',
    price: Number(x.price || 0),
    area_m2: Number(x.area_m2 || 0),
    rooms: x.rooms ?? '',
    bathrooms: Number(x.bathrooms || 0),
    buildingAge: x.buildingAge ?? '',
    floor: x.floor ?? '',
    heating: x.heating ?? '',
    description: x.description || '',
    features: Array.isArray(x.features) ? x.features : [],
    images: Array.isArray(x.images) ? x.images : [],
    videoUrl: x.videoUrl || '',
    mapEmbed: x.mapEmbed || '',
    location: {
      province: (x.location && x.location.province) || x.city || '',
      district: (x.location && x.location.district) || x.district || '',
      neighborhood: (x.location && x.location.neighborhood) || '',
    },
    contactPhone: x.contactPhone || '',
    whatsappPhone: x.whatsappPhone || '',
    creator: x.creator || { role: 'system', name: 'seed' },
    createdAt: x.createdAt || nowISO(),
  };
}

/* ------------------ CRUD ------------------ */
export function getListings() {
  try {
    const raw = localStorage.getItem(LS_LIST);
    const arr = raw ? JSON.parse(raw) : [];
    return arr.map(normalize);
  } catch {
    return [];
  }
}
export function setListings(list) {
  localStorage.setItem(LS_LIST, JSON.stringify((list || []).map(normalize)));
}
export function upsertListing(item) {
  const list = getListings();
  const idx = list.findIndex((x) => x.id === item.id);
  const obj = normalize(item);
  if (idx >= 0) list[idx] = obj;
  else list.push(obj);
  setListings(list);
  return obj;
}
export function deleteListing(id) {
  setListings(getListings().filter((x) => x.id !== id));
}
export function getById(id) {
  return getListings().find((x) => x.id === id) || null;
}

/* ------------------ Seed ------------------ */
function colorPng() {
  // 1x1 piksel placeholder
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AAoMBnRrAqYkAAAAASUVORK5CYII=';
}

export function seedIfEmpty() {
  const raw = localStorage.getItem(LS_LIST);
  if (raw) return;

  const now = nowISO();
  const seed = [
    {
      title: 'Şehir Manzaralı 3+1 Daire',
      offerType: 'satilik',
      mainType: 'konut',
      subType: 'daire',
      price: 4750000,
      area_m2: 125,
      rooms: '3+1',
      bathrooms: 2,
      buildingAge: '0-5',
      floor: '7/12',
      heating: 'Kombi',
      description: 'Metroya 5 dk, site içi havuz, kapalı otopark.',
      features: ['3+1', 'otopark', 'site içi', 'asansör', 'güvenlik'],
      images: [colorPng(), colorPng(), colorPng()],
      location: { province: 'İstanbul', district: 'Kağıthane', neighborhood: 'Çağlayan' },
      contactPhone: '+90 532 000 00 00',
      whatsappPhone: '+90 532 000 00 00',
      creator: { role: 'system', name: 'seed' },
      createdAt: now,
      status: 'published',
    },
    {
      title: 'Yatırım Arazi 1100 m²',
      offerType: 'satilik',
      mainType: 'arsa',
      subType: 'imarlı',
      price: 1850000,
      area_m2: 1100,
      description: 'Ana yola 400m, elektrik ve su yakın.',
      features: ['elektrik yakın', 'yol cepheli'],
      images: [colorPng(), colorPng()],
      location: { province: 'İzmir', district: 'Menemen', neighborhood: '' },
      contactPhone: '+90 532 000 00 01',
      whatsappPhone: '+90 532 000 00 01',
      creator: { role: 'system', name: 'seed' },
      createdAt: now,
      status: 'published',
    },
    {
      title: 'Fabrika / Depo 1800 m²',
      offerType: 'kiralik',
      mainType: 'ticari',
      subType: 'depo',
      price: 350000, // kira
      area_m2: 1800,
      bathrooms: 4,
      buildingAge: '5-10',
      heating: 'Doğalgaz',
      description: '10m tavan, TIR girişi uygun, güç hattı hazır.',
      features: ['yüksek tavan', 'tır girişi', 'doğalgaz'],
      images: [colorPng()],
      location: { province: 'Kocaeli', district: 'Gebze', neighborhood: 'İMES OSB' },
      contactPhone: '+90 532 000 00 02',
      whatsappPhone: '+90 532 000 00 02',
      creator: { role: 'system', name: 'seed' },
      createdAt: now,
      status: 'published',
    },
  ];

  setListings(seed.map(normalize));
  if (!localStorage.getItem(LS_BRAND)) setBrand(DEFAULT_BRAND);
}
