/* =============== Einstellungen =============== */

// Künstler-Website (kann intern oder extern sein)
const ARTIST_WEBSITE = "https://flu.ruhr/uber";   // z.B. "/artist.html" (intern) ODER externe URL
// Video (Meine Arbeitsweise)
const VIDEO_ID = "_Yg0ta6Lk9w";                   // YouTube-ID
// PDF-Viewer (interner PDF.js-Viewer; bleibt wie gehabt)
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html"; // oder deine gehostete viewer.html

/* =============== Utilities =============== */

const $       = sel => document.querySelector(sel);
const qs      = new URLSearchParams(location.search);
const workId  = (qs.get("id") || "").trim();

const modal   = $("#modal");
const dlgBody = $("#dlg-body");
const dlgTtl  = $("#dlg-title");
const btnOpen = $("#dlg-open-new");   // Fallback-Button
const btnClose= $("#dlg-close");

function openModal(title, innerHtml, fallbackUrl) {
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML = innerHtml;
  modal.classList.add("open");

  // Fallback: wenn iframe nicht lädt (z.B. X-Frame-Options), automatisch neuen Tab öffnen
  const iframe = dlgBody.querySelector("iframe");
  if (iframe && fallbackUrl) {
    let loaded = false;
    iframe.addEventListener("load", () => { loaded = true; }, { once: true });
    setTimeout(() => {
      if (!loaded) {
        modal.classList.remove("open"); // Modal schließen
        window.open(fallbackUrl, "_blank", "noopener");
      }
    }, 1500);
  }

  // „In neuem Tab öffnen“-Button zeigen, wenn fallbackUrl übergeben wurde
  if (fallbackUrl) {
    btnOpen.style.display = "inline-flex";
    btnOpen.onclick = () => window.open(fallbackUrl, "_blank", "noopener");
  } else {
    btnOpen.style.display = "none";
  }
}

function closeModal() {
  dlgBody.innerHTML = "";
  modal.classList.remove("open");
}

/* =============== Daten laden (works.json) =============== */

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
    : "Titel · Datum";
  $("#h2").textContent = work.werk && work.serie
    ? `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`
    : (work.werk || "Werk + Serie");

  // Audio
  $("#btn-audio").onclick = () => {
    const audioHtml = `
      <audio controls autoplay style="width:100%;height:52px;">
        <source src="${work.audio}" type="audio/mpeg">
        Ihr Browser unterstützt den Audioplayer nicht.
      </audio>
    `;
    openModal("Audiobeschreibung", audioHtml, null); // Audio im Modal, kein Fallback
  };

  // PDF (Modal + Fallback-Button)
  $("#btn-pdf").onclick = () => {
    const viewerUrl = `${PDF_VIEWER}?file=${encodeURIComponent(work.pdf)}#zoom=page-width`;
    const html = `<iframe class="pdfjs-frame" src="${viewerUrl}" allow="fullscreen" referrerpolicy="no-referrer"></iframe>`;
    openModal("PDF", html, work.pdf);
  };

  // Meine Arbeitsweise (YouTube, Autoplay mit Klick)
  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe class="video-frame"
                      src="${url}"
                      allow="autoplay; encrypted-media; picture-in-picture"
                      allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  // Info Künstler (Auto-Erkennung: intern im Modal, extern im neuen Tab)
  $("#btn-artist").onclick = () => {
    const url = ARTIST_WEBSITE;
    // gleiche Origin?
    const isSameOrigin = (() => {
      try { return new URL(url, location.href).origin === location.origin; }
      catch { return false; }
    })();

    if (isSameOrigin) {
      // im Modal laden + Fallback, falls doch blockiert
      const html = `<iframe class="video-frame" src="${url}" referrerpolicy="no-referrer"
                         allow="autoplay; encrypted-media"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      // extern: direkt in neuem Tab (Modal würde wegen X-Frame-Options/CSP blocken)
      window.open(url, "_blank", "noopener");
    }
  };
}

/* =============== Init =============== */

(async function init() {
  // Modal-Buttons
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  try {
    const works = await loadWorks();
    const work = works.find(w => (w.id || "").toLowerCase() === workId.toLowerCase());
    if (!work) throw new Error("Werk nicht gefunden");
    render(work);
  } catch (e) {
    console.error(e);
    $("#title").textContent = "Fehler beim Laden der Daten.";
  }
})();
