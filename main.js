// Hilfsfunktionen für Modals
function openModal(el) {
  el.classList.add("open");
  document.body.style.overflow = "hidden";
  el.setAttribute("aria-hidden", "false");
}
function closeModal(el) {
  el.classList.remove("open");
  document.body.style.overflow = "";
  el.setAttribute("aria-hidden", "true");
}

// Buttons
const btnAudio = document.getElementById("btn-audio");
const btnPdf   = document.getElementById("btn-pdf");
const btnVideo = document.getElementById("btn-video");
const btnInfo  = document.getElementById("btn-info");

// Modals
const audioModal = document.getElementById("audioModal");
const pdfModal   = document.getElementById("pdfModal");
const videoModal = document.getElementById("videoModal");
const infoModal  = document.getElementById("infoModal");

// Close-Buttons
const closeAudio = document.getElementById("closeAudio");
const closePdf   = document.getElementById("closePdf");
const closeVideo = document.getElementById("closeVideo");
const closeInfo  = document.getElementById("closeInfo");

// Audio Player
const audioPlayer = document.getElementById("audioPlayer");

// PDF Frame
const pdfFrame = document.getElementById("pdfFrame");
const pdfTitle = document.getElementById("pdfTitle");
const pdfNewTab = document.getElementById("pdfNewTab");

// Video Frame
const videoFrame = document.getElementById("videoFrame");

// Info Body
const infoBody = document.getElementById("infoBody");

// Beispiel-Künstlertext
const INFO_HTML = `
  <h3>Ulf Obermann-Löwenstein (Flu)</h3>
  <p>arbeitet in Serien zwischen Struktur und Stille. 
  Seine Arbeiten erforschen Material, Spur und Resonanzräume. 
  Weitere Infos unter 
  <a href="https://www.flu.ruhr" target="_blank" rel="noopener">flu.ruhr</a>.
  </p>`;

// Events
btnAudio?.addEventListener("click", () => {
  if (!window.CURRENT_WORK) return;
  audioPlayer.src = window.CURRENT_WORK.audio;
  openModal(audioModal);
});
closeAudio?.addEventListener("click", () => { audioPlayer.pause(); closeModal(audioModal); });
audioModal?.addEventListener("click", (e) => { if (e.target === audioModal) { audioPlayer.pause(); closeModal(audioModal);} });

btnPdf?.addEventListener("click", () => {
  if (!window.CURRENT_WORK) return;
  const pdfAbs = new URL(window.CURRENT_WORK.pdf, window.location.origin).href;
  const viewer = "https://mozilla.github.io/pdf.js/web/viewer.html?file=" + encodeURIComponent(pdfAbs) + "#zoom=page-width";
  pdfFrame.src = viewer;
  pdfTitle.textContent = "PDF: " + window.CURRENT_WORK.werk;
  pdfNewTab.href = pdfAbs;
  openModal(pdfModal);
});
closePdf?.addEventListener("click", () => { pdfFrame.src = ""; closeModal(pdfModal); });
pdfModal?.addEventListener("click", (e) => { if (e.target === pdfModal) { pdfFrame.src=""; closeModal(pdfModal);} });

btnVideo?.addEventListener("click", () => {
  // Fester YouTube-Link
  videoFrame.src = "https://www.youtube.com/embed/_Yg0ta6Lk9w?autoplay=1";
  openModal(videoModal);
});
closeVideo?.addEventListener("click", () => { videoFrame.src=""; closeModal(videoModal); });
videoModal?.addEventListener("click", (e) => { if (e.target === videoModal) { videoFrame.src=""; closeModal(videoModal);} });

btnInfo?.addEventListener("click", () => {
  infoBody.innerHTML = INFO_HTML;
  openModal(infoModal);
});
closeInfo?.addEventListener("click", () => closeModal(infoModal));
infoModal?.addEventListener("click", (e) => { if (e.target === infoModal) closeModal(infoModal); });

// Dummy: Aktuelles Werk (zum Test)
window.CURRENT_WORK = {
  werk: "Montan",
  audio: "audio/montan.mp3",
  pdf: "pdf/montan.pdf"
};
