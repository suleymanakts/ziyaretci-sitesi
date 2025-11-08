// /src/api/data.js
// Kod 5 → LocalStorage adapter (mock).
// Kod 6 → setAdapter('api') ile tek satırda gerçek API’ya geçiş.

const LS_KEYS = {
  LISTINGS: 'listings.v3',
  USERS: 'publicUsers.v1',
  CURRENT_USER: 'currentUser.v1',
};

// ------------------------- küçük yardımcılar -------------------------
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
export function newId(prefix = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}
function ensureArray(v) {
  if (Array.isArray(v)) return v;
  if (v && typeof v === 'object') {
    if (Array.isArray(v.items)) return v.items;
    try { return Object.values(v); } catch { /* noop */ }
  }
  return [];
}
function emit(name) {
  try { window.dispatchEvent(new Event(name)); } catch {}
}
const nowISO = () => new Date().toISOString();

// ------------------------- adapter seçimi -------------------------
const ADAPTER = { mode: 'local' }; // 'local' | 'api'
export function setAdapter(mode = 'local') { ADAPTER.mode = mode; }

// ------------------------- Normalizasyon -------------------------
function normalizeListing(input) {
  const rec = { ...(input || {}) };

  // temel alanlar
  rec.id = rec.id || newId('lst');
  rec.title = String(rec.title || '').trim();
  rec.description = String(rec.description || rec.desc || '').trim();
  rec.price = Number(rec.price ?? 0) || 0;

  // konum
  const loc = rec.location || {};
  rec.location = {
    province: String(loc.province || '').trim(),
    district: String(loc.district || '').trim(),
    neighborhood: String(loc.neighborhood || '').trim(),
  };

  // sınıflandırma (şimdilik varsayılanlar)
  rec.transactionType = rec.transactionType || rec.intent || 'Satılık';
  rec.propertyClass   = rec.propertyClass || rec.category || 'Konut';
  rec.subcategory     = rec.subcategory || rec.subType || 'Daire';

  // medya
  const photos = ensureArray(rec.photos).filter(Boolean).map(String);
  rec.photos = photos;
  let ci = Number(rec.coverIndex ?? (photos.length ? 0 : -1));
  if (!Number.isFinite(ci)) ci = photos.length ? 0 : -1;
  if (photos.length === 0) ci = -1;
  if (photos.length > 0)  ci = Math.max(0, Math.min(ci, photos.length - 1));
  rec.coverIndex = ci;

  let v = String(rec.videoUrl || '').trim();
  if (!v) delete rec.videoUrl; else rec.videoUrl = v;

  // yayın durumu
  rec.published = !!rec.published;
  rec.status = rec.status || (rec.published ? 'published' : 'draft');

  // zaman damgaları
  rec.createdAt = rec.createdAt || nowISO();
  rec.updatedAt = rec.updatedAt || rec.createdAt;

  return rec;
}

// ------------------------- LOCAL impl -------------------------
const localImpl = {
  // Listings
  async getListings() {
    return ensureArray(readJSON(LS_KEYS.LISTINGS, []));
  },
  async saveListings(list) {
    writeJSON(LS_KEYS.LISTINGS, ensureArray(list));
    emit('listings:changed');
    return ensureArray(list);
  },
  async upsertListing(partial) {
    const all = await localImpl.getListings();
    if (!partial || typeof partial !== 'object') return all;

    const next = [...all];
    if (partial.id) {
      const i = next.findIndex(x => x.id === partial.id);
      if (i >= 0) {
        const merged = normalizeListing({ ...next[i], ...partial, updatedAt: nowISO() });
        next[i] = merged;
      } else {
        const created = normalizeListing({
          ...partial,
          id: partial.id,
          createdAt: partial.createdAt || nowISO(),
        });
        next.push(created);
      }
    } else {
      const created = normalizeListing({ ...partial, id: newId('lst'), createdAt: nowISO() });
      next.push(created);
    }
    return localImpl.saveListings(next);
  },
  async deleteListing(id) {
    const all = await localImpl.getListings();
    return localImpl.saveListings(all.filter(x => x.id !== id));
  },
  async publishListing(id, published) {
    const all = await localImpl.getListings();
    const i = all.findIndex(x => x.id === id);
    if (i === -1) return all;
    const rec = { ...all[i], published: !!published, status: (!!published ? 'published' : 'draft'), updatedAt: nowISO() };
    all[i] = normalizeListing(rec);
    return localImpl.saveListings(all);
  },
  async setCover(listingId, coverIndex) {
    const all = await localImpl.getListings();
    const i = all.findIndex(x => x.id === listingId);
    if (i === -1) return all;
    const rec = { ...all[i] };
    const photos = ensureArray(rec.photos).filter(Boolean);
    let idx = Math.max(-1, Math.min(Number(coverIndex) || 0, photos.length - 1));
    if (photos.length === 0) idx = -1;
    all[i] = normalizeListing({ ...rec, coverIndex: idx, updatedAt: nowISO() });
    return localImpl.saveListings(all);
  },
  async getListingById(id) {
    const all = await localImpl.getListings();
    return all.find(x => String(x.id) === String(id)) || null;
  },

  // Users
  async getUsers() {
    return ensureArray(readJSON(LS_KEYS.USERS, []));
  },
  async saveUsers(list) {
    writeJSON(LS_KEYS.USERS, ensureArray(list));
    emit('users:changed');
    return ensureArray(list);
  },
  async getUserByEmail(email) {
    const all = await localImpl.getUsers();
    const key = String(email || '').toLowerCase();
    return all.find(u => (u.email || '').toLowerCase() === key) || null;
  },
  async publishUser(email, published) {
    const all = await localImpl.getUsers();
    const key = String(email || '').toLowerCase();
    const i = all.findIndex(u => (u.email || '').toLowerCase() === key);
    if (i === -1) return all;
    all[i] = { ...all[i], published: !!published, updatedAt: nowISO() };
    return localImpl.saveUsers(all);
  },

  // Auth (mock)
  getCurrentUser() {
    return readJSON(LS_KEYS.CURRENT_USER, null);
  },
  setCurrentUser(user) {
    writeJSON(LS_KEYS.CURRENT_USER, user || null);
    emit('auth:changed');
    return user || null;
  },
  logout() {
    localImpl.setCurrentUser(null);
  }
};

// ------------------------- API impl (placeholder) -------------------------
// Kod 6’da gerçek endpoint’lere bağlayacağız.
// Şimdilik local ile aynı arayüz; istersen yavaş yavaş fetch’lere çevirebilirsin.
const apiImpl = {
  async getListings()       { return localImpl.getListings();       /* GET /api/listings */ },
  async saveListings(list)  { return localImpl.saveListings(list);  /* PUT /api/listings */ },
  async upsertListing(p)    { return localImpl.upsertListing(p);    /* POST/PUT /api/listings */ },
  async deleteListing(id)   { return localImpl.deleteListing(id);   /* DELETE /api/listings/:id */ },
  async publishListing(id,b){ return localImpl.publishListing(id,b);/* PATCH /api/listings/:id */ },
  async setCover(id, idx)   { return localImpl.setCover(id, idx);   /* PATCH /api/listings/:id */ },
  async getListingById(id)  { return localImpl.getListingById(id);  /* GET /api/listings/:id */ },

  async getUsers()          { return localImpl.getUsers();          /* GET /api/users */ },
  async saveUsers(list)     { return localImpl.saveUsers(list);     /* PUT /api/users */ },
  async getUserByEmail(e)   { return localImpl.getUserByEmail(e);   /* GET /api/users?email= */ },
  async publishUser(e,b)    { return localImpl.publishUser(e,b);    /* PATCH /api/users/:id */ },

  getCurrentUser()          { return localImpl.getCurrentUser();    /* GET /api/auth/me */ },
  setCurrentUser(u)         { return localImpl.setCurrentUser(u);   /* POST /api/auth/login */ },
  logout()                  { return localImpl.logout();            /* POST /api/auth/logout */ },
};

// ------------------------- dışa açılan API (tek yüz) -------------------------
const use = () => (ADAPTER.mode === 'api' ? apiImpl : localImpl);

// Listings
export async function getListings()         { return use().getListings(); }
export async function saveListings(list)    { return use().saveListings(list); }
export async function upsertListing(p)      { return use().upsertListing(p); }
export async function deleteListing(id)     { return use().deleteListing(id); }
export async function publishListing(id,b)  { return use().publishListing(id,b); }
export async function setCover(id, idx)     { return use().setCover(id, idx); }
export async function getListingById(id)    { return use().getListingById(id); }

// Users
export async function getUsers()            { return use().getUsers(); }
export async function saveUsers(list)       { return use().saveUsers(list); }
export async function getUserByEmail(e)     { return use().getUserByEmail(e); }
export async function publishUser(e,b)      { return use().publishUser(e,b); }

// Auth
export function getCurrentUser()            { return use().getCurrentUser(); }
export function setCurrentUser(u)           { return use().setCurrentUser(u); }
export function logout()                    { return use().logout(); }

// ------------------------- migrate + başlangıç seed’leri -------------------------
(function migrate() {
  // Önceki anahtar adlarından otomatik taşıma (varsa)
  const oldListings = readJSON('listings', null);
  if (oldListings && !readJSON(LS_KEYS.LISTINGS)) {
    const normalized = ensureArray(oldListings).map(normalizeListing);
    writeJSON(LS_KEYS.LISTINGS, normalized);
  }
  const oldUsers = readJSON('publicUsers', null);
  if (oldUsers && !readJSON(LS_KEYS.USERS)) {
    writeJSON(LS_KEYS.USERS, ensureArray(oldUsers));
  }
})();

(function ensureSeeds() {
  if (!readJSON(LS_KEYS.LISTINGS)) writeJSON(LS_KEYS.LISTINGS, []);
  if (!readJSON(LS_KEYS.USERS))    writeJSON(LS_KEYS.USERS, []);
})();
