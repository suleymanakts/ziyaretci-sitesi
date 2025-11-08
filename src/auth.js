// /src/auth.js
// K5 — Oturum ve kullanıcı işlemleri (tek-kanal: data.js)
// - Session: data.js -> getCurrentUser / setCurrentUser (auth:changed event burada yayılır)
// - User store: publicUsers.v1 (gerekirse et_users'tan migrasyon)
// - Şifre alanı: pass | password toleranslı

import {
  getUsers,
  saveUsers,
  getCurrentUser as apiGetCurrentUser,
  setCurrentUser as apiSetCurrentUser,
  newId,
} from '@/api/data.js';

// -------------------- Sabitler --------------------
const USERS_KEY = 'publicUsers.v1';
const ET_USERS  = 'et_users'; // eski havuz (varsa)

// -------------------- Yardımcılar --------------------
function normalizeEmail(s) {
  return String(s || '').trim().toLowerCase();
}
function isTruthy(v) {
  if (v === true) return true;
  const s = String(v || '').trim().toLowerCase();
  return s === 'true' || s === '1' || s === 'on' || s === 'yes';
}
function readLocalJSON(key, fb) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fb;
    return JSON.parse(raw);
  } catch {
    return fb;
  }
}
function uniqueByEmail(arr) {
  const seen = new Set();
  return arr.filter(u => {
    const e = normalizeEmail(u.email);
    if (!e || seen.has(e)) return false;
    seen.add(e);
    return true;
  });
}

// -------------------- Seed (ilk kurulum) --------------------
(function seedUsersOnce() {
  const existing = getUsers();
  if (Array.isArray(existing) && existing.length) return;

  const seed = [
    { id: 'u1', fullName: 'Admin Kullanıcı',  email: 'admin@local',  pass: '1234', role: 'admin',  published: true,  createdAt: new Date().toISOString() },
    { id: 'u2', fullName: 'Broker Demo',      email: 'broker@local', pass: '1234', role: 'broker', published: true,  createdAt: new Date().toISOString() },
  ];
  saveUsers(seed);
})();

// -------------------- Migrasyon (et_users -> publicUsers.v1) --------------------
(function migrateEtUsersOnce() {
  const pub = Array.isArray(getUsers()) ? getUsers() : [];
  const etc = readLocalJSON(ET_USERS, []);

  if (Array.isArray(etc) && etc.length) {
    const emails = new Set(pub.map(u => normalizeEmail(u.email)));
    const incoming = etc
      .map(u => ({
        id:        u.id || u.userId || newId('u'),
        fullName:  String(u.fullName || u.name || u.displayName || '').trim(),
        email:     normalizeEmail(u.email),
        pass:      u.pass ?? u.password ?? '',
        role:      String(u.role || u.userRole || 'agent').toLowerCase(),
        phone:     String(u.phone || u.mobile || '').trim(),
        address:   String(u.address || '').trim(),
        published: isTruthy(u.published),
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      .filter(u => u.email && !emails.has(u.email));

    if (incoming.length) {
      const next = uniqueByEmail([...pub, ...incoming]);
      saveUsers(next);
    }
  }

  // En az bir admin garantisi
  const after = Array.isArray(getUsers()) ? getUsers() : [];
  const hasAdmin = after.some(u => String(u.role || '').toLowerCase() === 'admin');
  if (!hasAdmin) {
    after.push({
      id: newId('u'),
      fullName: 'Admin Kullanıcı',
      email: 'admin@local',
      pass: '1234',
      role: 'admin',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    saveUsers(after);
  }
})();

// -------------------- Oturum API --------------------
export function currentUser() {
  return apiGetCurrentUser();
}
export function isAuthenticated() {
  return !!apiGetCurrentUser();
}

// -------------------- Auth İşlemleri --------------------
export function login(email, password) {
  const e = normalizeEmail(email);
  const p = String(password ?? '');

  // Havuz: yalnızca publicUsers.v1 (migrasyon zaten üstte yapıldı)
  const users = Array.isArray(getUsers()) ? getUsers() : [];
  const user = users.find(u =>
    normalizeEmail(u.email) === e &&
    String(u.pass ?? u.password ?? '') === p
  );

  if (!user) {
    throw new Error('Geçersiz e-posta veya şifre.');
  }
  // İstersen yayın kontrolü:
  // if (user.published === false) throw new Error('Hesabınız henüz yayınlanmamış.');

  apiSetCurrentUser({
    id: user.id,
    email: normalizeEmail(user.email),
    fullName: user.fullName,
    role: String(user.role || 'agent').toLowerCase(),
  });
  return true;
}

export function logout() {
  apiSetCurrentUser(null); // data.js tarafı auth:changed yayar
}

export function register({ fullName, email, password, role = 'agent', published = false }) {
  const e = normalizeEmail(email);
  const users = Array.isArray(getUsers()) ? getUsers() : [];
  if (users.some(u => normalizeEmail(u.email) === e)) {
    throw new Error('Bu e-posta zaten kayıtlı.');
  }

  const nu = {
    id: newId('u'),
    fullName: String(fullName || '').trim(),
    email: e,
    pass: String(password || ''),
    role: String(role || 'agent').toLowerCase(),
    published: !!published,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  users.push(nu);
  saveUsers(users);

  // (Opsiyonel) otomatik giriş
  // apiSetCurrentUser({ id: nu.id, email: nu.email, fullName: nu.fullName, role: nu.role });

  return { id: nu.id, email: nu.email, fullName: nu.fullName, role: nu.role, published: nu.published };
}

// -------------------- Debug (opsiyonel) --------------------
window.__debugAuth = function () {
  try {
    console.log('AUTH currentUser()', apiGetCurrentUser());
    console.log('USERS (count):', Array.isArray(getUsers()) ? getUsers().length : 0);
  } catch (e) {
    console.warn('__debugAuth error:', e);
  }
};
