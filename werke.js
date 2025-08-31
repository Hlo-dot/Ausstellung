// Dynamische Werksdaten (automatisch geladen)
async function loadWerke() {
  const response = await fetch("werke.json");
  if (!response.ok) throw new Error("Daten konnten nicht geladen werden.");
  window.WERKE = await response.json();
}
loadWerke();