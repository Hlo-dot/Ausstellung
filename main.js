/* ================== Einstellungen ================== */

// Externe/Interne Künstler-Seite.
const ARTIST_WEBSITE = "https://flu.ruhr/uber";

// PDF.js Viewer
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";

// YouTube-Video für „Meine Arbeitsweise“
const VIDEO_ID = "_Yg0ta6Lk9w";

/* ================== Utilities ================== */

const $ = (sel) => document.querySelector(sel);

// --- ERSETZT die bisherige Ermittlung von workId ---
// ID aus Query (?id=foo) ODER aus Pfad (/work/foo) auslesen
const pathMatch  = location.pathname.match(/^\/work\/([^\/?#]+)/i);
const idFromPath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
const qs         = new URLSearchParams(location.search);
const workId     = (qs.get("id") || idFromPath || "").trim();
// --- ENDE ERSATZ ---

// absolute URL bauen (verhindert /work/… Relativpfade)
const ABS = (p) => new URL(p, location.origin).href;

const modal    = $("#modal");
const dlgBody  = $("#dlg-body");
const dlgTtl   = $("#dlg-title");
const btnOpen  = $("#dlg-open-new");
const btnClose = $("#dlg-close");

function isSameOrigin(url) {
  try { return new URL(url, location.href).origin === location.origin; }
  catch { return false; }
}

async function fetchJSON(path) {
  const res = await fetch(ABS(path), { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch fehlgeschlagen: ${path}`);
  return res.json();
}

function openModal(title, innerHtml, fallbackUrl) {
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML  = innerHtml;
  modal.classList.add("open");

  if (fallbackUrl) {
    btnOpen.style.display = "inline-flex";
    btnOpen.onclick = () => window.open(fallbackUrl, "_blank", "noopener");
  } else {
    btnOpen.style.display = "none";
  }

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

function findExhibitionForWork(exhibitions, wId) {
  if (!Array.isArray(exhibitions)) return null;

  const needle = (wId || "").toLowerCase();

  const inCurrent = exhibitions.find(ex =>
    ex.current && Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === needle)
  );
  if (inCurrent) return inCurrent;

  const any = exhibitions.find(ex =>
    Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === needle)
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

function wireButtons(work) {
  // Audio
  $("#btn-audio").onclick = () => {
    const audioHtml = `
      <audio controls autoplay style="width:100%;height:52px;">
        <source src="${ABS(work.audio)}" type="audio/mpeg">
        Ihr Browser unterstützt den Audioplayer nicht.
      </audio>
    `;
    openModal("Audiobeschreibung", audioHtml, null);
  };

  // PDF – absoluter Pfad in den Viewer
  $("#btn-pdf").onclick = () => {
    const pdfAbs = ABS(work.pdf);
    const viewerUrl =
      `${PDF_VIEWER}?file=${encodeURIComponent(pdfAbs)}#page=1&zoom=page-width&pagemode=none&view=FitH`;

    const html = `
      <iframe
        class="pdfjs-frame"
        src="${viewerUrl}"
        style="width:100%;height:78vh;border:0;display:block;"
        allow="fullscreen"
        referrerpolicy="no-referrer"
      ></iframe>
    `;
    openModal("PDF", html, pdfAbs);
  };

  // Meine Arbeitsweise (YouTube)
  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe class="video-frame"
                    src="${url}"
                    style="width:100%;height:56.25vw;max-height:70vh;border:0;display:block;"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  // Info Künstler
  $("#btn-artist").onclick = () => {
    const url = ARTIST_WEBSITE;
    if (isSameOrigin(url)) {
      const html = `<iframe class="video-frame"
                      src="${url}"
                      style="width:100%;height:78vh;border:0;display:block;"
                      referrerpolicy="no-referrer"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      window.open(url, "_blank", "noopener");
    }
  };
}

function renderPage(work, exhibition) {
  const { venue, dateText, h2 } = buildHeaderText(work, exhibition);
  $("#title").textContent = venue;
  $("#sub").textContent   = dateText;
  $("#h2").textContent    = h2;
  wireButtons(work);
}

/* ================== Init ================== */

(async function init() {
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  try {
    const [works, exhibitions] = await Promise.all([
      fetchJSON("/works.json"),
      fetchJSON("/exhibitions.json").catch(() => null),
    ]);

    if (!Array.isArray(works)) throw new Error("works.json hat kein Array.");
    const work = works.find(w => (w.id || "").toLowerCase() === workId.toLowerCase());
    if (!work) throw new Error(`Werk '${workId}' nicht gefunden.`);

    const exhibition = exhibitions ? findExhibitionForWork(exhibitions, workId) : null;
    renderPage(work, exhibition);
  } catch (err) {
    console.error(err);
    $("#title").textContent = "Fehler beim Laden der Daten.";
    $("#sub").textContent   = "";
    $("#h2").textContent    = "";
  }
})();
