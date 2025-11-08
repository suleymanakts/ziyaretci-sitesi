// /src/router.js
import Home from '@/components/Home.js';
import Listings, { mountListings } from '@/components/Listings.js';
import ListingDetail from '@/components/ListingDetail.js';
import Admin from '@/components/Admin.js';
import Login from '@/components/Login.js';
import Register from '@/components/Register.js';

// 🔧 Agents modülünü toplu import: named export olsa da olmasa da çalışır
import * as AgentsMod from '@/components/Agents.js';

import { isAuthenticated } from '@/auth.js';

const viewEl = () => document.getElementById('view');

const routeTable = [
  // Ana
  {
    pattern: /^#\/?$|^#\/home$/,
    render: () => ({ html: Home() })
  },

  // Listeleme
  {
    pattern: /^#\/listings$/,
    render: () => ({
      html: Listings(),
      mount: (root) => {
        try { mountListings?.(root); } catch (e) { console.error(e); }
        try { window.__mountListings?.(root); } catch (e) { console.error(e); }
      }
    })
  },

  // Detay
  {
    pattern: /^#\/listing\/(?<id>[^\/]+)$/,
    render: (p) => ({
      html: ListingDetail(p.id),
      mount: (root) => { try { window.__mountDetail?.(root, p.id); } catch (e) { console.error(e); } }
    })
  },

  // Danışmanlar
  {
    pattern: /^#\/agents$/,
    render: () => ({
      // default export varsa kullan
      html: typeof AgentsMod.default === 'function'
        ? AgentsMod.default()
        : `<section class="container-narrow mx-auto"><h1 class="text-2xl font-semibold mb-4">Danışmanlar</h1><p class="text-gray-600">AgentsMod.default bulunamadı.</p></section>`,
      mount: (root) => {
        // varsa named export'u çağır, yoksa global fallback
        try { AgentsMod.mountAgents?.(root); } catch (e) { console.error(e); }
        try { window.__mountAgents?.(root); } catch (e) { console.error(e); }
      }
    })
  },

  // Admin (korumalı)
  {
    pattern: /^#\/admin$/,
    render: () => {
      if (!isAuthenticated()) {
        return {
          html: Login({ redirect: '#/admin' }),
          mount: (root) => { try { window.__mountLogin?.(root, { redirect: '#/admin' }); } catch (e) { console.error(e); } }
        };
      }
      // ⚠️ Admin kendi içinde bağlanıyor; burada ekstra mount yok
      return {
        html: Admin(),
        mount: () => {}
      };
    }
  },

  // Login
  {
    pattern: /^#\/login(?:\?redirect=(?<to>.*))?$/,
    render: (p) => {
      const redirect = p.to ? decodeURIComponent(p.to) : '#/';
      return {
        html: Login({ redirect }),
        mount: (root) => { try { window.__mountLogin?.(root, { redirect }); } catch (e) { console.error(e); } }
      };
    }
  },

  // Register
  {
    pattern: /^#\/register(?:\?redirect=(?<to>.*))?$/,
    render: (p) => {
      const redirect = p.to ? decodeURIComponent(p.to) : '#/';
      return {
        html: Register({ redirect }),
        mount: (root) => { try { window.__mountRegister?.(root, { redirect }); } catch (e) { console.error(e); } }
      };
    }
  },
];

// RENDER
export function renderRoute() {
  const view = viewEl();
  if (!view) return;

  const hash = window.location.hash || '#/';

  for (const r of routeTable) {
    const m = hash.match(r.pattern);
    if (!m) continue;

    const params = m.groups || {};
    const out = r.render(params);
    const html = typeof out === 'string' ? out : (out?.html || '');

    view.innerHTML = `<div class="container mx-auto container-narrow px-4 py-6">${html}</div>`;

    if (out && typeof out.mount === 'function') {
      try { out.mount(view); } catch (e) { console.error(e); }
    }
    return;
  }

  // 404
  view.innerHTML = `
    <div class="container mx-auto container-narrow px-4 py-12 text-center">
      <h1 class="text-2xl font-semibold mb-2">Bulunamadı</h1>
      <a href="#/listings" class="inline-flex px-4 py-2 rounded-lg bg-brand text-white">Listeye dön</a>
    </div>`;
}

// BOOT
export function initRouter() {
  window.addEventListener('hashchange', renderRoute, { passive: true });
  renderRoute();
}

// Programatik gezinme
export function navigateTo(hash) {
  if (!hash.startsWith('#')) window.location.hash = '#' + hash.replace(/^\//, '');
  else window.location.hash = hash;
}
