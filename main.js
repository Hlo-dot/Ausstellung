/* =============== Einstellungen =============== */

// Interne Künstlerseite als HTML in deinem Repo (empfohlen für Modal) …
const ARTIST_INTERNAL = "artist.html";        // wenn vorhanden
// … oder externe Seite (öffnet im neuen Tab)
const ARTIST_EXTERNAL = "https://www.flu.ruhr/uber";

// Video (Meine Arbeitsweise) – YouTube-ID
const VIDEO_ID = "_Yg0ta6Lk9w";

// PDF.js-Viewer
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";

/* =============== Utilities =============== */
const $       = sel => document.querySelector(sel);
const qs      = new URLSearchParams(location.search);
const workId  = (qs.get("id") || "").trim();

const modal   = $("#modal");
const dlgBody = $("#dlg-body");
const dlgTtl  = $("#dlg-title");
const btnOpen = $("#dlg-open-new");
const btnClose= $("#dlg-close");

function openModal(title, innerHtml, fallbackUrl) {
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML = innerHtml;
  modal.classList.add("open");

  // Fallback-Button (z.B. externe Seiten oder direkter PDF-Link)
  if (fallbackUrl) {
    btnOpen.style.display = "inline-flex";
    btnOpen.onclick = () => window.open(fallbackUrl, "_blank", "noopener");
  } else {
    btnOpen.style.display = "none";
    btnOpen.onclick = null;
  }
}

function closeModal() {
  dlgBody.innerHTML = "";
  modal.classList.remove("open");
}

/* =============== Daten laden =============== */
async function loadWorks() {
  const res = await fetch("works.json", { cache: "no-store" });
  if (!res.ok) throw new Error("works.json nicht gefunden");
  return res.json();
}

/* =============== Rendering =============== */
function render(work) {
  // Kopfzeilen
  $("#title").textContent = work.venue || "Ausstellungsort";
  $("#sub").textContent   = work.exhibition
    ? `${work.exhibition} · ${work.date || ""}`.trim()
    : (work.date || "Titel · Datum");
  $("#h2").textContent    = (work.werk && work.serie)
    ? `${work.w
