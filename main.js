/* ================= Einstellungen ================= */

// Künstlerseite: externe Domains werden aus Policy-Gründen im neuen Tab geöffnet.
const ARTIST_WEBSITE = "https://flu.ruhr/uber";
// Stabiler Mehrseiten-Viewer:
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";
// Video-ID für „Meine Arbeitsweise“
const VIDEO_ID = "_Yg0ta6Lk9w";

/* ================= Utilities ================= */

const $  = (sel) => document.querySelector(sel);
const qs = new URLSearchParams(location.search);
const workId = (qs.get("id") || "").trim();

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

/* ============== Exhibition-Merge (wie gehabt) ============== */

function findExhibitionForWork(exhibitions, wId) {
  if (!Array.isArray(exhibitions)) return null;
  const lc = (s) => (s||"").toLowerCase();

  const current = exhibitions.find(ex =>
    ex.current && Array.isArray(ex.works) && ex.works.some(id => lc(id)===lc(wId))
  );
  if (current) return current;

  return exhibitions.find(ex =>
    Array.isArray(ex.works) && ex.works.some(id => lc(id)===lc(wId))
  ) || null;
}

function buildHeaderText(work, exhibition) {
  const pretty = (d) => d ? d.replace(/-/g, ".") : "";
  const venue = exhibition?.venue || "Ausstellungsort";

  let dateLine = "Titel · Datum";
  if (exhibition?.title) {
    if (exhibition?.start && exhibition?.end) {
      dateLine = `${exhibition.title} · ${pretty(exhibition.start)} — ${pretty(exhibition.end)}`;
    } else {
      dateLine = `${exhibition.title}`;
    }
  }

  let h2 = "Werk + Serie";
  if (work?.werk && work?.serie) {
    // typografische Variante wie zuvor
    const serie = work.serie;
    h2 = `${work.werk} – ein Werk aus der Werkserie „${serie}“`;
  }
  return { venue, dateLine, h2 };
}

/* ================= Rendering ================= */

function wireButtons(work) {
  // Audio
  $("#btn-audio").onclick = () => {
    const audioHtml = `
      <audio controls autoplay style="width:100%;height:52px;">
        <source src="${work.audio}" type="audio/mpeg">
        Ihr Browser unterstützt den Audioplayer nicht.
      </audio>`;
    openModal("Audiobeschreibung", audioHtml, null);
  };

  // PDF – **immer über PDF.js** (zeigt alle Seiten, mobil stabil)
  $("#btn-pdf").onclick = () => {
    const viewerUrl = `${PDF_VIEWER}?file=${encodeURIComponent(work.pdf)}#page=1&zoom=page-width`;
    const html = `<iframe class="pdfjs-frame"
                    src="${viewerUrl}"
                    allow="fullscreen"
                    referrerpolicy="no-referrer"></iframe>`;
    openModal("PDF", html, work.pdf);   // Fallback: Original-PDF im neuen Tab
  };

  // Video
  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe class="video-frame"
                    src="${url}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  // Künstlerinfo
  $("#btn-artist").onclick = () => {
    const url = ARTIST_WEBSITE;
    if (isSameOrigin(url)) {
      const html = `<iframe class="video-frame" src="${url}" referrerpolicy="no-referrer"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      // Extern → direkt neuer Tab (CSP/X-Frame-Options)
      window.open(url, "_blank", "noopener");
    }
  };
}

function renderPage(work, exhibition) {
  const { venue, dateLine, h2 } = buildHeaderText(work, exhibition);
  $("#title").textContent = venue;
  $("#sub").textContent   = dateLine;
  $("#h2").textContent    = h2;
}

/* ================= Init ================= */

(async function init() {
  // Modal Closing
  btnClose.onclick = closeModal;
  modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

  try {
    const [works, exhibitions] = await Promise.all([
      fetchJSON("works.json"),
      fetchJSON("exhibitions.json").catch(() => null)
    ]);

    if (!Array.isArray(works)) throw new Error("works.json hat kein Array.");

    const work = works.find(w => (w.id||"").toLowerCase() === workId.toLowerCase());
    if (!work) throw new Error(`Werk '${workId}' nicht gefunden.`);

    const exhibition = exhibitions ? findExhibitionForWork(exhibitions, workId) : null;

    renderPage(work, exhibition);
    wireButtons(work);
  } catch (err) {
    console.error(err);
    $("#title").textContent = "Fehler beim Laden der Daten.";
    $("#sub").textContent   = "";
    $("#h2").textContent    = "";
  }
})();
