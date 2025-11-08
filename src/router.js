// /src/router.js
import Home, { mountHome } from './components/Home.js';
import Listings, { mountListings } from './components/Listings.js';
import ListingDetail, { mountListingDetail } from './components/ListingDetail.js';
import Admin from './components/Admin.js';
import Agents from './components/Agents.js';

const viewEl = () => document.getElementById('view');

const routes = [
  { pattern: /^#\/?$|^#\/home$/, render: () => ({ html: Home(), mount: mountHome }) },
  { pattern: /^#\/listings$/, render: () => ({ html: Listings(), mount: mountListings }) },
  { pattern: /^#\/listing\/(?<id>[^\/]+)$/, render: (p) => ({ html: ListingDetail(p.id), mount: (root)=>mountListingDetail?.(p.id, root) }) },
  { pattern: /^#\/agents$/, render: () => ({ html: Agents() }) },
  { pattern: /^#\/admin$/, render: () => ({ html: Admin() }) },
];

function matchRoute(hash) {
  for (const r of routes) {
    const m = hash.match(r.pattern);
    if (m) return { route: r, params: (m.groups||{}) };
  }
  return null;
}

export function renderRoute() {
  const m = matchRoute(location.hash || '#/');
  const { route, params } = m || {};
  const { html, mount } = route ? route.render(params) : { html: '<p>Not Found</p>' };

  const host = viewEl();
  if (!host) return;
  host.innerHTML = html;

  // Opsiyonel mount
  try { mount?.(host); } catch (e) { console.warn('mount error:', e); }
}

export function initRouter() {
  window.addEventListener('hashchange', renderRoute);
  document.addEventListener('DOMContentLoaded', renderRoute);
  renderRoute();
}
