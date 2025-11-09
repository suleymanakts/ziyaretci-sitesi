// /src/auth.js
const USERS_KEY = 'publicUsers.v1';
const AUTH_KEY  = 'publicAuth.v1';
import { getUsers, saveUsers, getCurrentUser, setCurrentUser, newId } from '@/api/data.js';

// seed (ilk kurulum)
(function seedUsersOnce(){
  try {
    if (!localStorage.getItem(USERS_KEY)) {
      const users = [
        { id:'u1', fullName:'Admin Kullanıcı',  email:'admin@local',  pass:'1234', role:'admin',  published:true },
        { id:'u2', fullName:'Broker Demo',      email:'broker@local', pass:'1234', role:'broker', published:true },
      ];
      localStorage.setItem(USERS_KEY, JSON.stringify(users));
    }
  } catch (_) {}
})();

export function currentUser() { return getCurrentUser(); }
export function isAuthenticated() { return !!getCurrentUser(); }

export function login(email, password) {
  const users = getUsers();
  const user = users.find(u =>
    String(u.email||'').toLowerCase().trim() === String(email||'').toLowerCase().trim() &&
    String(u.pass||'') === String(password||'')
  );
  if (!user) throw new Error('Geçersiz e-posta veya şifre.');
  setCurrentUser({ id: user.id, email: user.email, fullName: user.fullName, role: user.role });
  return true;
}

export function logout() { setCurrentUser(null); }

export function register({ fullName, email, password, role='agent', published=false }) {
  const users = getUsers();
  const e = String(email).toLowerCase().trim();
  if (users.some(u => String(u.email||'').toLowerCase().trim() === e)) {
    throw new Error('Bu e-posta zaten kayıtlı.');
  }
  const nu = { id: newId('u'), fullName: String(fullName||'').trim(), email: e, pass: String(password), role, published };
  users.push(nu);
  saveUsers(users);
  return { id: nu.id, email: nu.email, fullName: nu.fullName, role: nu.role, published: nu.published };
}

// debug
window.__debugAuth = function(){
  console.log('AUTH', localStorage.getItem(AUTH_KEY));
  console.log('USERS', localStorage.getItem(USERS_KEY));
};
