// /src/api/data.js
// Kod 5: LocalStorage adapter (mock). Kod 6'da tek satırda gerçek API'ya geçişe hazır.

const LS_KEYS = {
  LISTINGS: 'listings.v3',
  USERS: 'publicUsers.v1',
  CURRENT_USER: 'currentUser.v1',
};

// ---------- Core storage helpers ----------
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (fallback ?? null);
  } catch (_) {
    return fallback ?? null;
  }
}
function writeJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

// UUID-ish
export function newId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

// ---------- Adapter seçimi (mock vs api) ----------
const ADAPTER = {
  mode: 'local', // 'local' | 'api'
};

// Eğer gerçek API'ya geçilecekse burası değişecek:
export function setAdapter(mode = 'local') {
  ADAPTER.mode = mode;
}

// ---------- Listings ----------
export async function getListings() {
  if (ADAPTER.mode === 'api') {
    // örnek: const res = await fetch('/api/listings'); return await res.json();
    // şimdilik local:
  }
  return readJSON(LS_KEYS.LISTINGS, []) || [];
}

export async function saveListings(list) {
  writeJSON(LS_KEYS.LISTINGS, list || []);
  window.dispatchEvent(new Event('listings:changed'));
  return list || [];
}

export async function upsertListing(partial) {
  const all = await getListings();
  if (!partial || typeof partial !== 'object') return all;

  let next = [...all];
  if (partial.id) {
    const i = next.findIndex(x => x.id === partial.id);
    if (i >= 0) {
      next[i] = { ...next[i], ...partial, updatedAt: new Date().toISOString() };
    } else {
      next.push({ ...partial, id: partial.id, createdAt: partial.createdAt || new Date().toISOString() });
    }
  } else {
    next.push({ ...partial, id: newId('lst'), createdAt: new Date().toISOString() });
  }
  return saveListings(next);
}

export async function deleteListing(id) {
  const all = await getListings();
  const next = all.filter(x => x.id !== id);
  return saveListings(next);
}

// Kod 5: publish / cover helpers
export async function publishListing(id, published) {
  const all = await getListings();
  const i = all.findIndex(x => x.id === id);
  if (i === -1) return all;
  all[i] = { ...all[i], published: !!published, updatedAt: new Date().toISOString() };
  return saveListings(all);
}

export async function setCover(listingId, coverIndex) {
  const all = await getListings();
  const i = all.findIndex(x => x.id === listingId);
  if (i === -1) return all;
  const rec = all[i] || {};
  const photos = Array.isArray(rec.photos) ? rec.photos : [];
  const idx = Math.max(-1, Math.min(Number(coverIndex) || 0, photos.length - 1));
  all[i] = { ...rec, coverIndex: idx, updatedAt: new Date().toISOString() };
  return saveListings(all);
}

// ---------- Users ----------
export async function getUsers() {
  return readJSON(LS_KEYS.USERS, []) || [];
}
export async function saveUsers(list) {
  writeJSON(LS_KEYS.USERS, list || []);
  window.dispatchEvent(new Event('users:changed'));
  return list || [];
}
export async function getUserByEmail(email) {
  const all = await getUsers();
  return all.find(u => (u.email || '').toLowerCase() === String(email || '').toLowerCase()) || null;
}
export async function publishUser(email, published) {
  const all = await getUsers();
  const i = all.findIndex(u => (u.email || '').toLowerCase() === String(email || '').toLowerCase());
  if (i === -1) return all;
  all[i] = { ...all[i], published: !!published, updatedAt: new Date().toISOString() };
  return saveUsers(all);
}

// ---------- Auth (mock) ----------
export function getCurrentUser() {
  return readJSON(LS_KEYS.CURRENT_USER, null);
}
export function setCurrentUser(user) {
  writeJSON(LS_KEYS.CURRENT_USER, user || null);
  window.dispatchEvent(new Event('auth:changed'));
  return user || null;
}
export function logout() {
  setCurrentUser(null);
}

// ---------- Şema örnekleri için hafif seed (opsiyonel) ----------
(function ensureSeeds() {
  // Boşsa ana anahtarları oluştur
  if (!readJSON(LS_KEYS.LISTINGS)) writeJSON(LS_KEYS.LISTINGS, []);
  if (!readJSON(LS_KEYS.USERS)) writeJSON(LS_KEYS.USERS, []);
})();
