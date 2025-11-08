// K5-Rescue router
import Home, { mountHome } from './components/Home.js';
import Listings, { mountListings } from './components/Listings.js';
import ListingDetail, { mountListingDetail } from './components/ListingDetail.js';
import Admin from './components/Admin.js';
import Login from './components/Login.js';
import Register from './components/Register.js';
import { isAuthenticated } from './auth.js';

const viewEl = () => document.getElementById('view');

const routes = [
  { pattern: /^#\/?$/, render: () => Home(), mount: (v)=>mountHome?.(v) },
  { pattern: /^#\/home$/, render: () => Home(), mount: (v)=>mountHome?.(v) },
  { pattern: /^#\/listings$/, render: () => Listings(), mount: (v)=>mountListings?.(v) },
  { pattern: /^#\/listing\/([^\/]+)$/, render: (id) => ListingDetail(id), mount: (v,id)=>mountListingDetail?.(id,v) },
  { pattern: /^#\/login(?:\?redirect=(.*))?$/, render: (to) => Login({ redirect: to ? decodeURIComponent(to) : '#/' }) },
  { pattern: /^#\/register(?:\?redirect=(.*))?$/, render: (to) => Register({ redirect: to ? decodeURIComponent(to) : '#/' }) },
  { pattern: /^#\/admin$/, render: () => isAuthenticated() ? Admin() : Login({ redirect: '#/admin' }) }
];

function renderRoute() {
  const host = viewEl();
  if (!host) return;
  const hash = location.hash || '#/';
  const route = routes.find(r => r.pattern.test(hash));
  if (!route) {
    host.innerHTML = `
      <section class="container-narrow mx-auto py-12 text-center">
        <h1 class="text-2xl font-semibold mb-3">Bulunamadı</h1>
        <a href="#/listings" class="px-4 py-2 rounded bg-brand text-white">İlanlara Dön</a>
      </section>`;
    return;
  }
  const m = hash.match(route.pattern);
  const args = m ? m.slice(1) : [];
  const html = route.render(...args);
  host.innerHTML = `<div class="container-narrow px-4 py-6">${html || ''}</div>`;
  try { route.mount?.(host, ...args); } catch (e) { console.error('[mount]', e); }
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute, { passive: true });
  window.addEventListener('listings:changed', renderRoute, { passive: true });
  window.addEventListener('auth:changed', renderRoute, { passive: true });
  renderRoute();
}
