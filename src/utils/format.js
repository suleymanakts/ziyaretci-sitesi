// /src/utils/format.js
export function formatPrice(v) {
  try { return new Intl.NumberFormat('tr-TR').format(Number(v)) + ' ₺'; }
  catch { return String(v); }
}
export function slugify(s='') {
  return String(s).toLowerCase().trim()
    .replace(/ç/g,'c').replace(/ğ/g,'g').replace(/ı/g,'i').replace(/ö/g,'o').replace(/ş/g,'s').replace(/ü/g,'u')
    .replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'');
}
export function truncate(s='', n=120) {
  const str = String(s);
  return str.length>n ? str.slice(0,n-1)+'…' : str;
}
