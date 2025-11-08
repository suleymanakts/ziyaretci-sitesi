// utils/format.js
// Fiyat ve basit yardımcılar

export function formatPrice(value, { currency='TRY', maxFrac=0 } = {}) {
  const n = typeof value === 'string' ? Number(value.replace(/[^\d.,-]/g, '').replace(',', '.')) : Number(value);
  if (!isFinite(n)) return '';
  try {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency,
      maximumFractionDigits: maxFrac
    }).format(n);
  } catch {
    // Eski tarayıcı / Intl hatası için geri dönüş
    return `${n.toLocaleString('tr-TR', { maximumFractionDigits: maxFrac })} ${currency}`;
  }
}

export function formatCompact(value) {
  const n = Number(value);
  if (!isFinite(n)) return '';
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return (n / 1_000_000).toFixed(1).replace('.', ',') + 'M';
  if (abs >= 1_000)     return (n / 1_000).toFixed(1).replace('.', ',') + 'k';
  return n.toLocaleString('tr-TR');
}

export function esc(str = '') {
  return String(str).replace(/[&<>"']/g, (m) => ({
    '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
  }[m]));
}
