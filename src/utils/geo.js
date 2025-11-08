// K5 - geo.js (değişmedi)
export async function loadTRLocations() {
  const res = await fetch('/data/locations-tr.json');
  return await res.json();
}
