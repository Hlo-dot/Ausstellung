// ---- Einstellungen -------------------------------------------------
const ARTIST_WEBSITE = "https://www.flu.ruhr/uber.html";     // im Modal öffnen
const YT_VIDEO_ID    = "_Yg0ta6Lk9w";              // "Meine Arbeitsweise" (optional)

// ---- Hilfen --------------------------------------------------------
const $ = sel => document.querySelector(sel);
const pad = n => String(n).padStart(2, "0");
const fmt = (iso) => {
  const d = new Date(iso + "T00:00:00");
  return `${pad(d.getDate())}.${pad(d.getMonth()+1)}.${d.getFullYear().toString().slice(2)}`;
};

// ---- Modal ---------------------------------------------------------
const modal   = $("#modal");
const dlgBody = $("#dlg-body");
const dlgTtl  = $("#dlg-title");
$("#dlg-close").addEventListener("click", closeModal);
modal.addEventListener("click", (e) => { if (e.target === modal) closeModal(); });

function openModal(title, node) {
  dlgTtl.textContent = title;
  dlgBody.innerHTML = "";
  dlgBody.append(node);
  modal.classList.add("open");
  modal.setAttribute("aria-hidden","false");
}
function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden","true");
  // laufende Medien stoppen
  dlgBody.querySelectorAll("video,audio").forEach(m => { try { m.pause(); } catch {} });
  dlgBody.innerHTML = "";
}

// ---- Daten laden & Seite füllen -----------------------------------
(async function init() {
  const params = new URLSearchParams(location.search);
  const id = (params.get("id") || "").trim();

  // Daten laden
  const [works, exhibitions] = await Promise.all([
    fetch("works.json").then(r => r.json()),
    fetch("exhibitions.json").then(r => r.json())
  ]);

  // Werk suchen
  const work = works.find(w => w.id.toLowerCase() === id.toLowerCase());
  if (!work) {
    $("#venue").textContent   = "Werk nicht gefunden";
    $("#subtitle").textContent = "Bitte ?id=… in der URL prüfen.";
    $("#caption").textContent  = "";
    disableButtons();
    return;
  }

  // Ausstellung finden (current:true ODER die dieses Werk enthält)
  let ex = exhibitions.find(e => e.current) ||
           exhibitions.find(e => Array.isArray(e.works) && e.works.includes(work.id));
  // Fallback: leere Ausstellung, damit UI nicht leer ist
  if (!ex) ex = { title:"", venue:"", start:"", end:"" };

  // Headline füllen
  $("#venue").textContent = ex.venue || "Ausstellungsort";
  if (ex.start && ex.end) {
    $("#subtitle").textContent = `${ex.title} · ${fmt(ex.start)} — ${fmt(ex.end)}`;
  } else {
    $("#subtitle").textContent = ex.title || "Titel · Datum";
  }
  $("#caption").textContent = `${work.werk} — ein Werk aus der Werkserie „${work.serie.replace(/^Ein(?:\s+Werk\s+aus\s+der\s+Serie\s+)?/i,"").trim()}“`;

  // Buttons verdrahten
  // AUDIO
  $("#btn-audio").onclick = () => {
    const wrap = document.createElement("div");
    wrap.className = "audio-wrap";
    const a = document.createElement("audio");
    a.controls = true;
    a.src = work.audio;
    wrap.append(a);
    openModal("Audiobeschreibung", wrap);
    // Autoplay beim Öffnen (erfolgt nach Benutzerklick → iOS erlaubt)
    setTimeout(() => { a.play().catch(()=>{}); }, 50);
  };

  // PDF
  $("#btn-pdf").onclick = () => {
    const f = document.createElement("iframe");
    f.className = "pdf-frame";
    f.src = work.pdf; // gleiches Origin → funktioniert im Iframe
    openModal("PDF", f);
  };

  // Meine Arbeitsweise (YouTube)
  $("#btn-video").onclick = () => {
    const f = document.createElement("iframe");
    f.className = "web-frame";
    f.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
    f.referrerPolicy = "no-referrer";
    f.src = `https://www.youtube-nocookie.com/embed/${YT_VIDEO_ID}?autoplay=1&playsinline=1&rel=0`;
    openModal("Meine Arbeitsweise", f);
  };

  // Info Künstler (Webseite als Modal)
  $("#btn-artist").onclick = () => {
    const f = document.createElement("iframe");
    f.className = "web-frame";
    f.sandbox = "allow-same-origin allow-scripts allow-forms allow-popups";
    f.referrerPolicy = "no-referrer";
    f.src = ARTIST_WEBSITE;
    openModal("Über den Künstler", f);
  };
})().catch(err => {
  console.error(err);
  $("#venue").textContent = "Fehler beim Laden";
  $("#subtitle").textContent = "Bitte Verbindung oder JSON-Dateien prüfen.";
  disableButtons();
});

function disableButtons(){
  ["#btn-audio","#btn-pdf","#btn-video","#btn-artist"].forEach(sel=>{
    const b = $(sel); if (b) { b.disabled = true; b.style.opacity = .4; }
  });
}
