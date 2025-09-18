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
    ? `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`
    : (work.werk || "Werk + Serie");

  // AUDIO (im Modal, startet nach Klick)
  $("#btn-audio").onclick = () => {
    const html = `
      <div class="audio-wrap">
        <audio controls autoplay>
          <source src="${work.audio}" type="audio/mpeg">
          Ihr Browser unterstützt den Audioplayer nicht.
        </audio>
      </div>`;
    openModal("Audiobeschreibung", html, null);
  };

  // PDF (PDF.js im Modal + Fallback)
  $("#btn-pdf").onclick = () => {
    const viewerUrl = `${PDF_VIEWER}?file=${encodeURIComponent(work.pdf)}#zoom=page-width`;
    const html = `<iframe class="pdf-frame" src="${viewerUrl}" allow="fullscreen"></iframe>`;
    openModal("PDF", html, work.pdf);
  };

  // Meine Arbeitsweise (YouTube, Autoplay nach Klick)
  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe class="web-frame"
                      src="${url}"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  // Info Künstler
  $("#btn-artist").onclick = () => {
    if (ARTIST_INTERNAL) {
      // interne Datei im Modal
      const html = `<iframe class="web-frame" src="${ARTIST_INTERNAL}"></iframe>`;
      openModal("Über den Künstler", html, ARTIST_EXTERNAL || ARTIST_INTERNAL);
    } else {
      // externe Seite direkt im neuen Tab (iFrame wäre von fremder Domain geblockt)
      window.open(ARTIST_EXTERNAL, "_blank", "noopener");
    }
  };
}

/* =============== Init =============== */
(function init(){
  // Modal-Bedienung
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  loadWorks()
    .then(works => {
      const work = works.find(w => (w.id || "").toLowerCase() === workId.toLowerCase());
      if (!work) throw new Error("Werk nicht gefunden");
      render(work);
    })
    .catch(err => {
      console.error(err);
      $("#title").textContent = "Fehler beim Laden der Daten.";
      $("#sub").textContent   = "";
      $("#h2").textContent    = "";
    });
})();
