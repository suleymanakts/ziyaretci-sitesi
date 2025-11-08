// /src/permissions.js
// Basit RBAC: can / canAny / hasRole / roleTitle named export'ları SAĞLANIR.
// Ekler: canAll, listPerms (opsiyonel yardımcılar). User.perms ile özelleştirme desteklenir.

const ROLE_PERMS = Object.freeze({
  admin: Object.freeze([
    // listings
    'listings:read:all', 'listings:write:all',
    'approvals:publish', 'listings:route',
    'listings:delete:all', 'listings:archive:view',
    // users & org
    'users:read', 'users:write',
    // reports & settings
    'reports:view:all', 'settings:write',
  ]),

  broker: Object.freeze([
    'listings:read:all', 'listings:write:all',
    'approvals:publish', 'listings:route',
    'listings:delete:all', 'listings:archive:view',
    'users:read', 'users:write',
    'reports:view:all',
  ]),

  director: Object.freeze([
    'listings:read:all',
    'approvals:publish', 'listings:route',
    'listings:archive:view',
    'users:read',
    'reports:view:all',
  ]),

  agent: Object.freeze([
    'listings:read:own', 'listings:write:own',
    'reports:view:own',
  ]),

  assistant: Object.freeze([
    'listings:read:own', 'listings:write:own',
  ]),

  client: Object.freeze([
    // public kullanıcı – izin yok
  ]),
});

// ---- helpers ----
function normRole(u) {
  return String(u?.role || 'client').toLowerCase();
}
function normPerms(arr) {
  if (!arr) return [];
  try { return Array.from(new Set(arr.map(p => String(p).trim()))); } catch { return []; }
}
function rolePerms(role) {
  return ROLE_PERMS[role] || ROLE_PERMS.client;
}
function userExtraPerms(user) {
  // İsteğe bağlı: user.perms ile role tabanına ek özel izinler
  const extra = Array.isArray(user?.perms) ? user.perms : [];
  return normPerms(extra);
}

export function hasRole(user, roleOrList) {
  const r = normRole(user);
  if (Array.isArray(roleOrList)) {
    return roleOrList.map(String).map(x => x.toLowerCase()).includes(r);
  }
  return r === String(roleOrList || '').toLowerCase();
}

export function can(user, perm) {
  const r = normRole(user);
  const base = rolePerms(r);
  const extra = userExtraPerms(user);
  return base.includes(perm) || extra.includes(perm);
}

export function canAny(user, permList = []) {
  const list = normPerms(permList);
  if (!list.length) return false;
  return list.some(p => can(user, p));
}

// Opsiyonel: tüm izinlere sahip mi?
export function canAll(user, permList = []) {
  const list = normPerms(permList);
  if (!list.length) return false;
  return list.every(p => can(user, p));
}

export function roleTitle(role) {
  const map = {
    admin: 'Admin',
    broker: 'Broker',
    director: 'Direktör',
    agent: 'Danışman',
    assistant: 'Asistan',
    client: 'Kullanıcı',
  };
  return map[String(role || '').toLowerCase()] || 'Kullanıcı';
}

// Görsel/Debug amaçlı tüm efektif izinleri döndür
export function listPerms(user) {
  const r = normRole(user);
  const base = rolePerms(r);
  const extra = userExtraPerms(user);
  return Array.from(new Set([...base, ...extra]));
}

// Küçük debug yardımcısı (isteğe bağlı)
if (typeof window !== 'undefined') {
  window.__debugPerms = function (user) {
    const role = normRole(user);
    console.log('role:', role, 'perms:', listPerms(user));
  };
}
