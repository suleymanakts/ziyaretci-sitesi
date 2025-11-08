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

// ------------------------- adapter seçimi -------------------------
const ADAPTER = { mode: 'local' }; // 'local' | 'api'
export function setAdapter(mode = 'local') { ADAPTER.mode = mode; }

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
        next[i] = { ...next[i], ...partial, updatedAt: new Date().toISOString() };
      } else {
        next.push({
          ...partial,
          id: partial.id,
          createdAt: partial.createdAt || new Date().toISOString()
        });
      }
    } else {
      next.push({ ...partial, id: newId('lst'), createdAt: new Date().toISOString() });
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
    all[i] = { ...all[i], published: !!published, updatedAt: new Date().toISOString() };
    return localImpl.saveListings(all);
  },
  async setCover(listingId, coverIndex) {
    const all = await localImpl.getListings();
    const i = all.findIndex(x => x.id === listingId);
    if (i === -1) return all;
    const rec = all[i] || {};
    const photos = Array.isArray(rec.photos) ? rec.photos : [];
    const idx = Math.max(-1, Math.min(Number(coverIndex) || 0, photos.length - 1));
    all[i] = { ...rec, coverIndex: idx, updatedAt: new Date().toISOString() };
    return localImpl.saveListings(all);
  },
  async getListingById(id) {
    const all = await localImpl.getListings();
    return all.find(x => x.id === id) || null;
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
    all[i] = { ...all[i], published: !!published, updatedAt: new Date().toISOString() };
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
// Kod 6’da dolduracağız: endpoint’ler hazır olunca sadece setAdapter('api') yeter.
// Şimdilik local ile aynı arayüzü koruyan, fakat hata fırlatmak yerine local’e
// “passthrough” yapabilen bir yapı bırakıyoruz (geliştirme rahatlığı için).
const apiImpl = {
  async getListings()       { return localImpl.getListings();       /* fetch('/api/listings') */ },
  async saveListings(list)  { return localImpl.saveListings(list);  /* PUT /api/listings */     },
  async upsertListing(p)    { return localImpl.upsertListing(p);    /* POST/PUT /api/listings */ },
  async deleteListing(id)   { return localImpl.deleteListing(id);   /* DELETE /api/listings/:id */ },
  async publishListing(id,b){ return localImpl.publishListing(id,b);/* PATCH  /api/listings/:id */ },
  async setCover(id, idx)   { return localImpl.setCover(id, idx);   /* PATCH  /api/listings/:id */ },
  async getListingById(id)  { return localImpl.getListingById(id);  /* GET    /api/listings/:id */ },

  async getUsers()          { return localImpl.getUsers();          /* GET    /api/users */      },
  async saveUsers(list)     { return localImpl.saveUsers(list);     /* PUT    /api/users */      },
  async getUserByEmail(e)   { return localImpl.getUserByEmail(e);   /* GET    /api/users?email= */ },
  async publishUser(e,b)    { return localImpl.publishUser(e,b);    /* PATCH  /api/users/:id */  },

  getCurrentUser()          { return localImpl.getCurrentUser();    /* GET    /api/auth/me */    },
  setCurrentUser(u)         { return localImpl.setCurrentUser(u);   /* POST   /api/auth/login */ },
  logout()                  { return localImpl.logout();            /* POST   /api/auth/logout */},
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

// ------------------------- başlangıç seed’leri -------------------------
(function ensureSeeds() {
  if (!readJSON(LS_KEYS.LISTINGS)) writeJSON(LS_KEYS.LISTINGS, []);
  if (!readJSON(LS_KEYS.USERS))    writeJSON(LS_KEYS.USERS, []);
})();
