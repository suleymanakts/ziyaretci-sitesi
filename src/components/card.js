// K5 - Card.js (değişmedi)
export default function Card(item) {
  const price = item.price ? new Intl.NumberFormat('tr-TR').format(item.price) + ' ₺' : '';
  const cover = (item.photos && item.photos[ item.coverIndex || 0 ]) || '';
  return `
    <a href="#/listing/${item.id}" class="block border rounded-xl overflow-hidden bg-white hover:shadow">
      ${cover ? `<img class="w-full h-40 object-cover" src="${cover}" alt="">` : ''}
      <div class="p-3">
        <div class="font-semibold truncate">${item.title || '(Başlık yok)'}</div>
        ${price ? `<div class="mt-1 font-medium">${price}</div>` : ''}
      </div>
    </a>
  `;
}
