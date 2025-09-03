async function loadData() {
  try {
    const [worksRes, exhibitionsRes] = await Promise.all([
      fetch('works.json'),
      fetch('exhibitions.json')
    ]);
    const works = await worksRes.json();
    const exhibitions = await exhibitionsRes.json();

    const params = new URLSearchParams(window.location.search);
    const werkId = params.get("id");
    const werk = works.find(w => w.id === werkId);

    if (werk) {
      const exhibition = exhibitions.find(e => e.id === werk.exhibitionId);
      document.title = werk.ort + " – " + werk.werk;
      document.getElementById("ort").textContent = exhibition.ort;
      document.getElementById("ausstellungDatum").textContent = exhibition.titel + " · " + exhibition.datum;
      document.getElementById("werkSerie").textContent = werk.werk + " – ein Werk aus der Werkserie „" + werk.serie + "“";
      document.getElementById("audio-link").href = werk.audio;
      document.getElementById("audio-src").src = werk.audio;
      document.getElementById("player").load();

      const pdfUrl = location.origin + "/" + werk.pdf;
      const viewerUrl = "https://mozilla.github.io/pdf.js/web/viewer.html?file=" + encodeURIComponent(pdfUrl);
      document.getElementById("pdfFrame").src = viewerUrl;
      document.getElementById("pdfNewTab").href = werk.pdf;
      document.getElementById("pdfTitle").textContent = "PDF: " + werk.werk;
    } else {
      document.querySelector(".wrap").innerHTML = "<p>Kein gültiges Werk gefunden.</p>";
    }

    const modal = document.getElementById('pdfModal');
    const openBtn = document.getElementById('pdf-link');
    const closeBtn = document.getElementById('closePdf');

    openBtn.addEventListener('click', () => {
      modal.classList.add('open');
      modal.setAttribute('aria-hidden','false');
      document.body.style.overflow='hidden';
    });

    closeBtn.addEventListener('click', () => {
      modal.classList.remove('open');
      modal.setAttribute('aria-hidden','true');
      document.body.style.overflow='';
    });

    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.remove('open');
        modal.setAttribute('aria-hidden','true');
        document.body.style.overflow='';
      }
    });
  } catch (err) {
    document.querySelector(".wrap").innerHTML = "<p>Fehler beim Laden der Daten.</p>";
    console.error(err);
  }
}

loadData();
