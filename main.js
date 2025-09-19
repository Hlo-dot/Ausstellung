/* ================== Einstellungen ================== */

// Externe/Interne Künstler-Seite.
// - Wenn gleiche Domain wie deine App: im Modal.
// - Sonst: automatisch in neuem Tab (wegen X-Frame-Options/CSP).
const ARTIST_WEBSITE = "https://flu.ruhr/uber";

// PDF.js Viewer (aktuell ungenutzt; wir öffnen PDFs direkt)
// const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";

// YouTube-Video für „Meine Arbeitsweise“ (startet nach Klick, nicht stumm)
const VIDEO_ID = "_Yg0ta6Lk9w";

/* ================== Utilities ================== */

const $  = (sel) => document.querySelector(sel);
const qs = new URLSearchParams(location.search);
const workId = (qs.get("id") || "").trim();

// Modal-Referenzen (IDs müssen zu index.html passen)
const modal   = $("#modal");
const dlgBody = $("#dlg-body");
const dlgTtl  = $("#dlg-title");
const btnOpen = $("#dlg-open-new");
const btnClose= $("#dlg-close");

function isSameOrigin(url) {
  try { return new URL(url, location.href).origin === location.origin; }
  catch { return false; }
}

async function fetchJSON(path) {
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch fehlgeschlagen: ${path}`);
  return res.json();
}

function openModal(title, innerHtml, fallbackUrl) {
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML  = innerHtml;
  modal.classList.add("open");

  // „In neuem Tab öffnen“-Button ein-/ausblenden
  if (fallbackUrl) {
    btnOpen.style.display = "inline-flex";
    btnOpen.onclick = () => window.open(fallbackUrl, "_blank", "noopener");
  } else {
    btnOpen.style.display = "none";
  }

  // iFrame-Lade-Guard: wenn der Inhalt (z. B. fremde Seite) nicht lädt,
  // schließen wir das Modal wieder und öffnen den Fallback.
  const iframe = dlgBody.querySelector("iframe");
  if (iframe && fallbackUrl) {
    let loaded = false;
    const onLoad = () => { loaded = true; iframe.removeEventListener("load", onLoad); };
    iframe.addEventListener("load", onLoad, { once: true });

    setTimeout(() => {
      if (!loaded) {
        modal.classList.remove("open");
        window.open(fallbackUrl, "_blank", "noopener");
      }
    }, 1500);
  }
}

function closeModal() {
  dlgBody.innerHTML = "";
  modal.classList.remove("open");
}

/* ================== Daten-Merge ================== */

/**
 * Wir laden beide Dateien:
 *  - works.json: Werk-Metadaten (werk, serie, audio, pdf)
 *  - exhibitions.json: Ausstellungen (venue, dates, works-Liste)
 *
 * 1) Falls eine Ausstellung „current:true“ ist und das Werk enthält → nimm die.
 * 2) Sonst nimm die erste Ausstellung, die das Werk enthält.
 * 3) Falls keine, rendere nur Werkdaten (ohne Venue/Datum).
 */
function findExhibitionForWork(exhibitions, wId) {
  if (!Array.isArray(exhibitions)) return null;

  const inCurrent = exhibitions.find(ex =>
    ex.current && Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === wId.toLowerCase())
  );
  if (inCurrent) return inCurrent;

  const any = exhibitions.find(ex =>
    Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === wId.toLowerCase())
  );
  return any || null;
}

function buildHeaderText(work, exhibition) {
  const venue = exhibition?.venue || "Ausstellungsort";
  const dateText = (exhibition?.title || "Titel") +
                   " · " +
                   (exhibition?.start && exhibition?.end
                     ? `${exhibition.start.replaceAll("-", ".")} — ${exhibition.end.replaceAll("-", ".")}`
                     : "Datum");

  let h2 = "Werk + Serie";
  if (work?.werk && work?.serie) {
    h2 = `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`;
  }
  return { venue, dateText, h2 };
}

/* ================== Rendering ================== */

function wireButtons(work, exhibition) {
  // Audio
  $("#btn-audio").onclick = () => {
    const audioHtml = `
      <audio controls autoplay style="width:100%;height:52px;">
        <source src="${work.audio}" type="audio/mpeg">
        Ihr Browser unterstützt den Audioplayer nicht.
      </audio>
    `;
    openModal("Audiobeschreibung", audioHtml, null);
  };

  // Meine Arbeitsweise (YouTube)
  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe class="video-frame"
                    src="${url}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  // Info Künstler – gleiche Origin im Modal, sonst neuer Tab
  $("#btn-artist").onclick = () => {
    const url = ARTIST_WEBSITE;
    if (isSameOrigin(url)) {
      const html = `<iframe class="video-frame"
                      src="${url}"
                      referrerpolicy="no-referrer"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      window.open(url, "_blank", "noopener");
    }
  };

  // ---------------- PDF (Modal + robuster iOS-Fallback) ----------------
  $("#btn-pdf").onclick = () => {
    const pdfUrl = work.pdf;

    // iOS-Erkennung (inkl. iPadOS im Desktop-Mode)
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) ||
                  (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    // iOS: iframe direkt auf die PDF (voller nativer Viewer)
    // Andere: per <embed> (wie zuvor)
    const viewer = isIOS
      ? `<iframe src="${pdfUrl}#toolbar=1" style="width:100%;height:100%;border:0;"></iframe>`
      : `<embed src="${pdfUrl}#view=FitH&toolbar=1" type="application/pdf" style="width:100%;height:100%;border:0;">`;

    const html = `
      <div style="height:100%;display:flex;flex-direction:column;">
        <div style="flex:1;min-height:0;">${viewer}</div>
      </div>
    `;

    // zeigt oben rechts automatisch den Header-Button „In neuem Tab öffnen“
    openModal("PDF", html, pdfUrl);

    // leiser Erreichbarkeits-Check
    fetch(pdfUrl, { method: "HEAD", cache: "no-store" }).catch(() => {});
  };
}

function renderPage(work, exhibition) {
  const { venue, dateText, h2 } = buildHeaderText(work, exhibition);

  $("#title").textContent = venue;
  $("#sub").textContent   = dateText;
  $("#h2").textContent    = h2;

  // Logo bleibt wie im HTML gesetzt (src via index.html)
  wireButtons(work, exhibition);
}

/* ================== Init ================== */

(async function init() {
  // Modal schließen per Button oder Klick auf den dunklen Hintergrund
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  try {
    // Beide JSONs parallel laden
    const [works, exhibitions] = await Promise.all([
      fetchJSON("works.json"),
      fetchJSON("exhibitions.json").catch(() => null), // exhibitions.json optional
    ]);

    if (!Array.isArray(works)) throw new Error("works.json hat kein Array.");

    // Gewünschtes Werk finden
    const work = works.find(w => (w.id || "").toLowerCase() === workId.toLowerCase());
    if (!work) throw new Error(`Werk '${workId}' nicht gefunden.`);

    // Passende Ausstellung ermitteln (falls vorhanden)
    const exhibition = exhibitions ? findExhibitionForWork(exhibitions, workId) : null;

    renderPage(work, exhibition);
  } catch (err) {
    console.error(err);
    $("#title").textContent = "Fehler beim Laden der Daten.";
    $("#sub").textContent   = "";
    $("#h2").textContent    = "";
  }
})();
