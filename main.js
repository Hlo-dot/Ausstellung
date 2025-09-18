/* =============== Einstellungen =============== */

// Externe/Interne Zielseiten
const ARTIST_WEBSITE = "https://flu.ruhr/uber";   // Extern = neuer Tab; intern (z.B. "/artist.html") = Modal
const VIDEO_ID       = "_Yg0ta6Lk9w";             // YouTube-ID
const PDF_VIEWER     = "https://mozilla.github.io/pdf.js/web/viewer.html";

/* =============== Helpers =============== */
const $  = (sel) => document.querySelector(sel);
const qs = new URLSearchParams(location.search);
const workId = (qs.get("id") || "").trim();

const modal   = $("#modal");
const dlgBody = $("#dlg-body");
const dlgTtl  = $("#dlg-title");
const btnOpen = $("#dlg-open-new");
const btnClose= $("#dlg-close");

function openModal(title, innerHtml, fallbackUrl) {
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML  = innerHtml;
  modal.classList.add("open");

  // „In neuem Tab öffnen“ (Fallback) sichtbar, wenn URL vorhanden
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

// prüft, ob URL gleiche Origin hat
function isSameOrigin(url) {
  try { return new URL(url, location.href).origin === location.origin; }
  catch { return false; }
}

/* =============== Daten laden =============== */
async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fehler beim Laden von ${path}`);
  return res.json();
}

/* =============== Rendering =============== */
function render(work, exhibitionMeta) {
  // Kopf
  if (exhibitionMeta) {
    $("#title").textContent = exhibitionMeta.venue || "Ausstellungsort";
    const date = (exhibitionMeta.start && exhibitionMeta.end)
        ? `${exhibitionMeta.start.replaceAll("-", ".")} — ${exhibitionMeta.end.replaceAll("-", ".")}`
        : (exhibitionMeta.date || "");
    $("#sub").textContent = exhibitionMeta.title
        ? `${exhibitionMeta.title} · ${date}`.trim()
        : (date || "Titel · Datum");
  } else {
    $("#title").textContent = "Ausstellungsort";
    $("#sub").textContent   = "Titel · Datum";
  }

  $("#h2").textContent = (work.werk && work.serie)
    ? `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`
    : (work.werk || "Werk + Serie");

  /* Buttons */
  // Audio im Modal
  $("#btn-audio").onclick = () => {
    const html = `
      <audio controls autoplay>
        <source src="${work.audio}" type="audio/mpeg">
        Ihr Browser unterstützt das Audio-Element nicht.
      </audio>`;
    openModal("Audiobeschreibung", html, null);
  };

  // PDF im Modal + Fallback
  $("#btn-pdf").onclick = () => {
    const viewerUrl = `${PDF_VIEWER}?file=${encodeURIComponent(work.pdf)}#zoom=page-width`;
    const html = `<iframe src="${viewerUrl}" referrerpolicy="no-referrer" allow="fullscreen"></iframe>`;
    openModal("PDF", html, work.pdf);
  };

  // Meine Arbeitsweise (YouTube embed), Autoplay nach Klick
  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe src="${url}" allow="autoplay; encrypted-media; picture-in-picture" allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  // Info Künstler: intern → Modal, extern → neuer Tab
  $("#btn-artist").onclick = () => {
    const url = ARTIST_WEBSITE;
    if (isSameOrigin(url)) {
      const html = `<iframe src="${url}" referrerpolicy="no-referrer"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      window.open(url, "_blank", "noopener"); // kein Modal für externe Hosts (X-Frame-Options/CSP)
    }
  };
}

/* =============== Init =============== */
(async function init() {
  // Modal-UX
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  try {
    // 1) Werk-Daten
    const works = await fetchJSON("works.json");
    const work  = works.find(w => (w.id || "").toLowerCase() === workId.toLowerCase());
    if (!work) throw new Error("Werk nicht gefunden");

    // 2) Ausstellungs-Meta: finde Ausstellung, die dieses Werk enthält
    let expo = null;
    try {
      const exhibitions = await fetchJSON("exhibitions.json");
      expo = (exhibitions || []).find(x =>
        Array.isArray(x.works) && x.works.some(id => (id || "").toLowerCase() === workId.toLowerCase())
      ) || null;
    } catch { /* ok – optional */ }

    render(work, expo);
  } catch (err) {
    console.error(err);
    $("#title").textContent = "Fehler beim Laden der Daten.";
  }
})();
