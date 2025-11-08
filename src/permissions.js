// K5 - permissions.js (değişmedi)
const roleMatrix = {
  admin:     ['listings:all','users:all','reports:all'],
  broker:    ['listings:all','users:read','reports:office'],
  director:  ['listings:office','users:read','reports:office'],
  assistant: ['listings:own','users:read'],
  agent:     ['listings:own'],
  user:      []
};

export function can(role, perm) {
  role = String(role||'user').toLowerCase();
  const list = roleMatrix[role] || [];
  return list.includes(perm);
}
export function rolePerms(role) {
  role = String(role||'user').toLowerCase();
  return roleMatrix[role] || [];
}
