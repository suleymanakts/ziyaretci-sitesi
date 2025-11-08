// K5 - router.js (Admin guard fix eklendi)
import Home, { mountHome } from './components/Home.js';
import Listings, { mountListings } from './components/Listings.js';
import ListingDetail, { mountListingDetail } from './components/ListingDetail.js';
import Admin from './components/Admin.js';
import { isAuthenticated } from './auth.js';

const viewEl = () => document.getElementById('view');

const routes = [
  { pattern: /^#\/?$/, render: () => Home(), mount: mountHome },
  { pattern: /^#\/listings$/, render: () => Listings(), mount: mountListings },
  { pattern: /^#\/listing\/([^\/]+)$/, render: (id) => ListingDetail(id), mount: (id, root) => mountListingDetail(id, root) },
  {
    pattern: /^#\/admin$/,
    render: () => {
      if (!isAuthenticated()) { location.hash = '#/login'; return ''; }
      return Admin();
    }
  }
];

export function initRouter() {
  const renderRoute = () => {
    const hash = location.hash || '#/';
    const route = routes.find(r => r.pattern.test(hash));
    const view = viewEl();
    if (!route || !view) return;

    const match = hash.match(route.pattern);
    const args = match ? match.slice(1) : [];

    view.innerHTML = route.render(...args);
    if (typeof route.mount === 'function') route.mount(...args, view);
  };

  window.addEventListener('hashchange', renderRoute);
  window.addEventListener('listings:changed', renderRoute);
  window.addEventListener('auth:changed', renderRoute);
  renderRoute();
}
