// /src/permissions.js
// Basit RBAC: can / canAny / hasRole / roleTitle named export'ları SAĞLANIR.

const ROLE_PERMS = {
  admin: [
    // listings
    'listings:read:all', 'listings:write:all',
    'approvals:publish', 'listings:route',
    'listings:delete:all', 'listings:archive:view',
    // users & org
    'users:read', 'users:write',
    // reports & settings
    'reports:view:all', 'settings:write',
  ],

  broker: [
    'listings:read:all', 'listings:write:all',
    'approvals:publish', 'listings:route',
    'listings:delete:all', 'listings:archive:view',
    'users:read', 'users:write',
    'reports:view:all',
  ],

  director: [
    'listings:read:all',
    'approvals:publish', 'listings:route',
    'listings:archive:view',
    'users:read',
    'reports:view:all',
  ],

  agent: [
    'listings:read:own', 'listings:write:own',
    'reports:view:own',
  ],

  assistant: [
    'listings:read:own', 'listings:write:own',
  ],

  client: [
    // public kullanıcı
  ],
};

// --- helpers ---
export function hasRole(user, roleOrList) {
  const role = (user?.role || 'client').toLowerCase();
  if (Array.isArray(roleOrList)) {
    return roleOrList.map(String).map(r => r.toLowerCase()).includes(role);
  }
  return role === String(roleOrList || '').toLowerCase();
}

export function can(user, perm) {
  const role = (user?.role || 'client').toLowerCase();
  const list = ROLE_PERMS[role] || [];
  return list.includes(perm);
}

export function canAny(user, permList = []) {
  const role = (user?.role || 'client').toLowerCase();
  const list = ROLE_PERMS[role] || [];
  return permList.some(p => list.includes(p));
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

// Küçük debug yardımcısı (isteğe bağlı)
window.__debugPerms = function (user) {
  const role = (user?.role || 'client').toLowerCase();
  console.log('role:', role, 'perms:', ROLE_PERMS[role] || []);
};
