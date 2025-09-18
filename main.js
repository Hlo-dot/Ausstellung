// ---------------- Einstellungen ----------------
const ARTIST_WEBSITE = "https//:flu.ruhr"; // lokal einbetten (empfohlen). Externe Seiten blocken oft Iframes.
const YT_VIDEO_ID    = "_Yg0ta6Lk9w";    // „Meine Arbeitsweise“

// ---------------- Utilities --------------------
const $  = sel => document.querySelector(sel);
const qs = new URLSearchParams(location.search);
const ID = (qs.get("id") || "").trim();

const modal     = $("#modal");
const dlgBody   = $("#dlg-body");
const dlgTitle  = $("#dlg-title");
const dlgOpen   = $("#dlg-open-new");
const dlgClose  = $("#dlg-close");

function openModal(title, node) {
  dlgTitle.textContent = title || "";
  dlgBody.innerHTML = "";
  dlgBody.append(node);
  // Standard: Fallback-Link verbergen (wird nur beim PDF eingeblendet)
  dlgOpen.style.display = "none";
  dlgOpen.removeAttribute("href");

  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
  document.body.style.overflow = "hidden";
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  document.body.style.overflow = "";
  // Medien stoppen & Inhalt räumen
  dlgBody.querySelectorAll("audio,video,iframe,embed").forEach(el => {
    try { if (el.tagName === "AUDIO" || el.tagName === "VIDEO") el.pause(); } catch {}
  });
  dlgBody.innerHTML = "";
}

dlgClose.addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

// ---------------- Daten laden ------------------
(async function init() {
  let works = [];
  try {
    const res = await fetch("works.json", { cache: "no-store" });
    works = await res.json();
  } catch {
    showFatal("Daten konnten nicht geladen werden (works.json).");
    return;
  }

  // Werk finden
  const work = works.find(w => (w.id || "").toLowerCase() === ID.toLowerCase());
  if (!work) {
    showFatal("Kein gültiges Werk gefunden. (?id=...)");
    return;
  }
  window.CURRENT_WORK = work; // optional global

  // Ausstellung versuchen (optional)
  let ex = null;
  try {
    const rx = await fetch("exhibitions.json", { cache: "no-store" });
    if (rx.ok) {
      const exhibitions = await rx.json();
      ex = exhibitions.find(e => e.current) ||
           exhibitions.find(e => Array.isArray(e.works) && e.works.includes(work.id));
    }
  } catch { /* egal – optional */ }

  // Kopf befüllen
  $("#venue").textContent   = ex?.venue || "Ausstellungsort";
  $("#subtitle").textContent = ex?.title
    ? (ex.start && ex.end ? `${ex.title} · ${formatDate(ex.start)} — ${formatDate(ex.end)}` : ex.title)
    : "Titel · Datum";
  $("#caption").textContent = work.serie
    ? `${work.werk} – ein Werk aus der Werkserie „${cleanupSerie(work.serie)}“`
    : (work.werk || "");

  // ---------------- Buttons verdrahten ----------------

  // Audio
  $("#btn-audio").onclick = () => {
    const wrap = document.createElement("div");
    wrap.className = "audio-wrap";
    const audio = document.createElement("audio");
    audio.controls = true;
    audio.preload = "metadata";
    audio.src = work.audio;
    wrap.append(audio);
    openModal("Audiobeschreibung", wrap);
    // Autoplay nach User-Geste (Modalöffnung) → iOS erlaubt
    setTimeout(() => audio.play().catch(()=>{}), 60);
  };

  // PDF (PDF.js Viewer im Iframe) + Fallback-Link
  $("#btn-pdf").onclick = () => {
    const pdfAbs = new URL(work.pdf, location.origin).href;
    const viewer = "https://mozilla.github.io/pdf.js/web/viewer.html?file=" +
                   encodeURIComponent(pdfAbs) + "#zoom=page-width";
    const iframe = document.createElement("iframe");
    iframe.className = "pdf-frame";
    iframe.setAttribute("allow", "fullscreen");
    iframe.src = viewer;

    openModal(`PDF: ${work.werk}`, iframe);

    // Fallback-Link (neuer Tab)
    dlgOpen.style.display = "";
    dlgOpen.href = pdfAbs;
  };

  // Meine Arbeitsweise (YouTube im Modal) – mit Autoplay-Fix
  $("#btn-video").onclick = () => {
    // YouTube-URL mit JS-API
    const ytUrl =
      `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}` +
      `?autoplay=1&playsinline=1&rel=0&modestbranding=1&mute=0&enablejsapi=1`;

    const iframe = document.createElement("iframe");
    iframe.id = "ytFrame";
    iframe.className = "web-frame";
    iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    iframe.referrerPolicy = "no-referrer";
    iframe.src = ytUrl;

    openModal("Meine Arbeitsweise", iframe);

    // Autoplay erzwingen per JS-API
    const playCmd = () => {
      try {
        iframe.contentWindow.postMessage(
          JSON.stringify({ event: "command", func: "playVideo", args: [] }),
          "*"
        );
      } catch {}
    };
    iframe.addEventListener("load", () => setTimeout(playCmd, 100));
    modal.addEventListener("click", playCmd, { once: true });
  };

  // Info Künstler (lokale HTML im Modal)
  $("#btn-artist").onclick = () => {
    const iframe = document.createElement("iframe");
    iframe.className = "web-frame";
    iframe.referrerPolicy = "no-referrer";
    iframe.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups";
    iframe.src = ARTIST_WEBSITE;
    openModal("Über den Künstler", iframe);
  };
})();

// ---------------- Helpers ----------------------
function showFatal(msg) {
  $(".wrap").innerHTML = `<p style="color:#b00020;font-weight:700">${msg}</p>`;
}
function cleanupSerie(txt="") {
  return txt.replace(/^Ein\s+Werk\s+aus\s+der\s+Serie\s+/i, "").trim();
}
function formatDate(iso) {
  const [y,m,d] = iso.split("-").map(n => parseInt(n,10));
  return `${String(d).padStart(2,"0")}.${String(m).padStart(2,"0")}.${String(y).slice(2)}`;
}
