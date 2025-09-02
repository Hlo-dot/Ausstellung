// werke.js
window.WERKE = null;

async function loadWerke() {
  const res = await fetch('werke.json', { cache: 'no-store' });
  if (!res.ok) throw new Error('werke.json nicht gefunden');
  window.WERKE = await res.json();
  document.dispatchEvent(new Event('werke:ready'));
}
loadWerke();
