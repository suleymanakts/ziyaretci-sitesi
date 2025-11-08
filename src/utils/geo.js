// /src/utils/geo.js
// Türkiye iller–ilçeler–mahalleler yardımcıları

import LOCATIONS from '@/data/locations-tr.json';

let GEO_CACHE = null;

/**
 * TR lokasyonlarını belleğe alır (tek sefer yüklenir)
 */
export async function loadTRLocations() {
  if (GEO_CACHE) return GEO_CACHE;

  try {
    // JSON local import (Vite dev'de zaten senkron)
    GEO_CACHE = LOCATIONS;

    // İleriye dönük: dış kaynak desteği
    // const res = await fetch('/data/locations-tr.json');
    // GEO_CACHE = await res.json();

    return GEO_CACHE;
  } catch (err) {
    console.error('Lokasyon verisi yüklenemedi:', err);
    GEO_CACHE = {};
    return GEO_CACHE;
  }
}

/**
 * <select> elementine liste doldurur
 */
export function fillSelect(sel, arr, placeholder = 'Seçiniz') {
  if (!sel) return;

  sel.innerHTML = '';

  const o0 = document.createElement('option');
  o0.value = '';
  o0.textContent = placeholder;
  sel.appendChild(o0);

  (arr || []).forEach((v) => {
    if (!v) return;
    const o = document.createElement('option');
    o.value = v;
    o.textContent = v;
    sel.appendChild(o);
  });
}

/**
 * Hızlı erişim: şehir > ilçe > mahalle listesi al
 */
export function getDistricts(province) {
  if (!GEO_CACHE) return [];
  return Object.keys(GEO_CACHE[province] || {});
}

export function getNeighborhoods(province, district) {
  if (!GEO_CACHE) return [];
  return GEO_CACHE[province]?.[district] || [];
}
