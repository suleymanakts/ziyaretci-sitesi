// /src/auth.js
// Oturum & giriş – toleranslı okuma (pass | password), iki kaynaktan (publicUsers.v1 | et_users)

import { getCurrentUser as apiGetCurrentUser, setCurrentUser as apiSetCurrentUser } from '@/api/data.js';

const AUTH_KEY  = 'publicAuth.v1';
const USERS_KEY = 'publicUsers.v1';

// --- yardımcılar ---
function readJSON(key, fb){ try { return JSON.parse(localStorage.getItem(key) || ''); } catch { return fb; } }
function writeJSON(key, val){ localStorage.setItem(key, JSON.stringify(val)); }
function emit(ev){ try{ window.dispatchEvent(new Event(ev)); } catch{} }

function normalizeEmail(s){ return String(s || '').trim().toLowerCase(); }

// et_users → publicUsers.v1 birleştirme (login öncesi garanti altına al)
(function migrateUsersOnce(){
  const pub = readJSON(USERS_KEY, []);
  const etc = readJSON('et_users', []);
  if (Array.isArray(etc) && etc.length) {
    const emails = new Set(pub.map(u => normalizeEmail(u.email)));
    const incoming = etc
      .map(u => ({
        id:            u.id || u.userId || 'u'+Date.now()+Math.random().toString(36).slice(2,6),
        fullName:      String(u.fullName || u.name || u.displayName || '').trim(),
        email:         normalizeEmail(u.email),
        pass:          u.pass ?? u.password ?? '',
        role:          String(u.role || u.userRole || 'agent').toLowerCase(),
        phone:         String(u.phone || u.mobile || '').trim(),
        address:       String(u.address || '').trim(),
        tcNo:          String(u.tcNo || '').trim(),
        mykNo:         String(u.mykNo || '').trim(),
        subRole:       String(u.subRole || '').trim(),
        photo:         u.photo || u.avatar || '',
        published:     isPublished(u.published),
        createdAt:     u.createdAt || new Date().toISOString(),
        updatedAt:     new Date().toISOString(),
      }))
      .filter(u => u.email && !emails.has(u.email));

    if (incoming.length){
      const merged = [...pub, ...incoming];
      writeJSON(USERS_KEY, merged);
    }
  }

  // En az bir admin garantisi
  const after = readJSON(USERS_KEY, []);
  const hasAdmin = after.some(u => String(u.role).toLowerCase() === 'admin');
  if (!hasAdmin){
    after.push({
      id:'u_admin_seed',
      fullName:'Admin Kullanıcı',
      email:'admin@local',
      pass:'1234',
      role:'admin',
      published:false,
      createdAt:new Date().toISOString(),
      updatedAt:new Date().toISOString(),
    });
    writeJSON(USERS_KEY, after);
  }
})();

function isPublished(v){
  if (v === true) return true;
  const s = String(v).toLowerCase().trim();
  return s === 'true' || s === 'on' || s === '1' || s === 'yes';
}

// --- dış API uyumu ---
export function currentUser(){
  // data.js versiyonunu kullan
  return apiGetCurrentUser();
}
export function isAuthenticated(){
  return !!currentUser();
}

export function login(email, password){
  const e = normalizeEmail(email);
  const p = String(password);

  const users = readJSON(USERS_KEY, []);
  // et_users yedeğinden de tara (ihtiyaten)
  const others = readJSON('et_users', []);
  const pool = Array.isArray(others) && others.length
    ? [...users, ...others.map(x=>({ ...x, email: normalizeEmail(x.email) }))] 
    : users;

  const user = pool.find(u =>
    normalizeEmail(u.email) === e &&
    (String(u.pass ?? u.password ?? '') === p)
  );

  if (!user) {
    throw new Error('Geçersiz e-posta veya şifre.');
  }

  const sessionUser = {
    id: user.id,
    email: normalizeEmail(user.email),
    fullName: user.fullName,
    role: String(user.role || 'agent').toLowerCase(),
  };

  // data.js kanalından yaz (event yayar)
  apiSetCurrentUser(sessionUser);
  return true;
}

export function logout(){
  apiSetCurrentUser(null); // auth:changed event’i yayılır
}

export function register({ fullName, email, password, role='agent' }){
  // Basit kayıt: publicUsers.v1 içine ekle
  const e = normalizeEmail(email);
  const users = readJSON(USERS_KEY, []);
  if (users.some(u => normalizeEmail(u.email) === e)){
    throw new Error('Bu e-posta zaten kayıtlı.');
  }
  const nu = {
    id: 'u' + Date.now().toString(36) + Math.random().toString(36).slice(2,6),
    fullName: String(fullName || '').trim(),
    email: e,
    pass: String(password||''),
    role: String(role||'agent').toLowerCase(),
    published: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  users.push(nu);
  writeJSON(USERS_KEY, users);
  emit('users:changed');
  return { id: nu.id, email: nu.email, fullName: nu.fullName, role: nu.role };
}

// Debug yardımcıları (opsiyonel)
window.__debugAuth = function(){
  console.log('AUTH', currentUser());
  console.log('USERS', (function(){ try{return JSON.parse(localStorage.getItem(USERS_KEY)||'[]')}catch{return[]} })());
};
