const pathMatch = location.pathname.match(/^\/work\/([^\/?#]+)/i);
const idFromPath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
const qs = new URLSearchParams(location.search);
const workId = (qs.get("id") || idFromPath || "").trim();
const perspectiveEl = document.querySelector("#work-perspective");

function findExhibitionForWork(exhibitions, wId) {
  if (!Array.isArray(exhibitions) || !wId) return null;

  const inCurrent = exhibitions.find(ex =>
    ex.current && Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === wId.toLowerCase())
  );
  if (inCurrent) return inCurrent;

  return exhibitions.find(ex =>
    Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === wId.toLowerCase())
  ) || null;
}

function findPerspective(exhibition, wId) {
  if (!exhibition?.perspectives || !wId) return "";
  const match = Object.entries(exhibition.perspectives)
    .find(([id]) => id.toLowerCase() === wId.toLowerCase());
  return match ? String(match[1] || "").trim() : "";
}

(async function renderPerspective() {
  if (!perspectiveEl || !workId) return;

  try {
    const res = await fetch("/exhibitions.json", { cache: "no-store" });
    if (!res.ok) return;
    const exhibitions = await res.json();
    const exhibition = findExhibitionForWork(exhibitions, workId);
    const perspective = findPerspective(exhibition, workId);

    if (!perspective) return;
    perspectiveEl.textContent = `Perspektive · ${perspective}`;
    perspectiveEl.hidden = false;
  } catch (err) {
    console.error("Perspektive konnte nicht geladen werden", err);
  }
})();
