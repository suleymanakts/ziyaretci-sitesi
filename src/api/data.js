// /src/api/data.js
// LocalStorage tabanlı mock (K6’da gerçek API adapter’ına geçilecek)

const LKEY = 'publicListings.v3';
const UKEY = 'publicUsers.v1';
const AUTH = 'publicAuth.v1';

// ---- helpers ----
function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : (fallback ?? null);
  } catch {
    return fallback ?? null;
  }
}
function writeJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function newId(p='x'){
  return p + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4);
}

// ---- Listings ----
export function getListings() {
  return readJSON(LKEY, []) || [];
}
export function saveListings(arr) {
  writeJSON(LKEY, Array.isArray(arr) ? arr : []);
  window.dispatchEvent(new Event('listings:changed'));
}
export function upsertListing(obj) {
  const arr = getListings();
  const now = new Date().toISOString();
  const i = arr.findIndex(x => x.id === obj.id);
  if (i >= 0) {
    arr[i] = { ...arr[i], ...obj, updatedAt: now };
  } else {
    const id = obj.id || newId('l');
    arr.push({ ...obj, id, createdAt: now, updatedAt: now });
  }
  saveListings(arr);
  return obj.id || arr[arr.length-1].id;
}
export function deleteListing(id) {
  saveListings(getListings().filter(x => x.id !== id));
}
export function findListing(id) {
  return (getListings() || []).find(x => x.id === id);
}
export function getListingById(id) { // K5 uyum
  return findListing(id);
}
export function publishListing(id, published = true) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) { arr[i].published = !!published; saveListings(arr); }
}
export function setCover(id, coverIndex = 0) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id === id);
  if (i >= 0) { arr[i].coverIndex = Number(coverIndex)||0; saveListings(arr); }
}

// ---- Users ----
export function getUsers() {
  return readJSON(UKEY, []) || [];
}
export function saveUsers(arr) {
  writeJSON(UKEY, Array.isArray(arr) ? arr : []);
  window.dispatchEvent(new Event('users:changed'));
}
export function getUserByEmail(email) {
  const e = String(email||'').toLowerCase().trim();
  return getUsers().find(u => String(u.email||'').toLowerCase().trim() === e);
}
export function publishUser(email, published = true) {
  const arr = getUsers();
  const e = String(email||'').toLowerCase().trim();
  const i = arr.findIndex(u => String(u.email||'').toLowerCase().trim() === e);
  if (i >= 0) { arr[i].published = !!published; saveUsers(arr); }
}

// ---- Auth session (data-katmanı) ----
export function getCurrentUser() {
  return readJSON(AUTH, null);
}
export function setCurrentUser(u) {
  if (u) writeJSON(AUTH, u);
  else localStorage.removeItem(AUTH);
  window.dispatchEvent(new Event('auth:changed'));
}
export function logout() { setCurrentUser(null); }

// ---- seed (yoksa oluştur) ----
(function seedOnce(){
  if (!readJSON(LKEY)) writeJSON(LKEY, []);
  if (!readJSON(UKEY)) {
    writeJSON(UKEY, [
      { id:'u1', fullName:'Admin Kullanıcı',  email:'admin@local',  pass:'1234', role:'admin',  published:true },
      { id:'u2', fullName:'Broker Demo',      email:'broker@local', pass:'1234', role:'broker', published:true },
    ]);
  }
})();
