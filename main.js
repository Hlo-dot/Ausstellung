/* =============== Einstellungen =============== */

// Künstler-Website (intern -> im Modal; extern -> neuer Tab, mit Auto-Fallback)
const ARTIST_WEBSITE = "https://flu.ruhr/uber";

// Video (Meine Arbeitsweise)
const VIDEO_ID = "_Yg0ta6Lk9w";

// PDF-Viewer (PDF.js)
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";

/* =============== Utilities =============== */

const $  = (sel) => document.querySelector(sel);
const qs = new URLSearchParams(location.search);
const workId = (qs.get("id") || "").trim();

const modal    = $("#modal");
const dlgTtl   = $("#dlg-title");
const dlgBody  = $("#dlg-body");
const btnOpen  = $("#dlg-open-new");
const btnClose = $("#dlg-close");

// Hilfsfunktion: Button sicher belegen (wenn vorhanden)
function on(id, handler) {
  const el = document.getElementById(id);
  if (el) el.onclick = handler;
}

function openModal(title, innerHtml, fallbackUrl) {
  if (!modal || !dlgBody || !dlgTtl) return;
  dlgTtl.textContent = title || "";
  dlgBody.innerHTML = innerHtml;
  modal.classList.add("open");

  // Fallback (iframe blockiert)
  const iframe = dlgBody.querySelector("iframe");
  if (iframe && fallbackUrl) {
    let loaded = false;
    iframe.addEventListener("load", () => { loaded = true; }, { once: true });
    setTimeout(() => {
      if (!loaded) {
        modal.classList.remove("open");
        window.open(fallbackUrl, "_blank", "noopener");
      }
    }, 1500);
  }

  // „In neuem Tab öffnen“ nur zeigen, wenn sinnvoll
  if (btnOpen) {
    if (fallbackUrl) {
      btnOpen.style.display = "inline-flex";
      btnOpen.onclick = () => window.open(fallbackUrl, "_blank", "noopener");
    } else {
      btnOpen.style.display = "none";
      btnOpen.onclick = null;
    }
  }
}

function closeModal() {
  if (!modal || !dlgBody) return;
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
  const title = $("#title");
  const sub   = $("#sub");
  const h2    = $("#h2");

  if (title) title.textContent = work.venue || "Ausstellungsort";
  if (sub)   sub.textContent   = work.exhibition
    ? `${work.exhibition} · ${work.date || ""}`.trim()
    : "Titel · Datum";
  if (h2)    h2.textContent    = (work.werk && work.serie)
    ? `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`
    : (work.werk || "Werk + Serie");

  // Audio (im Modal, Autoplay durch Button-Klick)
  on("btn-audio", () => {
    const audioHtml = `
      <audio controls autoplay style="width:100%;height:52px;">
        <source src="${work.audio}" type="audio/mpeg">
        Ihr Browser unterstützt den Audioplayer nicht.
      </audio>`;
    openModal("Audiobeschreibung", audioHtml, null);
  });

  // PDF (Modal + Fallback-Button)
  on("btn-pdf", () => {
    const viewerUrl = `${PDF_VIEWER}?file=${encodeURIComponent(work.pdf)}#zoom=page-width`;
    const html = `<iframe class="pdfjs-frame" src="${viewerUrl}" allow="fullscreen" referrerpolicy="no-referrer"></iframe>`;
    openModal("PDF", html, work.pdf);
  });

  // Meine Arbeitsweise (YouTube, Autoplay)
  on("btn-video", () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `<iframe class="video-frame"
                    src="${url}"
                    allow="autoplay; encrypted-media; picture-in-picture"
                    allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  });

  // Info Künstler (same-origin -> Modal; extern -> neuer Tab)
  on("btn-artist", () => {
    const url = ARTIST_WEBSITE;
    let isSameOrigin = false;
    try { isSameOrigin = new URL(url, location.href).origin === location.origin; } catch {}

    if (isSameOrigin) {
      const html = `<iframe class="video-frame" src="${url}" referrerpolicy="no-referrer"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      // extern: zuverlässig im neuen Tab (Modal wird von CSP/XFO oft geblockt)
      window.open(url, "_blank", "noopener");
    }
  });
}

/* =============== Init =============== */

document.addEventListener("DOMContentLoaded", async () => {
  // Modal-Interaktion
  if (btnClose) btnClose.onclick = closeModal;
  if (modal) modal.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
  });

  try {
    const works = await loadWorks();
    const work = works.find(w => (w.id || "").toLowerCase() === workId.toLowerCase());
    if (!work) throw new Error("Werk nicht gefunden");
    render(work);
  } catch (e) {
    console.error(e);
    const title = $("#title");
    if (title) title.textContent = "Fehler beim Laden der Daten.";
  }
});
