// /src/api/data.js
// K5 STABLE – LocalStorage mock (K6'da gerçek API adapter'ına geçilecek)
// - Vercel build/SSR güvenliği: localStorage yoksa no-op store kullanır
// - K4/K5 uyumu: findListing + getListingById alias

const LKEY = 'publicListings.v3';
const UKEY = 'publicUsers.v1';
const AUTH = 'publicAuth.v1';

// ---- safe store (SSR/build ortamında patlamasın) ----
const hasBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
const store = hasBrowser
  ? window.localStorage
  : {
      getItem() { return null; },
      setItem() {},
      removeItem() {},
    };

// ---- helpers ----
function readJSON(key, fallback = null) {
  try {
    const raw = store.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, val) {
  try {
    store.setItem(key, JSON.stringify(val));
  } catch {}
}

export function newId(p = 'x') {
  return p + Math.random().toString(36).slice(2, 8) + Date.now().toString(36).slice(-4);
}

// ---- Listings ----
export function getListings() {
  const arr = readJSON(LKEY, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveListings(arr) {
  writeJSON(LKEY, Array.isArray(arr) ? arr : []);
  if (hasBrowser) window.dispatchEvent(new Event('listings:changed'));
}
export function upsertListing(obj) {
  const arr = getListings();
  const now = new Date().toISOString();
  const idx = arr.findIndex(x => x.id === obj.id && x.id != null);

  if (idx >= 0) {
    arr[idx] = { ...arr[idx], ...obj, updatedAt: now };
    saveListings(arr);
    return arr[idx].id;
  } else {
    const id = obj.id || newId('l');
    arr.push({ ...obj, id, createdAt: now, updatedAt: now });
    saveListings(arr);
    return id;
  }
}
export function deleteListing(id) {
  saveListings(getListings().filter(x => x.id !== id));
}
export function findListing(id) {
  return getListings().find(x => x.id === id);
}
// K5 uyumu (ListingDetail)
export function getListingById(id) {
  return findListing(id);
}
export function publishListing(id, published = true) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) {
    arr[i].published = !!published;
    saveListings(arr);
    return true;
  }
  return false;
}
export function setCover(id, coverIndex = 0) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) {
    arr[i].coverIndex = Math.max(0, Number(coverIndex) || 0);
    saveListings(arr);
    return true;
  }
  return false;
}

// ---- Users ----
export function getUsers() {
  const arr = readJSON(UKEY, []);
  return Array.isArray(arr) ? arr : [];
}
export function saveUsers(arr) {
  writeJSON(UKEY, Array.isArray(arr) ? arr : []);
  if (hasBrowser) window.dispatchEvent(new Event('users:changed'));
}
export function getUserByEmail(email) {
  const e = String(email || '').toLowerCase().trim();
  return getUsers().find(u => String(u.email || '').toLowerCase().trim() === e);
}
export function publishUser(email, published = true) {
  const arr = getUsers();
  const e = String(email || '').toLowerCase().trim();
  const i = arr.findIndex(u => String(u.email || '').toLowerCase().trim() === e);
  if (i >= 0) {
    arr[i].published = !!published;
    saveUsers(arr);
    return true;
  }
  return false;
}

// ---- Auth session (data katmanı) ----
export function getCurrentUser() {
  return readJSON(AUTH, null);
}
export function setCurrentUser(u) {
  if (u) writeJSON(AUTH, u);
  else store.removeItem(AUTH);
  if (hasBrowser) window.dispatchEvent(new Event('auth:changed'));
}
export function logout() { setCurrentUser(null); }

// ---- seed (ilk kurulum) ----
(function seedOnce() {
  // listeler
  if (readJSON(LKEY, null) === null) writeJSON(LKEY, []);

  // kullanıcılar
  if (readJSON(UKEY, null) === null) {
    writeJSON(UKEY, [
      { id: 'u1', fullName: 'Admin Kullanıcı',  email: 'admin@local',  pass: '1234', role: 'admin',  published: true },
      { id: 'u2', fullName: 'Broker Demo',      email: 'broker@local', pass: '1234', role: 'broker', published: true },
    ]);
  }
})();
