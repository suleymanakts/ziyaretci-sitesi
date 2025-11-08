// K5 - format.js (değişmedi)
export function formatPrice(n) {
  if (n == null || isNaN(n)) return '';
  return new Intl.NumberFormat('tr-TR').format(n) + ' ₺';
}

export function esc(s='') {
  return String(s).replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;'
  }[m]));
}
