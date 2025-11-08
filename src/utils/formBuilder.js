// /src/utils/formBuilder.js
export async function loadSchema() {
  const res = await fetch('/src/api/schema.json');
  if (!res.ok) throw new Error('schema.json yüklenemedi');
  return await res.json();
}

export function buildSelect(name, label, options, value = '') {
  const opts = options.map(o => {
    const v = typeof o === 'string' ? o : o.value;
    const t = typeof o === 'string' ? o : (o.label || o.value);
    const sel = (String(v) === String(value)) ? 'selected' : '';
    return `<option value="${escapeHtml(v)}" ${sel}>${escapeHtml(t)}</option>`;
  }).join('');
  return `
  <label class="text-xs text-slate-600">${escapeHtml(label)}</label>
  <select name="${escapeHtml(name)}" class="px-3 py-2 rounded border w-full">${opts}</select>`;
}

export function buildInput(field) {
  const { name, type, label } = field;
  if (type === 'boolean') {
    return `
    <label class="inline-flex items-center gap-2">
      <input type="checkbox" name="${escapeHtml(name)}" class="scale-110">
      <span class="text-sm">${escapeHtml(label)}</span>
    </label>`;
  }
  const inputType = (type === 'number') ? 'number' : 'text';
  return `
  <label class="text-xs text-slate-600">${escapeHtml(label)}</label>
  <input name="${escapeHtml(name)}" type="${inputType}" class="px-3 py-2 rounded border w-full">`;
}

export function escapeHtml(s = '') {
  return String(s).replace(/[&<>"']/g, m => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;' }[m]));
}
