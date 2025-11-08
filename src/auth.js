// /src/auth.js
// Oturum & giriş – toleranslı okuma (pass | password), iki kaynaktan (publicUsers.v1 | et_users)
// Session yönetimi data.js üzerinden (tek event kaynağı)

import {
  getCurrentUser as apiGetCurrentUser,
  setCurrentUser as apiSetCurrentUser,
} from '@/api/data.js';

const AUTH_KEY  = 'publicAuth.v1';     // (şimdilik kullanılmıyor; geçmiş uyum için tutuluyor)
const USERS_KEY = 'publicUsers.v1';

// -------------------- küçük yardımcılar --------------------
function readJSON(key, fb) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fb;
    return JSON.parse(raw);
  } catch {
    return fb;
  }
}
function writeJSON(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}
function emit(ev) {
  try { window.dispatchEvent(new Event(ev)); } catch {}
}
function normalizeEmail(s) { return String(s || '').trim().toLowerCase(); }
function isPublished(v) {
  if (v === true) return true;
  const s = String(v).toLowerCase().trim();
  return s === 'true' || s === 'on' || s === '1' || s === 'yes';
}

// -------------------- migrate: et_users → publicUsers.v1 --------------------
(function migrateUsersOnce() {
  const pub = readJSON(USERS_KEY, []);
  const etc = readJSON('et_users', []);

  if (Array.isArray(etc) && etc.length) {
    const emails = new Set(pub.map(u => normalizeEmail(u.email)));
    const incoming = etc
      .map(u => ({
        id:        u.id || u.userId || ('u' + Date.now() + Math.random().toString(36).slice(2, 6)),
        fullName:  String(u.fullName || u.name || u.displayName || '').trim(),
        email:     normalizeEmail(u.email),
        pass:      u.pass ?? u.password ?? '',
        role:      String(u.role || u.userRole || 'agent').toLowerCase(),
        phone:     String(u.phone || u.mobile || '').trim(),
        address:   String(u.address || '').trim(),
        tcNo:      String(u.tcNo || '').trim(),
        mykNo:     String(u.mykNo || '').trim(),
        subRole:   String(u.subRole || '').trim(),
        photo:     u.photo || u.avatar || '',
        published: isPublished(u.published),
        createdAt: u.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }))
      .filter(u => u.email && !emails.has(u.email));

    if (incoming.length) {
      writeJSON(USERS_KEY, [...pub, ...incoming]);
    }
  }

  // Ana dizi yoksa oluştur
  if (!readJSON(USERS_KEY)) writeJSON(USERS_KEY, []);

  // En az bir admin garantisi
  const after = readJSON(USERS_KEY, []);
  const hasAdmin = after.some(u => String(u.role).toLowerCase() === 'admin');
  if (!hasAdmin) {
    after.push({
      id: 'u_admin_seed',
      fullName: 'Admin Kullanıcı',
      email: 'admin@local',
      pass: '1234',
      role: 'admin',
      published: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    writeJSON(USERS_KEY, after);
  }
})();

// -------------------- dış API --------------------
export function currentUser() {
  // Session data.js tarafından tutuluyor (tek event kaynağı)
  return apiGetCurrentUser();
}
export function isAuthenticated() {
  return !!currentUser();
}

/**
 * Basit login: publicUsers.v1 (ve varsa et_users havuzu) üzerinde e-posta/parola eşleştirir.
 * Not: Şifre hashing yok; mock ortam içindir.
 */
export function login(email, password) {
  const e = normalizeEmail(email);
  const p = String(password ?? '');

  const users = readJSON(USERS_KEY, []);
  const others = readJSON('et_users', []);
  const pool = Array.isArray(others) && others.length
    ? [...users, ...others.map(x => ({ ...x, email: normalizeEmail(x.email) }))]
    : users;

  const user = pool.find(u =>
    normalizeEmail(u.email) === e &&
    String(u.pass ?? u.password ?? '') === p
  );

  if (!user) {
    throw new Error('Geçersiz e-posta veya şifre.');
  }

  // published kontrolünü istersen devreye al:
  // if (user.published === false) throw new Error('Hesabınız henüz yayınlanmamış.');

  const sessionUser = {
    id: user.id,
    email: normalizeEmail(user.email),
    fullName: user.fullName,
    role: String(user.role || 'agent').toLowerCase(),
  };

  // data.js kanalından yaz (auth:changed event yayılır)
  apiSetCurrentUser(sessionUser);
  return true;
}

export function logout() {
  apiSetCurrentUser(null); // auth:changed
}

/**
 * Basit kayıt: publicUsers.v1 içine ekler.
 * Dönüş: kaydedilen minimal profil
 */
export function register({ fullName, email, password, role = 'agent' }) {
  const e = normalizeEmail(email);
  const users = readJSON(USERS_KEY, []);
  if (users.some(u => normalizeEmail(u.email) === e)) {
    throw new Error('Bu e-posta zaten kayıtlı.');
  }
  const nu = {
    id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    fullName: String(fullName || '').trim(),
    email: e,
    pass: String(password || ''),
    role: String(role || 'agent').toLowerCase(),
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(nu);
  writeJSON(USERS_KEY, users);
  emit('users:changed');

  // İstersen otomatik login ekleyebilirsin:
  // apiSetCurrentUser({ id: nu.id, email: nu.email, fullName: nu.fullName, role: nu.role });

  return { id: nu.id, email: nu.email, fullName: nu.fullName, role: nu.role };
}

// Debug yardımcıları (opsiyonel)
window.__debugAuth = function () {
  console.log('AUTH', currentUser());
  try { console.log('USERS', JSON.parse(localStorage.getItem(USERS_KEY) || '[]')); } catch { console.log('USERS []'); }
};
