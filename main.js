// Globale Ausstellung (optional)
const CURRENT_EXHIBITION = {
  ort: "Kunstverein Hattingen – Neue Galerie",
  ausstellung: "Ein Raum aus Spuren",
  datum: "28.09.25 — 26.10.25"
};
// Wenn nix gezeigt werden soll: const CURRENT_EXHIBITION = null;

fetch("works.json")
  .then(res => res.json())
  .then(data => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    const werk = data.find(w => w.id === id);

    if (!werk) {
      document.querySelector(".wrap").innerHTML = "<p>Kein gültiges Werk gefunden.</p>";
      return;
    }

    // Texte
    document.title = `${werk.werk} – Ausstellung`;
    document.getElementById("werkSerie").textContent = werk.serie ? `${werk.werk} – ${werk.serie}` : werk.werk;

    const ortEl = document.getElementById("ort");
    const subEl = document.getElementById("ausstellungDatum");

    if (CURRENT_EXHIBITION) {
      ortEl.textContent = CURRENT_EXHIBITION.ort;
      const parts = [];
      if (CURRENT_EXHIBITION.ausstellung) parts.push(CURRENT_EXHIBITION.ausstellung);
      if (CURRENT_EXHIBITION.datum) parts.push(CURRENT_EXHIBITION.datum);
      subEl.textContent = parts.join(" · ");
    } else {
      ortEl.style.display = "none";
      subEl.style.display = "none";
    }

    // Buttons
    document.getElementById("btn-audio").onclick = () => openModal("Audio", `<audio controls autoplay src="${werk.audio}"></audio>`);
    document.getElementById("btn-pdf").onclick = () => {
      const url = `https://mozilla.github.io/pdf.js/web/viewer.html?file=${encodeURIComponent(werk.pdf)}`;
      openModal("PDF", `<iframe src="${url}"></iframe>`);
    };
    document.getElementById("btn-video").onclick = () => {
      const yt = werk.youtube || "_Yg0ta6Lk9w"; // Fallback-ID
      openModal("Meine Arbeitsweise", `<iframe src="https://www.youtube.com/embed/${yt}?autoplay=1" allow="autoplay; encrypted-media" allowfullscreen></iframe>`);
    };
    document.getElementById("btn-info").onclick = () => {
      openModal("Info Künstler", `<div style="padding:15px"><p>Ulf Obermann-Löwenstein arbeitet unter dem Namen Flu. Sein Ansatz: intuitive Prozessmalerei, Schichtung, Struktur und Stille.</p></div>`);
    };
  });

// Modal
const modal = document.getElementById("mediaModal");
const modalBody = document.getElementById("modalBody");
const modalTitle = document.getElementById("modalTitle");
document.getElementById("closeModal").onclick = closeModal;
modal.addEventListener("click", e => { if (e.target === modal) closeModal(); });

function openModal(title, content) {
  modalTitle.textContent = title;
  modalBody.innerHTML = content;
  modal.classList.add("open");
}
function closeModal() {
  modal.classList.remove("open");
  modalBody.innerHTML = "";
}
