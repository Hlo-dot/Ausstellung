/* ================== Einstellungen ================== */

// Externe/Interne Künstler-Seite
const ARTIST_WEBSITE = "https://flu.ruhr/uber";

// PDF.js Viewer
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";

// YouTube-Video für „Meine Arbeitsweise“
const VIDEO_ID = "_Yg0ta6Lk9w";

/* ================== Utilities ================== */

const $ = (sel) => document.querySelector(sel);

// ID aus Query (?id=foo) ODER aus Pfad (/work/foo) ermitteln
function getWorkId() {
  const qs = new URLSearchParams(location.search);
  const fromQuery = (qs.get("id") || "").trim();
  if (fromQuery) return fromQuery;

  // /work/foo oder /work/foo/
  const m = location.pathname.match(/^\/work\/([^\/?#]+)\/?$/i);
  return m ? decodeURIComponent(m[1]) : "";
}
const workId = getWorkId();

// Modal-Referenzen
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
  const res = await fetch(path, { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch fehlgeschlagen: ${path}`);
  return res.json();
}

function openModal(title, innerHtml, fallbackUrl) {
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML  = innerHtml;
  modal.classList.add("open");

  // „In neuem Tab öffnen“ nur zeigen, wenn wir eine Fallback-URL haben
  if (fallbackUrl) {
    btnOpen.style.display = "inline-flex";
    btnOpen.onclick = () => window.open(fallbackUrl, "_blank", "noopener");
  } else {
    btnOpen.style.display = "none";
  }

  // Lade-Guard für iFrames (falls fremde Seite blockt)
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

// Ausstellung finden, die das Werk enthält (current bevorzugt)
function findExhibitionForWork(exhibitions, wId) {
  if (!Array.isArray(exhibitions)) return null;

  const idEq = (id) => (id || "").toLowerCase() === (wId || "").toLowerCase();

  const inCurrent = exhibitions.find(ex =>
    ex.current && Array.isArray(ex.works) && ex.works.some(idEq)
  );
  if (inCurrent) return inCurrent;

  const any = exhibitions.find(ex =>
    Array.isArray(ex.works) && ex.works.some(idEq)
  );
  return any || null;
}

// ISO „YYYY-MM-DD“ -> „YYYY.MM.DD“
function formatIsoDate(iso) {
  if (typeof iso !== "string") return "";
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  return m ? `${m[1]}.${m[2]}.${m[3]}` : iso;
}

function buildHeaderText(work, exhibition) {
  const venue = exhibition?.venue || "Ausstellungsort";
  const title = exhibition?.title || "Titel";

  let datePart = "Datum";
  if (exhibition?.start && exhibition?.end) {
    datePart = `${formatIsoDate(exhibition.start)} — ${formatIsoDate(exhibition.end)}`;
  }
  const dateText = `${title} · ${datePart}`;

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
        <source src="${work.audio}" type="audio/mpeg">
        Ihr Browser unterstützt den Audioplayer nicht.
      </audio>
    `;
    openModal("Audiobeschreibung", audioHtml, null);
  };

  // PDF (PDF.js)
  $("#btn-pdf").onclick = () => {
    const viewerUrl =
      `${PDF_VIEWER}?file=${encodeURIComponent(work.pdf)}#page=1&zoom=page-width&pagemode=none&view=FitH`;
    const html = `
      <iframe
        class="pdfjs-frame"
        src="${viewerUrl}"
        style="width:100%;height:78vh;border:0;display:block;"
        allow="fullscreen"
        referrerpolicy="no-referrer"
      ></iframe>
    `;
    openModal("PDF", html, work.pdf);
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
  // Modal schließen
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  try {
    if (!workId) throw new Error("Keine Werk-ID in URL gefunden.");

    const [works, exhibitions] = await Promise.all([
      fetchJSON("works.json"),
      fetchJSON("exhibitions.json").catch(() => null),
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
