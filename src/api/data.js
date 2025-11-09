// /src/api/data.js
const LKEY = 'publicListings.v2';
const UKEY = 'publicUsers.v1';
const AUTH = 'publicAuth.v1';

export function newId(p='x'){ return p + Math.random().toString(36).slice(2,8) + Date.now().toString(36).slice(-4); }

// ---- Listings ----
export function getListings() {
  try { return JSON.parse(localStorage.getItem(LKEY)||'[]'); } catch { return []; }
}
export function saveListings(arr) {
  localStorage.setItem(LKEY, JSON.stringify(arr));
}
export function upsertListing(obj) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id===obj.id);
  const now = new Date().toISOString();
  if (i>=0) arr[i] = { ...arr[i], ...obj, updatedAt: now };
  else arr.push({ ...obj, createdAt: now, updatedAt: now });
  saveListings(arr);
  return obj.id;
}
export function deleteListing(id) {
  saveListings(getListings().filter(x => x.id!==id));
}
export function findListing(id) {
  return (getListings()||[]).find(x => x.id===id);
}
export function publishListing(id, published=true) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id===id);
  if (i>=0) { arr[i].published = !!published; saveListings(arr); }
}
export function setCover(id, coverIndex=0) {
  const arr = getListings();
  const i = arr.findIndex(x => x.id===id);
  if (i>=0) { arr[i].coverIndex = Number(coverIndex)||0; saveListings(arr); }
}

// ---- Users ----
export function getUsers() {
  try { return JSON.parse(localStorage.getItem(UKEY)||'[]'); } catch { return []; }
}
export function saveUsers(arr) {
  localStorage.setItem(UKEY, JSON.stringify(arr));
  window.dispatchEvent(new Event('users:changed'));
}
export function getUserByEmail(email) {
  const e = String(email||'').toLowerCase().trim();
  return getUsers().find(u => String(u.email||'').toLowerCase().trim()===e);
}
export function publishUser(email, published=true) {
  const arr = getUsers();
  const e = String(email||'').toLowerCase().trim();
  const i = arr.findIndex(u => String(u.email||'').toLowerCase().trim()===e);
  if (i>=0) { arr[i].published = !!published; saveUsers(arr); }
}

// ---- Auth session (data-layer) ----
export function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem(AUTH)||'null'); } catch { return null; }
}
export function setCurrentUser(u) {
  if (u) localStorage.setItem(AUTH, JSON.stringify(u));
  else localStorage.removeItem(AUTH);
  window.dispatchEvent(new Event('auth:changed'));
}
