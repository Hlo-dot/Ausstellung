// main.js

document.addEventListener("DOMContentLoaded", () => {
  const exhibitionContainer = document.getElementById("exhibition");
  const modal = document.getElementById("modal");
  const modalContent = document.getElementById("modal-content");
  const closeModalBtn = document.getElementById("close-modal");

  // Dateien laden
  Promise.all([
    fetch("exhibitions.json").then((res) => res.json()),
    fetch("works.json").then((res) => res.json())
  ]).then(([exhibitions, works]) => {
    const currentExhibition = exhibitions.find((ex) => ex.current);

    if (currentExhibition) {
      const title = document.createElement("h2");
      title.textContent = `${currentExhibition.title} · ${currentExhibition.start} — ${currentExhibition.end}`;
      exhibitionContainer.appendChild(title);

      currentExhibition.works.forEach((workId) => {
        const work = works.find((w) => w.id === workId);
        if (!work) return;

        const workDiv = document.createElement("div");
        workDiv.classList.add("work");

        const workTitle = document.createElement("h3");
        workTitle.textContent = `${work.werk} – ein Werk aus der Werkserie „${work.serie}“`;
        workDiv.appendChild(workTitle);

        // Buttons
        if (work.audio) {
          const audioBtn = document.createElement("button");
          audioBtn.textContent = "🎧 Audio";
          audioBtn.addEventListener("click", () => {
            openModal(
              `<audio controls autoplay style="width:100%"><source src="${work.audio}" type="audio/mpeg"></audio>`
            );
          });
          workDiv.appendChild(audioBtn);
        }

        if (work.pdf) {
          const pdfBtn = document.createElement("button");
          pdfBtn.textContent = "📄 PDF anzeigen";
          pdfBtn.addEventListener("click", () => {
            // Hier der Fix für iOS Safari (neue URL-Parameter)
            const PDF_VIEWER = "pdf/web/viewer.html";
            const viewerUrl = `${PDF_VIEWER}?file=${encodeURIComponent(
              work.pdf
            )}#zoom=page-width&view=FitH&page=1&pagemode=none`;

            openModal(
              `<iframe src="${viewerUrl}" style="width:100%;height:82vh;border:none;"></iframe>`
            );
          });
          workDiv.appendChild(pdfBtn);
        }

        exhibitionContainer.appendChild(workDiv);
      });
    }
  });

  // Modal öffnen
  function openModal(content) {
    modalContent.innerHTML = content;
    modal.style.display = "block";
  }

  // Modal schließen
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
    modalContent.innerHTML = "";
  });

  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.style.display = "none";
      modalContent.innerHTML = "";
    }
  });
});
