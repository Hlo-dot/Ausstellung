/* ================== Einstellungen ================== */

const ARTIST_WEBSITE = "https://flu.ruhr/uber";
const PDF_VIEWER = "https://mozilla.github.io/pdf.js/web/viewer.html";
const VIDEO_ID = "_Yg0ta6Lk9w";
const ART_STRIPS = {
  "tafel1": "/artstrips/Tafel1-horizontal.jpg",
  "montan": "/artstrips/montan-horizontal.jpg",
  "bodenproben": "/artstrips/Bodenproben-horizontal.jpg",
  "funde": "/artstrips/Funde-horizontal.jpg",
  "feuerschacht": "/artstrips/Feuerschacht-horizontal.jpg",
  "glutkern": "/artstrips/Glutkern-horizontal.jpg",
  "feuer": "/artstrips/Feuer-horizontal.jpg",
  "kernbruch": "/artstrips/Kernbruch-horizontal.jpg",
  "schicht": "/artstrips/Schicht-horizontal.jpg",
  "lichtachse": "/artstrips/lichtachse-horizontal.jpg",
  "goldene-schwelle": "/artstrips/Goldene-Schwelle-horizontal.jpg",
  "der-moment-eingefroren": "/artstrips/der-moment-eingefroren-horizontal.jpg",
  "resonanzkern": "/artstrips/resonanzkern-horizontal.jpg",
  "jenseits-der-grenzen": "/artstrips/jenseits-der-grenzen-horizontal.jpg",
};

/* ================== Utilities ================== */

const $ = (sel) => document.querySelector(sel);

const pathMatch  = location.pathname.match(/^\/work\/([^\/?#]+)/i);
const idFromPath = pathMatch ? decodeURIComponent(pathMatch[1]) : null;
const qs         = new URLSearchParams(location.search);
const workId     = (qs.get("id") || idFromPath || "").trim();

const modal    = $("#modal");
const dlgBody  = $("#dlg-body");
const dlgTtl   = $("#dlg-title");
const btnOpen  = $("#dlg-open-new");
const btnClose = $("#dlg-close");

function asRoot(url){
  if (!url) return url;
  return url.startsWith("/") ? url : "/" + url;
}

function isSameOrigin(url) {
  try { return new URL(url, location.href).origin === location.origin; }
  catch { return false; }
}

async function fetchJSON(path) {
  const res = await fetch(asRoot(path), { cache: "no-store" });
  if (!res.ok) throw new Error(`Fetch fehlgeschlagen: ${path}`);
  return res.json();
}

/* ================== Modal ================== */

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

/* ================== Daten und Texte ================== */

function findExhibitionForWork(exhibitions, wId) {
  if (!Array.isArray(exhibitions)) return null;

  const inCurrent = exhibitions.find(ex =>
    ex.current && Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === wId.toLowerCase())
  );
  if (inCurrent) return inCurrent;

  return exhibitions.find(ex =>
    Array.isArray(ex.works) &&
    ex.works.some(id => (id || "").toLowerCase() === wId.toLowerCase())
  ) || null;
}

function formatIsoDate(iso) {
  if (typeof iso !== "string") return "";
  const m = iso.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return iso;
  const [_, y, mo, d] = m;
  return `${d}.${mo}.${y}`;
}

function workClassification(work) {
  const series = (work?.serie || "").trim();

  if ((work?.id || "").toLowerCase() === "tafel1") {
    return "Einführung zur Ausstellung";
  }
  if (!series) return "";
  if (series.toLowerCase() === "einzelwerk") return "Einzelwerk";
  return `Werkserie „${series}“`;
}

function workTheme(work) {
  const series = (work?.serie || "").trim().toLowerCase();
  if (series === "grenzzeit") return "grenzzeit";
  if (series === "was bleibt") return "was-bleibt";
  if (series === "grünzeug" || series === "gruenzeug") return "gruenzeug";
  if (series === "geometrien der stille") return "geometrien";
  if (series === "nebelräume" || series === "nebelraeume" || series === "nebelräume") return "nebelraeume";
  return "neutral";
}

function buildHeaderText(work, exhibition) {
  const venue = exhibition?.venue || "Ausstellungsort";
  const exhibitionTitle = exhibition?.title || "Ausstellung";

  let dateText = "";
  if (exhibition?.start && exhibition?.end) {
    dateText = `${formatIsoDate(exhibition.start)}\u202F—\u202F${formatIsoDate(exhibition.end)}`;
  }

  return {
    venue,
    exhibitionTitle,
    dateText,
    workTitle: (work?.id || "").toLowerCase() === "tafel1"
      ? exhibitionTitle
      : (work?.werk || "Werk"),
    workMeta: workClassification(work),
    theme: workTheme(work),
  };
}

/* ================== Rendering ================== */

function wireButtons(work) {
  const audioButton = $("#btn-audio");
  const audioSubtitle = $("#audio-subtitle");
  const idleSubtitle = audioSubtitle.textContent;
  const audio = new Audio(asRoot(work.audio));
  let animationFrame = null;

  audio.preload = "metadata";
  audioButton.style.setProperty("--audio-progress", "0%");
  audioButton.setAttribute("aria-pressed", "false");

  function renderAudioProgress() {
    const progress = Number.isFinite(audio.duration) && audio.duration > 0
      ? Math.min(100, (audio.currentTime / audio.duration) * 100)
      : 0;
    audioButton.style.setProperty("--audio-progress", `${progress}%`);

    if (!audio.paused && !audio.ended) {
      animationFrame = requestAnimationFrame(renderAudioProgress);
    }
  }

  function setAudioState(state) {
    audioButton.dataset.audioState = state;
    audioButton.setAttribute("aria-pressed", state === "playing" ? "true" : "false");
    audioSubtitle.textContent = state === "playing"
      ? "Zum Pausieren tippen"
      : state === "finished"
        ? "Noch einmal anhören"
        : state === "paused"
          ? "Zum Fortsetzen tippen"
          : idleSubtitle;
  }

  audioButton.onclick = async () => {
    if (audio.ended) {
      audio.currentTime = 0;
      audioButton.style.setProperty("--audio-progress", "0%");
    }

    if (audio.paused) {
      try {
        await audio.play();
        setAudioState("playing");
        cancelAnimationFrame(animationFrame);
        renderAudioProgress();
      } catch (err) {
        console.error(err);
        setAudioState("idle");
        audioSubtitle.textContent = "Audio konnte nicht gestartet werden";
      }
    } else {
      audio.pause();
      cancelAnimationFrame(animationFrame);
      renderAudioProgress();
      setAudioState("paused");
    }
  };

  audio.addEventListener("ended", () => {
    cancelAnimationFrame(animationFrame);
    audioButton.style.setProperty("--audio-progress", "100%");
    setAudioState("finished");
  });

  audio.addEventListener("error", () => {
    cancelAnimationFrame(animationFrame);
    setAudioState("idle");
    audioSubtitle.textContent = "Audio konnte nicht geladen werden";
  });

  $("#btn-pdf").onclick = () => {
    const pdfUrl = asRoot(work.pdf);
    const fileParam = encodeURIComponent(location.origin + pdfUrl);
    const viewerUrl = `${PDF_VIEWER}?file=${fileParam}#page=1&zoom=page-width&pagemode=none&view=FitH`;
    const html = `
      <iframe class="pdfjs-frame"
              src="${viewerUrl}"
              allow="fullscreen"
              referrerpolicy="no-referrer"></iframe>`;
    openModal("Werktext", html, pdfUrl);
  };

  $("#btn-video").onclick = () => {
    const url = `https://www.youtube-nocookie.com/embed/${VIDEO_ID}?autoplay=1&playsinline=1&rel=0&modestbranding=1`;
    const html = `
      <iframe class="video-frame"
              src="${url}"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowfullscreen></iframe>`;
    openModal("Meine Arbeitsweise", html, `https://youtu.be/${VIDEO_ID}`);
  };

  $("#btn-artist").onclick = () => {
    const url = ARTIST_WEBSITE;
    if (isSameOrigin(url)) {
      const html = `<iframe class="pdfjs-frame" src="${url}" referrerpolicy="no-referrer"></iframe>`;
      openModal("Über den Künstler", html, url);
    } else {
      window.open(url, "_blank", "noopener");
    }
  };
}

function renderPage(work, exhibition) {
  const text = buildHeaderText(work, exhibition);
  $(".wrap").dataset.theme      = text.theme;
  $("#venue").textContent       = text.venue;
  $("#exhibition").textContent  = text.exhibitionTitle;
  $("#sub").textContent         = text.dateText;
  $("#work-meta").textContent   = text.workMeta;
  $("#work-title").textContent  = text.workTitle;
  const artStrip = $("#art-strip");
  const artStripImage = $("#art-strip-image");
  const isIntroduction = (work?.id || "").toLowerCase() === "tafel1";
  const artStripUrl = ART_STRIPS[(work?.id || "").toLowerCase()];
  artStrip.classList.toggle("art-strip--intro", isIntroduction);
  $(".wrap").classList.toggle("is-introduction", isIntroduction);
  $("#audio-title").textContent = isIntroduction ? "Einführung anhören" : "Audiobeschreibung";
  $("#audio-subtitle").textContent = isIntroduction ? "Zur Ausstellung" : "Das Werk hören";
  $("#pdf-label").textContent = isIntroduction ? "Ausstellungstext lesen" : "Werktext lesen";
  if (artStripUrl) {
    artStripImage.src = artStripUrl;
    artStrip.hidden = false;
  } else {
    artStripImage.removeAttribute("src");
    artStrip.hidden = true;
  }
  $("#copyright-year").textContent = new Date().getFullYear();
  document.title = `${text.workTitle} – ${text.venue}`;
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
    $("#venue").textContent = "Fehler beim Laden der Daten";
    $("#exhibition").textContent = "";
    $("#sub").textContent = "";
    $("#work-meta").textContent = "";
    $("#work-title").textContent = "";
    $("#copyright-year").textContent = new Date().getFullYear();
  }
})();
